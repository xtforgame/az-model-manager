# Az Model Manager API 快速參考

本文件提供 API 的快速查閱。完整說明請參考 [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)。

---

## 導入模組

```typescript
// 核心模組
import AmmOrm, { AmmSchemas, AmmSchema, AmmModelI, AmmOrmI } from 'az-model-manager/core';

// 管理層模組
import AzModelManager, { JsonSchemasX, IJsonSchemas } from 'az-model-manager/manager';

// 工具函數
import { toSeqPromise, promiseWait, toMap, toCamel, toUnderscore } from 'az-model-manager/core/utils';
```

---

## AmmOrm

### 建構函數

```typescript
const ammOrm = new AmmOrm(sequelizeDb: Sequelize, ammSchemas: AmmSchemas);
```

### 方法

| 方法 | 回傳值 | 說明 |
|------|--------|------|
| `sync(force?: boolean)` | `Promise<void>` | 同步資料庫 |
| `getAmmModel(name)` | `AmmModelI \| undefined` | 取得 AmmModel |
| `getSqlzModel(name)` | `ExtendedModelDefined \| undefined` | 取得 Sequelize Model |
| `getAmmAssociationModel(name)` | `AmmModelI \| undefined` | 取得關聯模型的 AmmModel |
| `getSqlzAssociationModel(name)` | `ExtendedModelDefined \| undefined` | 取得關聯模型的 Sequelize Model |
| `isAssociation(baseModel, fieldName)` | `boolean` | 檢查是否為關聯欄位 |
| `getAssociationIncludes(baseModel, includes)` | `IncludeOptions[]` | 生成 include 配置 |

### 靜態屬性

```typescript
AmmOrm.columnTypes.HAS_ONE(targetModel, options)
AmmOrm.columnTypes.HAS_MANY(targetModel, options)
AmmOrm.columnTypes.BELONGS_TO(targetModel, options)
AmmOrm.columnTypes.BELONGS_TO_MANY(targetModel, options)
AmmOrm.ThroughValues  // Symbol for through table values
```

---

## 關聯類型

### HAS_ONE

```typescript
{
  profile: {
    type: AmmOrm.columnTypes.HAS_ONE('profile', {
      foreignKey: 'user_id',     // 必填
      sourceKey?: 'id',          // 預設為主鍵
      onDelete?: 'CASCADE',      // 'CASCADE' | 'SET NULL'
      onUpdate?: 'CASCADE',
    }),
  },
}
```

### HAS_MANY

```typescript
{
  posts: {
    type: AmmOrm.columnTypes.HAS_MANY('post', {
      foreignKey: 'author_id',   // 必填
      sourceKey?: 'id',
      onDelete?: 'CASCADE',
      onUpdate?: 'CASCADE',
    }),
  },
}
```

### BELONGS_TO

```typescript
{
  author: {
    type: AmmOrm.columnTypes.BELONGS_TO('user', {
      foreignKey: 'author_id',   // 必填
      targetKey?: 'id',          // 預設為目標主鍵
      onDelete?: 'CASCADE',
      onUpdate?: 'CASCADE',
    }),
  },
}
```

### BELONGS_TO_MANY

```typescript
{
  userGroups: {
    type: AmmOrm.columnTypes.BELONGS_TO_MANY('userGroup', {
      through: {
        ammModelName: 'userUserGroup',  // 必填：中間表模型名
        ammThroughAs?: 'relationship',  // 中間表別名
        unique?: false,
      },
      foreignKey: 'user_id',     // 本模型在中間表的外鍵
      otherKey: 'group_id',      // 目標模型在中間表的外鍵
      sourceKey?: 'id',
    }),
  },
}
```

---

## Schema 結構

### AmmSchemas

```typescript
interface AmmSchemas {
  models: { [name: string]: AmmSchema };
  associationModels?: { [name: string]: AmmSchema };
  options?: {
    model?: { tablePrefix?: string };           // 預設 'tbl_'
    associationModel?: { tablePrefix?: string }; // 預設 'mn_'
  };
}
```

### AmmSchema

```typescript
interface AmmSchema {
  columns: {
    [name: string]: DataType | {
      type: DataType;
      primaryKey?: boolean;
      autoIncrement?: boolean;
      allowNull?: boolean;
      unique?: boolean;
      defaultValue?: any;
      comment?: string;
      references?: {
        model: string;
        key: string;
      };
    };
  };
  options?: {
    tableName?: string;
    timestamps?: boolean;       // 預設 true
    paranoid?: boolean;         // 預設 true（軟刪除）
    underscored?: boolean;      // 預設 true
    createdAt?: string | false; // 預設 'created_at'
    updatedAt?: string | false; // 預設 'updated_at'
    deletedAt?: string | false; // 預設 'deleted_at'
    indexes?: IndexOptions[];
    hooks?: ModelHooks;
  };
}
```

---

## JsonSchemasX

### 建構函數

```typescript
const jsonSchemasX = new JsonSchemasX(dbSchemaName: string, rawSchemas: RawSchemas);
```

### 方法

| 方法 | 回傳值 | 說明 |
|------|--------|------|
| `toCoreSchemas()` | `AmmSchemas \| Error` | 轉換為 Core Schema |
| `parseRawSchemas()` | `Error \| void` | 解析 Schema |
| `buildModelTsFile(args?)` | `Promise<string>` | 生成 TypeScript 定義 |
| `compareDb(db)` | `CompareResult` | 比較資料庫結構 |
| `parseSchemaFromDb(db)` | `ParsedSchema` | 從 DB 解析 Schema |

---

## JSON Schema 類型對照

### 基本類型

| JSON 類型 | Sequelize | 範例 |
|-----------|-----------|------|
| `'string'` | `STRING` | `'string'`, `['string', 255]` |
| `'text'` | `TEXT` | `'text'` |
| `'integer'` | `INTEGER` | `'integer'` |
| `'bigint'` | `BIGINT` | `'bigint'` |
| `'float'` | `FLOAT` | `'float'` |
| `'double'` | `DOUBLE` | `'double'` |
| `'decimal'` | `DECIMAL` | `['decimal', 10, 2]` |
| `'boolean'` | `BOOLEAN` | `'boolean'` |
| `'date'` | `DATE` | `'date'` |
| `'dateonly'` | `DATEONLY` | `'dateonly'` |
| `'uuid'` | `UUID` | `'uuid'` |
| `'json'` | `JSON` | `'json'` |
| `'jsonb'` | `JSONB` | `'jsonb'` |

### 關聯類型

| JSON 格式 | 關聯 |
|-----------|------|
| `['hasOne', target, opts]` | 一對一 |
| `['hasMany', target, opts]` | 一對多 |
| `['belongsTo', target, opts]` | 屬於 |
| `['belongsToMany', target, opts]` | 多對多 |

---

## 工具函數

```typescript
// 順序執行 Promise
await toSeqPromise(array, async (prev, item, index) => { ... });

// 延遲
await promiseWait(1000); // 1 秒

// 陣列轉 Map
const map = toMap(users, user => user.id);

// 命名轉換
toCamel('user_name');          // 'userName'
toUnderscore('userName');      // 'user_name'
capitalizeFirstLetter('user'); // 'User'
```

---

## 使用範例

### 基本 CRUD

```typescript
const User = ammOrm.getSqlzModel('user');

// Create
const user = await User.create({
  username: 'john',
  posts: [{ title: 'Post 1' }],  // 自動 include
});

// Read
const users = await User.findAll({
  include: User.ammInclude(['posts', 'profile']),
});

// Update
await user.update({ username: 'jane' });

// Delete (soft)
await user.destroy();
```

### 多對多 Through Values

```typescript
const group = await UserGroup.create({
  name: 'Admin',
  users: [{
    username: 'admin',
    [AmmOrm.ThroughValues]: {
      role: 'owner',
    },
  }],
});
```

### 交易

```typescript
const t = await sequelizeDb.transaction();
try {
  await User.create({ ... }, { transaction: t });
  await t.commit();
} catch (e) {
  await t.rollback();
}
```

---

## 檔案結構

```
src/library/
├── index.ts              # 主導出
├── core/                 # 核心模組
│   ├── index.ts
│   ├── AmmOrm/
│   ├── AmmModel.ts
│   ├── AssociationModel.ts
│   ├── columnTypes.ts
│   ├── interfaces.ts
│   └── utils.ts
└── manager/              # 管理層
    ├── index.ts
    ├── AzModelManager.ts
    └── azColumnTypes/
        └── jsonschemas/
            ├── JsonSchemasX.ts
            ├── IJsonSchemas.ts
            └── typeConfigs.ts
```
