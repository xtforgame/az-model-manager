# az-model-manager — 上游 Bug 清單

> 套件：`az-model-manager`（在 `node_modules/az-model-manager/`）
> 發現日期：2026-04-29
> 狀態：未修復，等找時間 PR 上游

---

## Bug #1：`getAddIndexQuery` 沒傳 `unique` flag → 產出的 SQL 永遠不是 UNIQUE INDEX

### 影響

`yarn sr sc`（schema compare）對於缺少的 unique index，會輸出**沒有 UNIQUE 關鍵字**的 SQL：

```sql
-- 實際輸出（錯誤）
CREATE INDEX "popup_transfer_request_event_serial_unique" ON "tbl_popup_transfer_request" ("event_id", "serial_number");

-- 應該輸出
CREATE UNIQUE INDEX "popup_transfer_request_event_serial_unique" ON "tbl_popup_transfer_request" ("event_id", "serial_number");
```

如果使用者直接複製這段 SQL 跑進 DB，就會建立**普通 index 而非 unique index**。後續 `sc` 比對時會持續報「缺少」，因為比對邏輯依 `isUnique` 判斷一致性（見下方比對邏輯）。

### 重現條件

1. 在 plugin 的 `getJsonSchema()` 為某 model 加 unique index：
   ```ts
   options: {
     indexes: [{
       name: 'foo_unique',
       unique: true,
       fields: ['event_id', 'serial_number'],
     }],
   }
   ```
2. 跑 `yarn sr sc`
3. 觀察輸出 SQL — 缺 `UNIQUE` 關鍵字

### Bug 位置

[`node_modules/az-model-manager/src/library/manager/azColumnTypes/jsonschemas/JsonSchemasX.ts:329-347`](../../node_modules/az-model-manager/src/library/manager/azColumnTypes/jsonschemas/JsonSchemasX.ts)

```ts
getAddIndexQuery (
  ammSchema : AmmSchema,
  modelMetadata: ParsedTableInfo,
  indexName: string,
) {
  const sequelizeDb = new Sequelize('postgres://fakeurl/fakedb', {
    dialect: 'postgres',
    minifyAliases: true,
  });
  const tableNameInDb = modelMetadata.tableNameInDb;
  const indexNameInDb = modelMetadata.indexes[indexName].name!;
  const queryInterface = sequelizeDb.getQueryInterface();
  const queryGenerator : PostgresQueryGenerator = (<any>queryInterface).queryGenerator;
  const q = queryGenerator.addIndexQuery(tableNameInDb, modelMetadata.indexes[indexName].fields!, {
    name: indexNameInDb,
    // ⛔ 缺：unique: modelMetadata.indexes[indexName].unique
    // ⛔ 缺：where: modelMetadata.indexes[indexName].where（partial 預判用）
  } , tableNameInDb);
  return q;
}
```

### 建議修法

```ts
const indexDef = modelMetadata.indexes[indexName];
const q = queryGenerator.addIndexQuery(tableNameInDb, indexDef.fields!, {
  name: indexDef.name!,
  unique: indexDef.unique,                  // ← 補
  where: indexDef.where,                    // ← 補（partial 索引支援）
  using: indexDef.using,                    // ← 補（GIN/GIST 等）
  concurrently: indexDef.concurrently,      // ← 補
} , tableNameInDb);
```

`Sequelize` 的 `IndexesOptions` 已支援以上欄位，只要轉傳即可。

### 緩解方式（PR 修好前）

不要直接複製 sc 輸出的 SQL。改為手動加 `UNIQUE`：

```sql
DROP INDEX IF EXISTS <index_name>;
CREATE UNIQUE INDEX CONCURRENTLY <index_name> ON tbl_xxx (col_a, col_b);
```

---

## Bug #2（次要）：比對邏輯不檢查 partial WHERE / using / 其他索引特性

### 影響

`compareDb` 只檢查：
1. `isUnique` 旗標
2. 欄位數量
3. 欄位名稱與順序（snake_case 字串）

不檢查：
- partial predicate（`WHERE deleted_at IS NULL` 等）
- index method（btree / GIN / GIST）
- expressional indexes（`LOWER(col)` 等）

### 後果

DB 上的 index 若是 partial 或非 btree，但 schema 沒對應宣告，比對會錯誤地判定為「相符」（其實行為不同）。反之亦然。

實務上目前專案沒用到 partial / GIN，影響低。但若未來需要，需要先修這個。

### Bug 位置

[`node_modules/az-model-manager/src/library/manager/azColumnTypes/jsonschemas/JsonSchemasX.ts:395-428`](../../node_modules/az-model-manager/src/library/manager/azColumnTypes/jsonschemas/JsonSchemasX.ts)

```ts
const index = table.indexes.find((ind) => {
  if (ind.isUnique !== !!indexFromSchema.unique) return false;
  const columns = ind.columns.map(c => c.name);
  if (columns.length !== indexFromSchema.fields?.length) return false;
  for (let i = 0; i < columns.length; i++) {
    if (indexFromSchema.fields![i] !== columns[i]) return false;
  }
  return true;
  // ⛔ 沒檢查：ind.partialIndexExpression / ind.method / 等等
});
```

### 建議修法

擴充比對函式，比對 `partialIndexExpression`、`method`（pg-structure 的對應屬性視版本而定）。同時 `getAddIndexQuery` 也需要正確輸出 partial WHERE 子句。

---

## 處理流程建議

1. fork `az-model-manager` 上游
2. 修這兩個 bug + 加 unit test（參考 `node_modules/az-model-manager/test/library/az-sequelize-utils-005.spec.ts`）
3. 發 PR
4. 上游合併前可暫用 fork 版本（package.json 改用 git URL）

---

## 相關發現脈絡

- 2026-04-29 開發 PopupShop 階段 9 時，新增 `popupTransferRequest` 的 `serialNumber` + unique index `(event_id, serial_number)`
- 在 development DB 跑 `yarn sr sc` 顯示「缺少」這條 index
- 用 pg_index 系統表確認 DB 上**已有同名 index 但 `indisunique = false`**
- 追到 az-model-manager 的 `getAddIndexQuery` 缺 `unique` 參數
- 重建：drop + `CREATE UNIQUE INDEX CONCURRENTLY` 後 sc 比對乾淨
