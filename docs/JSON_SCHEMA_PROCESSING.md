# JSON Schema 處理系統詳解

本文件詳細說明 `src/library/manager/azColumnTypes` 模組的實作細節和特色功能。

---

## 目錄

1. [模組概述](#1-模組概述)
2. [Schema 處理流程](#2-schema-處理流程)
3. [TypeConfig 系統](#3-typeconfig-系統)
4. [反向關聯自動生成](#4-反向關聯自動生成)
5. [外鍵自動生成](#5-外鍵自動生成)
6. [中間表自動處理](#6-中間表自動處理)
7. [索引自動生成](#7-索引自動生成)
8. [TypeScript 類型生成](#8-typescript-類型生成)
9. [資料庫結構比較](#9-資料庫結構比較)
10. [完整處理範例](#10-完整處理範例)

---

## 1. 模組概述

### 1.1 目錄結構

```
src/library/manager/azColumnTypes/
├── index.ts                    # 模組導出
└── jsonschemas/
    ├── index.ts                # jsonschemas 導出
    ├── IJsonSchemas.ts         # JSON Schema 介面定義（250 行）
    ├── JsonSchemasX.ts         # 主要轉換器類別（563 行）
    ├── JsonSchemasXHelpers.ts  # 輔助函數（543 行）
    ├── typeConfigs.ts          # 類型配置（706 行）
    └── interfaces.ts           # 內部介面定義（115 行）
```

### 1.2 核心職責

| 檔案 | 職責 |
|------|------|
| `JsonSchemasX.ts` | Schema 轉換器主類，協調整個處理流程 |
| `JsonSchemasXHelpers.ts` | Schema 遍歷、正規化、解析的輔助函數 |
| `typeConfigs.ts` | 每種資料類型的處理邏輯配置 |
| `IJsonSchemas.ts` | JSON Schema 格式的型別定義 |
| `interfaces.ts` | 內部處理過程的型別定義 |

### 1.3 設計理念

JSON Schema 處理系統的設計目標是：

1. **簡化定義**：使用字串和陣列取代冗長的 Sequelize 類型定義
2. **自動推斷**：自動推斷外鍵、反向關聯、索引等
3. **類型安全**：提供完整的 TypeScript 類型定義
4. **可擴展**：通過 TypeConfig 系統支援自定義類型

---

## 2. Schema 處理流程

### 2.1 完整處理流程

```
輸入: RawSchemas (原始 JSON 格式)
         ↓
    ┌────────────────────────────────────────────┐
    │ 1. beforeNormalizeRawSchemas               │
    │    - 設定預設 tablePrefix                  │
    │    - model: 'tbl_', associationModel: 'mn_'│
    └────────────────────────────────────────────┘
         ↓
    ┌────────────────────────────────────────────┐
    │ 2. normalizeRawSchemas                     │
    │    - 正規化表格選項 (tableName, timestamps)│
    │    - 正規化欄位格式 (string → [string])   │
    │    - 建立 ParsedTableInfo 元數據          │
    │    - 呼叫每個類型的 normalize()           │
    └────────────────────────────────────────────┘
         ↓
    ┌────────────────────────────────────────────┐
    │ 3. afterNormalizeRawSchemas                │
    │    - [重要] 處理 cross-model 欄位生成      │
    │    - 處理 belongsTo 外鍵欄位自動生成      │
    │    - 處理 belongsToMany 目標關聯生成      │
    │    - 設定 columnNameInDb                  │
    └────────────────────────────────────────────┘
         ↓
    ┌────────────────────────────────────────────┐
    │ 4. preParseRawSchemas                      │
    │    - [重要] 處理反向關聯生成 (ammTargetAs)  │
    │    - 呼叫每個類型的 preParse()            │
    │    - belongsTo: 生成反向關聯              │
    │    - belongsToMany: 生成中間表關聯        │
    └────────────────────────────────────────────┘
         ↓
    ┌────────────────────────────────────────────┐
    │ 5. parseRawSchemas                         │
    │    - 呼叫每個類型的 parse()               │
    │    - 正規化關聯選項                       │
    │    - 轉換欄位格式                         │
    │    - [重要] 解析結果同步回 schemasMetadata  │
    └────────────────────────────────────────────┘
         ↓
    ┌────────────────────────────────────────────┐
    │ 6. afterParseRawSchemas                    │
    │    - 自動生成索引（時間戳、外鍵）         │
    │    - 建立索引元數據                       │
    └────────────────────────────────────────────┘
         ↓
    ┌────────────────────────────────────────────┐
    │ 7. toCoreModels                            │
    │    - 呼叫每個類型的 toCoreColumn()        │
    │    - 轉換為 Sequelize 類型                │
    │    - 處理 ammReferences                   │
    └────────────────────────────────────────────┘
         ↓
輸出: AmmSchemas (Core 格式)
```

### 2.2 處理階段詳解

#### beforeNormalizeRawSchemas

設定全域預設值：

```typescript
// 來源: JsonSchemasXHelpers.ts:142-165
function beforeNormalizeRawSchemas(metadata, schemas, rawSchemas) {
  // 設定預設表前綴
  if (!rawSchemas.options?.model?.tablePrefix) {
    rawSchemas.options.model.tablePrefix = 'tbl_';
  }
  if (!rawSchemas.options?.associationModel?.tablePrefix) {
    rawSchemas.options.associationModel.tablePrefix = 'mn_';
  }
}
```

#### normalizeRawSchemas

正規化每個模型和欄位：

```typescript
// 來源: JsonSchemasXHelpers.ts:167-236
function normalizeRawSchemas(parsedTables, tableType, models, ...) {
  // 1. 正規化表格選項
  forEachSchema(tableType, models, (tableName, tableType, table) => {
    table.options = getNormalizedModelOptions(tableName, tablePrefix, table.options);
    parsedTables[tableName] = {
      isAssociationModel: tableType === 'associationModel',
      modelOptions: table.options,
      columns: {},
      indexes: {},
    };
  });

  // 2. 正規化欄位格式
  forEachSchema(tableType, models, null, (tableName, tableType, table, columnName, column) => {
    // 'string' → { type: ['string'] }
    if (typeof column === 'string' || Array.isArray(column)) {
      column = { type: column };
    }
    // 'string' → ['string']
    if (typeof column.type === 'string') {
      column.type = [column.type];
    }
    // 記錄主鍵
    if (column.primaryKey) {
      parsedTables[tableName].primaryKey = columnName;
    }
  });
}
```

#### 2.2.3 afterNormalizeRawSchemas

此階段處理「跨模型」(Cross-model) 的欄位自動生成，特別是那些本來不存在但因為關聯而需要的欄位。

- **外鍵自動生成**：如果 `belongsTo` 指向一個模型但本表沒定義外鍵，則自動建立外鍵欄位。
- **belongsToMany 目標關聯**：如果設定了 `ammTargetOptions`，在目標模型建立對應的 `belongsToMany`。

> [!IMPORTANT]
> 此階段會直接修改 `schemas` 物件，並確保新生成的欄位也被加入到 `schemasMetadata` 中。

#### 2.2.4 preParseRawSchemas

此階段負責解析之前的「預處理」，最重要的任務是處理 **反向關聯 (Reverse Associations)**。

- **belongsTo 反向關聯**：如果設定了 `ammTargetAs`，這是在目標模型自動生成 `hasOne` 或 `hasMany` 的時機。
- **belongsToMany 中間表處理**：自動在中間表中生成對應的兩個 `belongsTo` 關聯。

#### 2.2.5 parseRawSchemas

這是最核心的解析階段，會遍歷所有模型和欄位，呼叫對應類型的 `parse()` 函數。

- **解析邏輯**：將型別定義從選項形式轉換為最終的內部表示。
- **元數據同步**：**[重要修復]** 為了確保之後生成的代碼（如 TypeScript 介面）包含所有自動生成的欄位，解析後的結果會同步回 `schemasMetadata`。

```typescript
// JsonSchemasXHelpers.ts: parseRawSchemas
forEachSchema(tableType, models, null, (tableName, tableType, table, columnName, column) => {
  const result = config.parse({ ...args });
  table.columns[columnName] = result;
  // 同步回元數據
  const modelMetadata = schemasMetadata.allModels[tableName];
  if (modelMetadata) {
    modelMetadata.columns[columnName] = { ...result } as any;
  }
});
```

---

### 2.3 schemas 與 schemasMetadata 的關係

在系統中存在兩個核心物件：

1.  **`schemas` (RawSchemas)**：這是目前解析過程中的「實際數據工作區」。它會被不斷修改，新增欄位或修改關聯選項。
2.  **`schemasMetadata` (SchemasMetadata)**：這是「型別與元數據視圖」。它主要用於資料庫結構比較、TypeScript 定義生成、前端元數據導出等。

> [!TIP]
> **為什麼要同步？**
> 許多欄位（如反向關聯、外鍵、中間表關聯）是在處理過程中動態新增到 `schemas` 中的。如果沒有同步回 `schemasMetadata`，則生成的 TypeScript 定義或元數據 JSON 就會缺少這些欄位。

---

## 3. TypeConfig 系統

### 3.1 TypeConfig 介面

每種資料類型都有對應的 TypeConfig 配置：

```typescript
// 來源: typeConfigs.ts:37-47
interface TypeConfig {
  sequleizeDataType?: AbstractDataTypeConstructor;  // Sequelize 類型
  associationType?: AssociationType;                // 關聯類型（如果是關聯）

  normalize(args: NormalizeJsonFuncArgs): Error | void;
  preParse(args: ParseJsonFuncArgs): Error | void;
  parse(args: ParseJsonFuncArgs): Error | JsonModelAttributeInOptionsForm;
  toCoreColumn(args: ParseJsonFuncArgs): Error | ModelAttributeColumnOptions;

  getTsTypeExpression(column): string;              // TypeScript 類型表達式
  getTsTypeExpressionForCreation(column): string;   // 建立時的類型表達式
  getAddColumnExpression(column): string;           // SQL 新增欄位語句
}
```

### 3.2 基本類型配置範例

```typescript
// 來源: typeConfigs.ts:494-513
typeConfigs = {
  integer: {
    sequleizeDataType: sequelize.INTEGER,
    normalize: () => undefined,
    preParse: () => undefined,
    parse: basicParse(),                            // 基本解析
    toCoreColumn: basicToCoreColumn(sequelize.INTEGER),
    getTsTypeExpression: () => 'number',
    getTsTypeExpressionForCreation: () => 'number',
    getAddColumnExpression: () => '',
  },

  string: {
    sequleizeDataType: sequelize.STRING,
    normalize: () => undefined,
    preParse: () => undefined,
    parse: basicParse(1, (r) => {
      // 預設長度 255
      if (r.type.length === 1) {
        r.type = ['string', 255];
      }
      return r;
    }),
    toCoreColumn: basicToCoreColumn(sequelize.STRING, 1),
    getTsTypeExpression: () => 'string',
    getTsTypeExpressionForCreation: () => 'string',
    getAddColumnExpression: () => '',
  },

  decimal: {
    sequleizeDataType: sequelize.DECIMAL,
    normalize: () => undefined,
    preParse: () => undefined,
    parse: basicParse(2),                           // 允許 2 個額外參數
    toCoreColumn: basicToCoreColumn(sequelize.DECIMAL, 2),
    getTsTypeExpression: () => 'number',
    getTsTypeExpressionForCreation: () => 'number',
    getAddColumnExpression: () => '',
  },
};
```

### 3.3 支援的類型列表

| 類型名稱 | Sequelize 類型 | 額外參數 | TypeScript 類型 |
|----------|----------------|----------|-----------------|
| `integer` | `INTEGER` | 無 | `number` |
| `bigint` | `BIGINT` | 無 | `string` |
| `decimal` | `DECIMAL` | `(precision, scale)` | `number` |
| `real` | `REAL` | 無 | `number` |
| `float` | `FLOAT` | 無 | `number` |
| `double` | `DOUBLE` | 無 | `number` |
| `boolean` | `BOOLEAN` | 無 | `boolean` |
| `string` | `STRING` | `(length)` | `string` |
| `binary` | `BLOB` | 無 | `Buffer` |
| `text` | `TEXT` | 無 | `string` |
| `date` | `DATE` | 無 | `Date` |
| `dateonly` | `DATEONLY` | 無 | `Date` |
| `uuid` | `UUID` | 無 | `string` |
| `json` | `JSON` | 無 | `any` |
| `jsonb` | `JSONB` | 無 | `any` |
| `range` | `RANGE` | `(subtype)` | `[T, T]` |

---

## 4. 反向關聯自動生成

### 4.1 功能說明

當定義 `belongsTo` 關聯時，可以通過 `ammTargetAs` 和 `ammTargetHasMany` 選項自動在目標模型生成反向關聯。

### 4.2 實作位置

```typescript
// 來源: typeConfigs.ts:303-331 (belongsTo.preParse)
preParse: (args: ParseJsonFuncArgs) => {
  // ... 正規化 foreignKey 和 targetKey

  const { ammTargetAs, ammTargetHasMany } = options;
  const targetModel = args.schemas.models[args.column.type[1]] ||
                      args.schemas.associationModels[args.column.type[1]];

  // 如果指定了 ammTargetAs 且目標模型沒有該欄位
  if (ammTargetAs && !targetModel.columns[ammTargetAs]) {
    // 自動生成反向關聯
    targetModel.columns[ammTargetAs] = {
      type: [
        ammTargetHasMany ? 'hasMany' : 'hasOne',  // 根據選項決定類型
        args.tableName,                            // 指向當前模型
        {
          foreignKey: associationOptions.foreignKey,
        },
      ],
      extraOptions: {},
    };

    // 如果有 targetKey，也要設定
    if (associationOptions.targetKey) {
      targetModel.columns[ammTargetAs].type[2].targetKey = associationOptions.targetKey;
    }
  }
}
```

### 4.3 使用範例

```typescript
// JSON Schema 定義
const rawSchemas = {
  models: {
    post: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        title: 'string',
        // 定義 belongsTo 並指定反向關聯
        author: ['belongsTo', 'user', {
          foreignKey: 'author_id',
          ammTargetAs: 'posts',         // 在 user 模型自動生成 'posts' 欄位
          ammTargetHasMany: true,       // 生成 hasMany（一對多）
        }],
      },
    },
    user: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        username: 'string',
        // 不需要手動定義 posts，會自動生成！
      },
    },
  },
};

// 處理後，user 模型會自動包含：
// posts: ['hasMany', 'post', { foreignKey: 'author_id' }]
```

### 4.4 反向關聯選項

| 選項 | 類型 | 說明 |
|------|------|------|
| `ammTargetAs` | `string` | 目標模型中反向關聯的欄位名稱 |
| `ammTargetHasMany` | `boolean` | `true` 生成 `hasMany`，`false` 生成 `hasOne`（預設） |

---

## 5. 外鍵自動生成

### 5.1 功能說明

當定義 `belongsTo` 關聯時，如果沒有在模型中明確定義外鍵欄位，系統會自動生成。

### 5.2 實作位置

```typescript
// 來源: JsonSchemasXHelpers.ts:262-296 (afterNormalizeRawSchemas)
if (column.type[0] === 'belongsTo') {
  const refTableMetadata = metadata.allModels[column.type[1]];

  if (refTableMetadata.primaryKey) {
    const foreignKey = associationOptions.foreignKey as string;
    const targetKey = associationOptions.targetKey || refTableMetadata.primaryKey;
    const refTable = /* 取得目標表 */;

    // 如果本表沒有外鍵欄位
    if (!table.columns[foreignKey] && refTable) {
      const targetKeyColumn = refTable.columns[targetKey];

      // 自動建立外鍵欄位
      table.columns[foreignKey] = {
        type: targetKeyColumn.type,  // 繼承目標主鍵的類型
        ammReferences: {
          model: column.type[1],      // 參考模型
          key: targetKey,             // 參考欄位
          autogenerated: true,        // 標記為自動生成
        },
        extraOptions: {},
      };
    }
  }
}
```

### 5.3 使用範例

```typescript
// JSON Schema 定義
const rawSchemas = {
  models: {
    post: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        title: 'string',
        // 只定義關聯，不定義外鍵欄位
        author: ['belongsTo', 'user', {
          foreignKey: 'author_id',
        }],
        // author_id 會自動生成！
      },
    },
    user: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        username: 'string',
      },
    },
  },
};

// 處理後，post 模型會自動包含：
// author_id: {
//   type: 'bigint',
//   ammReferences: { model: 'user', key: 'id', autogenerated: true }
// }
```

### 5.4 外鍵約束選項 (ammReferences)

```typescript
interface AmmModelAttributeColumnReferencesOptions {
  model?: string;                                          // 參考的模型名稱
  key?: string;                                            // 參考的欄位名稱
  deferrable?: 'initially_immediate' | 'initially_deferred' | 'not';
  autogenerated?: boolean;                                 // 是否自動生成
}
```

---

## 6. 中間表自動處理

### 6.1 功能說明

`belongsToMany` 關聯會自動在中間表（associationModel）中生成對應的 `belongsTo` 關聯。

### 6.2 實作位置

```typescript
// 來源: typeConfigs.ts:365-420 (belongsToMany.preParse)
preParse: (args: ParseJsonFuncArgs) => {
  // 取得中間表配置
  const throughTableName = associationOptions.through.ammModelName;
  const associationModel = args.schemas.associationModels[throughTableName];
  const { ammThroughTableColumnAs } = associationOptions.through;

  // 如果中間表沒有對應的 belongsTo 欄位
  if (!associationModel.columns[ammThroughTableColumnAs]) {
    // 自動生成 belongsTo 關聯
    associationModel.columns[ammThroughTableColumnAs] = {
      type: [
        'belongsTo',
        args.tableName,                    // 指向當前模型
        {
          foreignKey: associationOptions.foreignKey,
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
          targetKey: 'id',
          ammAs: ammThroughTableColumnAs,
          as: ammThroughTableColumnAs,
        },
      ],
      extraOptions: {},
    };
  }
}
```

### 6.3 使用範例

```typescript
// JSON Schema 定義
const rawSchemas = {
  models: {
    user: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        username: 'string',
        userGroups: ['belongsToMany', 'userGroup', {
          through: {
            ammModelName: 'userUserGroup',
            ammThroughTableColumnAs: 'user',    // 中間表中的欄位名
            ammThroughAs: 'membership',         // 存取中間表的別名
          },
          foreignKey: 'user_id',
          otherKey: 'group_id',
        }],
      },
    },
    userGroup: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        name: 'string',
        users: ['belongsToMany', 'user', {
          through: {
            ammModelName: 'userUserGroup',
            ammThroughTableColumnAs: 'group',
            ammThroughAs: 'membership',
          },
          foreignKey: 'group_id',
          otherKey: 'user_id',
        }],
      },
    },
  },
  associationModels: {
    userUserGroup: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        role: 'string',
        // user 和 group 欄位會自動生成！
      },
    },
  },
};

// 處理後，userUserGroup 會自動包含：
// user: ['belongsTo', 'user', { foreignKey: 'user_id', ... }]
// group: ['belongsTo', 'userGroup', { foreignKey: 'group_id', ... }]
```

### 6.4 ammTargetOptions 功能

`belongsToMany` 還支援 `ammTargetOptions` 自動在目標模型生成反向關聯：

```typescript
// 來源: JsonSchemasXHelpers.ts:298-342
if (column.type[0] === 'belongsToMany') {
  const options: BelongsToManyOptions = column.type[2];

  // 如果設定了 ammTargetOptions 和 ammTargetAs
  if (options.ammTargetOptions && options.ammTargetAs && !targetModel.columns[options.ammTargetAs]) {
    // 在目標模型建立反向的 belongsToMany
    targetModel.columns[options.ammTargetAs] = {
      type: [
        column.type[0],        // 'belongsToMany'
        tableName,             // 當前模型
        options.ammTargetOptions,
      ],
      extraOptions: {},
    };
  }
}
```

---

## 7. 索引自動生成

### 7.1 功能說明

系統會自動為以下欄位生成索引：

1. **時間戳欄位**：`created_at`、`updated_at`、`deleted_at`
2. **外鍵欄位**：所有帶有 `ammReferences` 的欄位

### 7.2 實作位置

```typescript
// 來源: JsonSchemasXHelpers.ts:433-488 (afterParseRawSchemas)
function afterParseRawSchemas(...) {
  forEachSchema(tableType, models,
    // 模型層級：為時間戳欄位建立索引
    (tableName, tableType, table) => {
      table.options.indexes = table.options.indexes || [];

      ['created_at', 'updated_at', 'deleted_at'].forEach((k) => {
        const index = table.options.indexes.find(i =>
          i.fields?.length === 1 && i.fields[0] === k
        );
        if (!index) {
          table.options.indexes.push({
            name: `${modelMetadata.tableNameInDb}_${k}`,
            fields: [k],
          });
        }
      });
    },

    // 欄位層級：為外鍵建立索引
    (tableName, tableType, table, columnName, column) => {
      if (column.ammReferences) {
        const columnMetadata = modelMetadata.columns[columnName];
        const index = table.options.indexes.find(i =>
          i.fields?.length === 1 && i.fields[0] === columnMetadata.columnNameInDb
        );
        if (!index) {
          table.options.indexes.push({
            name: `${modelMetadata.tableNameInDb}_${columnMetadata.columnNameInDb}`,
            fields: [columnMetadata.columnNameInDb],
          });
        }
      }
    }
  );
}
```

### 7.3 自動生成的索引

| 欄位類型 | 索引名稱格式 | 範例 |
|----------|--------------|------|
| `created_at` | `{tableName}_created_at` | `tbl_user_created_at` |
| `updated_at` | `{tableName}_updated_at` | `tbl_user_updated_at` |
| `deleted_at` | `{tableName}_deleted_at` | `tbl_user_deleted_at` |
| 外鍵 | `{tableName}_{columnName}` | `tbl_post_author_id` |

---

## 8. TypeScript 類型生成

### 8.1 功能說明

`JsonSchemasX` 可以生成 TypeScript 類型定義檔案，使用 LiquidJS 模板引擎。

### 8.2 使用方式

```typescript
// 來源: JsonSchemasX.ts:257-299
const jsonSchemasX = new JsonSchemasX('public', rawSchemas);
const ammSchemas = jsonSchemasX.toCoreSchemas();

// 生成 TypeScript 定義
const tsContent = await jsonSchemasX.buildModelTsFile({
  orders: ['user', 'post', 'userGroup'],  // 模型排序
  liquidRoot: './liquids',                 // 模板目錄
});
```

### 8.3 TypeConfig 類型表達式

每個類型配置都定義了對應的 TypeScript 類型：

```typescript
// 來源: typeConfigs.ts

// 基本類型
integer:  getTsTypeExpression: () => 'number'
bigint:   getTsTypeExpression: () => 'string'   // JavaScript 精度問題
decimal:  getTsTypeExpression: () => 'number'
boolean:  getTsTypeExpression: () => 'boolean'
string:   getTsTypeExpression: () => 'string'
binary:   getTsTypeExpression: () => 'Buffer'
date:     getTsTypeExpression: () => 'Date'
jsonb:    getTsTypeExpression: () => 'any'

// 關聯類型
hasOne:       getTsTypeExpression: (col) => `ExtendedModel<${toInterfaceType(col.type[1])}>`
hasMany:      getTsTypeExpression: (col) => `ExtendedModel<${toInterfaceType(col.type[1])}>[]`
belongsTo:    getTsTypeExpression: (col) => `ExtendedModel<${toInterfaceType(col.type[1])}>`
belongsToMany:getTsTypeExpression: (col) => `ExtendedModel<${toInterfaceType(col.type[1])}>[]`

// range 類型（動態）
range: getTsTypeExpression: (col) => {
  const rangeTypes = {
    integer: '[number, number]',
    bigint: '[string, string]',
    date: '[Date, Date]',
  };
  return rangeTypes[col.type[1]];
}
```

### 8.4 生成結果範例

```typescript
// 生成的 TypeScript 定義
interface UserI {
  id: string;            // bigint → string
  username: string;
  email: string;
  settings: any;         // jsonb → any
  createdAt: Date;
  posts: ExtendedModel<PostI>[];
  userGroups: ExtendedModel<UserGroupI>[];
}

interface UserCreationAttributes {
  id?: string;
  username: string;      // requiredOnCreation
  email?: string;
  settings?: any;
  posts?: PostCreationAttributes[];
  userGroups?: UserGroupCreationAttributes[];
}
```

---

## 9. 資料庫結構比較

### 9.1 功能說明

`JsonSchemasX` 提供 `compareDb()` 方法，可以比較 Schema 定義與實際資料庫結構，找出差異並生成 SQL 語句。

### 9.2 實作位置

```typescript
// 來源: JsonSchemasX.ts:345-450
compareDb(db: Db) {
  const dbSchema = db.schemas.get(this.dbSchemaName);
  const missedTables: string[] = [];
  const missedColumns: string[] = [];
  let missedColumnsQuery: string = '';
  const missedIndexes: string[] = [];
  let missedIndexesQuery: string = '';

  Object.keys(this.schemasMetadata.allModels).forEach((modelMetadataName) => {
    const modelMetadata = this.schemasMetadata.allModels[modelMetadataName];
    const table = dbSchema.tables.find(t => t.name === modelMetadata.modelOptions.tableName);

    // 檢查表是否存在
    if (!table) {
      missedTables.push(modelMetadata.modelOptions.tableName);
      return;
    }

    // 檢查欄位
    Object.keys(modelMetadata.columns).forEach((columnName) => {
      const c = modelMetadata.columns[columnName];
      const column = table.columns.find(col => col.name === c.columnNameInDb);

      if (!column && !c.isAssociationColumn) {
        // 生成 ADD COLUMN SQL
        const query = this.getAddColumnQuery(model, modelMetadata, columnName);
        missedColumnsQuery += `-- ${modelMetadataName} => ${columnName}\n${query};\n`;
        missedColumns.push(`${table.name}.${c.columnNameInDb}`);
      }
    });

    // 檢查索引
    Object.keys(modelMetadata.indexes).forEach((indexName) => {
      const indexFromSchema = modelMetadata.indexes[indexName];
      const index = table.indexes.find((ind) => {
        // 比較索引定義...
      });

      if (!index) {
        const query = this.getAddIndexQuery(model, modelMetadata, indexName);
        missedIndexesQuery += `-- ${modelMetadataName} => ${indexName}\n${query};\n`;
        missedIndexes.push(`${table.name}.${indexName}`);
      }
    });
  });

  return {
    missedTables,
    missedColumns,
    missedColumnsQuery,
    missedIndexes,
    missedIndexesQuery,
  };
}
```

### 9.3 使用範例

```typescript
import pgStructure from 'pg-structure';
import { Client } from 'pg';
import { JsonSchemasX } from 'az-model-manager/manager';

const client = new Client({ connectionString: 'postgres://...' });
await client.connect();

const db = await pgStructure(client, {
  includeSchemas: ['public'],
  keepConnection: true,
});

const jsonSchemasX = new JsonSchemasX('public', rawSchemas);
const result = jsonSchemasX.compareDb(db);

console.log('缺少的表:', result.missedTables);
// ['tbl_new_model']

console.log('缺少的欄位:', result.missedColumns);
// ['tbl_user.phone', 'tbl_post.category_id']

console.log('新增欄位的 SQL:');
console.log(result.missedColumnsQuery);
// -- user => phone
// ALTER TABLE "tbl_user" ADD COLUMN "phone" VARCHAR(255);
// -- post => category_id
// ALTER TABLE "tbl_post" ADD COLUMN "category_id" BIGINT REFERENCES "tbl_category" ("id");

console.log('缺少的索引:', result.missedIndexes);
// ['tbl_post.idx_category_id']

console.log('新增索引的 SQL:');
console.log(result.missedIndexesQuery);
// -- post => idx_category_id
// CREATE INDEX "idx_category_id" ON "tbl_post" ("category_id");

await client.end();
```

---

## 10. 完整處理範例

### 10.1 輸入：原始 JSON Schema

```typescript
const rawSchemas = {
  models: {
    user: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        username: 'string',
        posts: ['hasMany', 'post', { foreignKey: 'author_id' }],
      },
    },
    post: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        title: 'string',
        author: ['belongsTo', 'user', {
          foreignKey: 'author_id',
          ammTargetAs: 'posts',       // 自動生成反向關聯
          ammTargetHasMany: true,
        }],
      },
    },
  },
  associationModels: {},
};
```

### 10.2 處理過程

```
步驟 1: beforeNormalizeRawSchemas
  - 設定 tablePrefix: 'tbl_'

步驟 2: normalizeRawSchemas
  - user.options.tableName = 'tbl_user'
  - post.options.tableName = 'tbl_post'
  - 'string' → ['string', 255]

步驟 3: afterNormalizeRawSchemas
  - post.author_id 欄位自動生成（從 belongsTo 推斷）

步驟 4: preParseRawSchemas
  - 反向關聯已在定義中明確指定，不需自動生成

步驟 5: parseRawSchemas
  - 正規化關聯選項
  - 設定 foreignKey, sourceKey, targetKey

步驟 6: afterParseRawSchemas
  - 建立索引: tbl_user_created_at, tbl_user_updated_at, tbl_user_deleted_at
  - 建立索引: tbl_post_created_at, tbl_post_updated_at, tbl_post_deleted_at
  - 建立索引: tbl_post_author_id（外鍵索引）

步驟 7: toCoreModels
  - 轉換為 Sequelize 類型
  - 'bigint' → sequelize.BIGINT
  - 'string' → sequelize.STRING(255)
  - ['belongsTo', ...] → BELONGS_TO(...)
```

### 10.3 輸出：Core Schema (AmmSchemas)

```typescript
const ammSchemas = {
  models: {
    user: {
      columns: {
        id: {
          type: sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true,
        },
        username: {
          type: sequelize.STRING(255),
        },
        posts: {
          type: AmmOrm.columnTypes.HAS_MANY('post', {
            foreignKey: 'author_id',
            sourceKey: 'id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          }),
        },
      },
      options: {
        tableName: 'tbl_user',
        timestamps: true,
        paranoid: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        indexes: [
          { name: 'tbl_user_created_at', fields: ['created_at'] },
          { name: 'tbl_user_updated_at', fields: ['updated_at'] },
          { name: 'tbl_user_deleted_at', fields: ['deleted_at'] },
        ],
      },
    },
    post: {
      columns: {
        id: {
          type: sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true,
        },
        title: {
          type: sequelize.STRING(255),
        },
        author_id: {
          type: sequelize.BIGINT,
          references: {
            model: 'tbl_user',
            key: 'id',
          },
        },
        author: {
          type: AmmOrm.columnTypes.BELONGS_TO('user', {
            foreignKey: 'author_id',
            targetKey: 'id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          }),
        },
      },
      options: {
        tableName: 'tbl_post',
        timestamps: true,
        paranoid: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        indexes: [
          { name: 'tbl_post_created_at', fields: ['created_at'] },
          { name: 'tbl_post_updated_at', fields: ['updated_at'] },
          { name: 'tbl_post_deleted_at', fields: ['deleted_at'] },
          { name: 'tbl_post_author_id', fields: ['author_id'] },
        ],
      },
    },
  },
  associationModels: {},
  options: {
    model: { tablePrefix: 'tbl_' },
    associationModel: { tablePrefix: 'mn_' },
  },
};
```

---

## 附錄：ParsedTableInfo 結構

Schema 處理過程中會建立元數據結構：

```typescript
interface ParsedTableInfo {
  tableNameInDb?: string;          // 資料庫表名
  isAssociationModel: boolean;     // 是否為中間表
  primaryKey?: string;             // 主鍵欄位名
  modelOptions: ModelOptions;      // 模型選項
  columns: {
    [columnName: string]: {
      type: [...];                 // 類型定義
      columnNameInDb?: string;     // 資料庫欄位名
      isForeignKey?: boolean;      // 是否為外鍵
      isAssociationColumn?: boolean; // 是否為關聯欄位
      // ... 其他欄位選項
    };
  };
  indexes: {
    [indexName: string]: {
      name: string;
      unique?: boolean;
      fields: string[];
      columns: string[];           // 資料庫欄位名陣列
    };
  };
}
```

---

*本文件詳細說明了 Az Model Manager 的 JSON Schema 處理系統。如需更多資訊，請參考原始碼。*
