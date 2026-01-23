# Az Model Manager 技術文件

**版本**: 0.7.0
**作者**: Rick Chen <xtforgame@gmail.com>
**授權**: MIT

---

## 目錄

1. [專案概述](#1-專案概述)
2. [安裝指南](#2-安裝指南)
3. [快速開始](#3-快速開始)
4. [核心概念](#4-核心概念)
5. [核心模組 API 參考](#5-核心模組-api-參考)
6. [管理層模組 API 參考](#6-管理層模組-api-參考)
7. [Schema 定義指南](#7-schema-定義指南)
8. [關聯類型詳解](#8-關聯類型詳解)
9. [JSON Schema 格式](#9-json-schema-格式)
10. [工具函數](#10-工具函數)
11. [進階用法](#11-進階用法)
12. [測試](#12-測試)
13. [架構設計](#13-架構設計)

> **延伸閱讀**: [JSON Schema 處理系統詳解](./JSON_SCHEMA_PROCESSING.md) - 深入了解 Schema 處理流程、反向關聯自動生成、外鍵自動生成等進階功能

---

## 1. 專案概述

### 1.1 簡介

**Az Model Manager (AMM)** 是一個基於 Sequelize 的 ORM 增強框架，專為 Node.js 和 PostgreSQL 設計。它提供了更高級的模型管理功能，簡化了模型定義、關聯管理和資料庫操作。

### 1.2 主要特性

- **簡化的模型定義**：支援直接 Sequelize 定義和 JSON Schema 兩種定義方式
- **智能關聯管理**：自動處理一對一、一對多、多對多關聯
- **反向關聯自動生成**：`belongsTo` 可自動生成對應的 `hasOne`/`hasMany` 反向關聯
- **外鍵自動生成**：根據關聯定義自動建立外鍵欄位和約束
- **中間表自動處理**：`belongsToMany` 自動在中間表建立對應關聯
- **索引自動生成**：自動為時間戳和外鍵欄位建立索引
- **自動 Include 機制**：嵌套保存時自動檢測關聯數據
- **TypeScript 支援**：完整的類型定義，可自動生成類型定義檔
- **資料庫結構解析**：使用 pg-structure 自動解析 PostgreSQL 結構
- **資料庫結構比較**：比較 Schema 與實際資料庫，生成遷移 SQL
- **自動時間戳管理**：自動處理 created_at、updated_at、deleted_at

### 1.3 系統需求

- Node.js >= 14.0
- PostgreSQL 資料庫
- npm 或 yarn 套件管理器

---

## 2. 安裝指南

### 2.1 安裝套件

```bash
npm install az-model-manager
```

### 2.2 安裝 Peer Dependencies

AMM 需要以下 peer dependencies：

```bash
npm install sequelize pg pg-structure js-sql-parse
```

### 2.3 完整依賴列表

**生產依賴**:
```json
{
  "app-root-path": "^1.0.0",
  "liquidjs": "^9.16.1"
}
```

**Peer 依賴**:
```json
{
  "js-sql-parse": "^0.2.6",
  "pg": "^8.4.1",
  "pg-structure": "^7.12.1",
  "sequelize": "^6.3.5"
}
```

---

## 3. 快速開始

### 3.1 基本使用範例

```typescript
import { Sequelize } from 'sequelize';
import AmmOrm, { AmmSchemas } from 'az-model-manager/core';

// 1. 定義 Schema
const ammSchemas: AmmSchemas = {
  models: {
    user: {
      columns: {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        username: {
          type: Sequelize.STRING,
          comment: 'Username',
        },
        email: Sequelize.STRING,
      },
    },
  },
  associationModels: {},
};

// 2. 建立資料庫連線
const sequelizeDb = new Sequelize('postgres://user:password@localhost:5432/database', {
  dialect: 'postgres',
});

// 3. 建立 AmmOrm 實例
const ammOrm = new AmmOrm(sequelizeDb, ammSchemas);

// 4. 同步資料庫
await ammOrm.sync(true); // true = force sync (會清除現有資料)

// 5. 使用模型
const User = ammOrm.getSqlzModel('user');
const newUser = await User.create({
  username: 'john_doe',
  email: 'john@example.com',
});
```

### 3.2 使用 JSON Schema 定義

```typescript
import { JsonSchemasX } from 'az-model-manager/manager';

// JSON Schema 格式定義
const rawSchemas = {
  models: {
    user: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        username: 'string',
        email: ['string', 255], // 帶長度的 string
      },
    },
  },
  associationModels: {},
};

// 轉換為 Core Schemas
const jsonSchemasX = new JsonSchemasX('public', rawSchemas);
const ammSchemas = jsonSchemasX.toCoreSchemas();

if (ammSchemas instanceof Error) {
  throw ammSchemas;
}

// 使用轉換後的 schemas
const ammOrm = new AmmOrm(sequelizeDb, ammSchemas);
```

---

## 4. 核心概念

### 4.1 架構層次

AMM 採用分層架構設計：

```
┌─────────────────────────────────────────┐
│           Application Layer             │
├─────────────────────────────────────────┤
│         Manager Layer (manager/)        │
│   - AzModelManager                      │
│   - JsonSchemasX                        │
│   - TypeConfigs                         │
├─────────────────────────────────────────┤
│           Core Layer (core/)            │
│   - AmmOrm                              │
│   - AmmModel                            │
│   - AssociationModel                    │
│   - columnTypes                         │
├─────────────────────────────────────────┤
│              Sequelize                  │
├─────────────────────────────────────────┤
│           PostgreSQL Database           │
└─────────────────────────────────────────┘
```

### 4.2 核心類別說明

| 類別 | 說明 | 檔案位置 |
|------|------|----------|
| `AmmOrm` | ORM 主類，管理所有模型和關聯 | `src/library/core/AmmOrm/index.ts` |
| `OriginalAmmOrm` | AmmOrm 的基礎類別 | `src/library/core/AmmOrm/OriginalAmmOrm.ts` |
| `AmmModel` | 單一模型的包裝類別 | `src/library/core/AmmModel.ts` |
| `AssociationModel` | 多對多關聯的中間表模型 | `src/library/core/AssociationModel.ts` |
| `JsonSchemasX` | JSON Schema 轉換器 | `src/library/manager/azColumnTypes/jsonschemas/JsonSchemasX.ts` |
| `AzModelManager` | 資料庫管理器 | `src/library/manager/AzModelManager.ts` |

### 4.3 Schema 結構

```typescript
interface AmmSchemas {
  models: { [modelName: string]: AmmSchema };           // 一般模型
  associationModels?: { [modelName: string]: AmmSchema }; // 關聯模型（多對多中間表）
  options?: AmmSchemasOptions;                          // 全域選項
}

interface AmmSchema {
  columns: ModelAttributes;    // 欄位定義
  options?: ModelOptions;      // 模型選項
}

interface AmmSchemasOptions {
  model?: { tablePrefix?: string };           // 一般模型的表前綴，預設 'tbl_'
  associationModel?: { tablePrefix?: string }; // 關聯模型的表前綴，預設 'mn_'
}
```

---

## 5. 核心模組 API 參考

### 5.1 AmmOrm 類別

**檔案**: `src/library/core/AmmOrm/index.ts`

#### 建構函數

```typescript
constructor(sequelizeDb: Sequelize, ammSchemas: AmmSchemas)
```

**參數**:
- `sequelizeDb`: Sequelize 實例
- `ammSchemas`: 模型 Schema 定義

#### 方法

##### `sync(force?: boolean): Promise<void>`

同步資料庫結構。

```typescript
await ammOrm.sync(true);  // force = true 會刪除現有表格
await ammOrm.sync(false); // force = false 只建立不存在的表格
```

##### `getAmmModel<Extended, S, T>(name: string): AmmModelI | undefined`

取得 AmmModel 實例。

```typescript
const userModel = ammOrm.getAmmModel('user');
```

##### `getSqlzModel<Extended, S, T>(name: string): ExtendedModelDefined | undefined`

取得 Sequelize Model 實例（帶有 AMM 擴展）。

```typescript
const User = ammOrm.getSqlzModel('user');
const users = await User.findAll();
```

##### `getAmmAssociationModel<Extended, S, T>(name: string): AmmModelI | undefined`

取得關聯模型（多對多中間表）的 AmmModel 實例。

```typescript
const userUserGroupModel = ammOrm.getAmmAssociationModel('userUserGroup');
```

##### `getSqlzAssociationModel<Extended, S, T>(name: string): ExtendedModelDefined | undefined`

取得關聯模型的 Sequelize Model 實例。

```typescript
const UserUserGroup = ammOrm.getSqlzAssociationModel('userUserGroup');
```

##### `isAssociation(baseModelName: string, associationModelNameAs: string): boolean`

檢查指定欄位是否為關聯欄位。

```typescript
const isAssoc = ammOrm.isAssociation('user', 'accountLinks'); // true
const isNotAssoc = ammOrm.isAssociation('user', 'username');  // false
```

##### `getAssociationIncludes(baseModelName: string, associationModelNameAsArray: AssociationModelNameAsToInclude[]): IncludeOptions[]`

生成 Sequelize 查詢用的 include 配置。

```typescript
const includes = ammOrm.getAssociationIncludes('user', ['accountLinks', 'userGroups']);
const users = await User.findAll({ include: includes });
```

#### 靜態屬性

##### `AmmOrm.columnTypes`

關聯類型工廠函數集合：

```typescript
AmmOrm.columnTypes.HAS_ONE(targetModel, options)
AmmOrm.columnTypes.HAS_MANY(targetModel, options)
AmmOrm.columnTypes.BELONGS_TO(targetModel, options)
AmmOrm.columnTypes.BELONGS_TO_MANY(targetModel, options)
```

##### `AmmOrm.ThroughValues`

多對多關聯中間表的額外數據 Symbol：

```typescript
import AmmOrm from 'az-model-manager/core';

await UserGroup.create({
  name: 'Admin Group',
  users: [{
    username: 'admin',
    [AmmOrm.ThroughValues]: {
      role: 'owner',  // 存入中間表的額外欄位
    },
  }],
});
```

### 5.2 AmmModel 類別

**檔案**: `src/library/core/AmmModel.ts`

#### 建構函數

```typescript
constructor(
  ammOrm: AmmOrmI,
  modelName: string,
  tableDefine: AmmSchema,
  tablePrefix?: string  // 預設 'tbl_'
)
```

#### 屬性

| 屬性 | 類型 | 說明 |
|------|------|------|
| `ammOrm` | `AmmOrmI` | 所屬的 AmmOrm 實例 |
| `db` | `Sequelize` | Sequelize 資料庫實例 |
| `tableDefine` | `AmmSchema` | 原始 Schema 定義 |
| `tablePrefix` | `string` | 表名前綴 |
| `sqlzModel` | `ModelDefined` | Sequelize Model 實例 |
| `sqlzOptions` | `ModelOptions` | Sequelize Model 選項 |
| `modelName` | `string` | 模型名稱 |
| `columns` | `ModelAttributes` | 欄位定義（不含關聯） |
| `name` | `ModelNameOptions` | 模型名稱選項（單複數形式） |
| `tableName` | `string` | 資料庫表名 |
| `associations` | `{ [s: string]: AssociationColumn }` | 關聯定義 |
| `primaryKey` | `string` | 主鍵欄位名 |

#### 方法

##### `setupAssociations(): void`

設置模型關聯，由 AmmOrm 內部調用。

##### `getNormalizedSettings(modelName: string): { columns, sqlzOptions, associations }`

正規化模型設定，分離一般欄位和關聯欄位。

#### 靜態屬性

##### `AmmModel.columnTypes`

等同於 `AmmOrm.columnTypes`。

##### `AmmModel.ThroughValues`

等同於 `AmmOrm.ThroughValues`。

### 5.3 AssociationModel 類別

**檔案**: `src/library/core/AssociationModel.ts`

繼承自 `AmmModel`，專門用於多對多關聯的中間表模型。

```typescript
class AssociationModel extends AmmModel {
  constructor(
    ammOrm: AmmOrmI,
    modelName: string,
    tableDefine: AmmSchema,
    tablePrefix?: string  // 預設 'mn_'
  )
}
```

### 5.4 columnTypes 模組

**檔案**: `src/library/core/columnTypes.ts`

#### 關聯類型

##### `HAS_ONE(targetModel: string, options: HasOneOptions): AssociationColumn`

定義一對一關聯（外鍵在目標模型）。

```typescript
{
  profile: {
    type: AmmOrm.columnTypes.HAS_ONE('userProfile', {
      foreignKey: 'user_id',
    }),
  },
}
```

**HasOneOptions 介面**:
```typescript
interface HasOneOptions {
  foreignKey?: string;      // 目標模型的外鍵欄位
  sourceKey?: string;       // 來源模型的鍵（通常是主鍵）
  as?: string;              // 關聯別名（自動設定）
  onDelete?: 'CASCADE' | 'SET NULL';
  onUpdate?: 'CASCADE';
}
```

##### `HAS_MANY(targetModel: string, options: HasManyOptions): AssociationColumn`

定義一對多關聯（外鍵在目標模型）。

```typescript
{
  accountLinks: {
    type: AmmOrm.columnTypes.HAS_MANY('accountLink', {
      foreignKey: 'owner_id',
    }),
  },
}
```

**HasManyOptions 介面**:
```typescript
interface HasManyOptions {
  foreignKey?: string;      // 目標模型的外鍵欄位
  sourceKey?: string;       // 來源模型的鍵
  as?: string;              // 關聯別名
  onDelete?: 'CASCADE' | 'SET NULL';
  onUpdate?: 'CASCADE';
}
```

##### `BELONGS_TO(targetModel: string, options: BelongsToOptions): AssociationColumn`

定義屬於關聯（外鍵在本模型）。

```typescript
{
  owner: {
    type: AmmOrm.columnTypes.BELONGS_TO('user', {
      foreignKey: 'owner_id',
    }),
  },
}
```

**BelongsToOptions 介面**:
```typescript
interface BelongsToOptions {
  foreignKey?: string;      // 本模型的外鍵欄位
  targetKey?: string;       // 目標模型的鍵（通常是主鍵）
  as?: string;              // 關聯別名
  ammTargetAs?: string;     // 目標模型的反向關聯別名
  ammTargetHasMany?: boolean; // 是否自動建立反向 hasMany
  onDelete?: 'CASCADE' | 'SET NULL';
  onUpdate?: 'CASCADE';
}
```

##### `BELONGS_TO_MANY(targetModel: string, options: BelongsToManyOptions): AssociationColumn`

定義多對多關聯（使用中間表）。

```typescript
{
  userGroups: {
    type: AmmOrm.columnTypes.BELONGS_TO_MANY('userGroup', {
      through: {
        ammModelName: 'userUserGroup',  // 中間表模型名稱
        ammThroughAs: 'relationship',   // 中間表關聯別名
      },
      foreignKey: 'user_id',
      otherKey: 'group_id',
    }),
  },
}
```

**BelongsToManyOptions 介面**:
```typescript
interface BelongsToManyOptions {
  through: ThroughOptions;   // 中間表配置
  foreignKey?: string;       // 本模型在中間表的外鍵
  otherKey?: string;         // 目標模型在中間表的外鍵
  sourceKey?: string;        // 來源模型的鍵
  as?: string;               // 關聯別名
  ammTargetOptions?: BelongsToManyOptionsBase; // 目標模型的配置
  ammTargetAs?: string;      // 目標模型的反向關聯別名
}

interface ThroughOptions {
  ammModelName: string;              // 中間表模型名稱
  ammThroughTableColumnAs?: string;  // 中間表的欄位別名
  ammThroughAs?: string;             // 中間表關聯別名
  unique?: boolean;                   // 是否唯一
}
```

#### 工具函數

##### `ASSOCIATION(type, targetModel, options, extraOptions?): AssociationColumn`

通用關聯建立函數。

##### `isAssociationColumn(columnType): boolean`

判斷是否為關聯欄位。

### 5.5 interfaces 模組

**檔案**: `src/library/core/interfaces.ts`

```typescript
// ORM 介面
interface AmmOrmI<Extended = {}> {
  db: Sequelize;
  ammSchemas: AmmSchemas;
  addSqlzModelMethod: (sqlzModel: ModelDefined<any, any>) => void;
  getAmmModel(modelName: string): AmmModelI | undefined;
  getAmmAssociationModel(modelName: string): AmmModelI | undefined;
  getSqlzModel(modelName: string): ExtendedModelDefined<Extended> | undefined;
  getSqlzAssociationModel(modelName: string): ExtendedModelDefined<Extended> | undefined;
}

// Model 介面
interface AmmModelI<Extended = {}, S = any, T = any> {
  sqlzModel: ExtendedModelDefined<Extended, S, T>;
  associations: { [s: string]: AssociationColumn };
}

// Schema 定義
interface AmmSchema {
  columns: ModelAttributes;
  options?: ModelOptions;
}

// Schemas 集合
interface AmmSchemas {
  models: { [s: string]: AmmSchema };
  associationModels?: { [s: string]: AmmSchema };
  options?: AmmSchemasOptions;
}

// Schemas 選項
interface AmmSchemasOptions {
  model?: AmmSchemasModelOptions;
  associationModel?: AmmSchemasModelOptions;
}

interface AmmSchemasModelOptions {
  tablePrefix?: string;
}
```

### 5.6 utils 模組

**檔案**: `src/library/core/utils.ts`

#### 型別定義

```typescript
// 欄位額外選項
interface ColumnExtraOptions {
  requiredOnCreation?: boolean;
}

// 欄位選項（擴展 Sequelize）
type ModelAttributeColumnOptions<M, CEO> = MACO<M> & {
  extraOptions?: CEO & ColumnExtraOptions
};

// 模型屬性
type ModelAttributes<M, TCreationAttributes, CEO> = {
  [name in keyof TCreationAttributes]: DataType | ModelAttributeColumnOptions<M, CEO>;
};

// 模型選項（擴展 Sequelize）
type ModelOptions<M> = MO<M> & {
  extraOptions?: ModelExtraOptions
};

// 擴展的 Model 類型
type ExtendedModel<X, S, T> = Model<S, T> & X;
type ExtendedModelDefined<X, S, T> = ModelCtor<ExtendedModel<X, S, T>>;

// 覆寫類型工具
type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
```

#### 工具函數

##### `toSeqPromise<T>(inArray: T[], toPromiseFunc?): Promise<void>`

順序執行 Promise 陣列。

```typescript
await toSeqPromise([1, 2, 3], async (_, value) => {
  console.log(value);
  return Promise.resolve();
});
// 輸出: 1, 2, 3 (依序)
```

##### `promiseWait(waitMillisec: number): Promise<void>`

延遲函數。

```typescript
await promiseWait(1000); // 等待 1 秒
```

##### `toMap<T>(inArray: T[], getId: (t: T) => any): { [s: string]: T }`

將陣列轉換為物件 Map。

```typescript
const users = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
const userMap = toMap(users, u => u.id);
// { '1': { id: 1, name: 'A' }, '2': { id: 2, name: 'B' } }
```

##### `toCamel(str: string): string`

底線轉駝峰命名。

```typescript
toCamel('user_name'); // 'userName'
```

##### `toUnderscore(str: string): string`

駝峰轉底線命名。

```typescript
toUnderscore('userName'); // 'user_name'
```

##### `capitalizeFirstLetter(str: string): string`

首字母大寫。

```typescript
capitalizeFirstLetter('user'); // 'User'
```

---

## 6. 管理層模組 API 參考

### 6.1 JsonSchemasX 類別

**檔案**: `src/library/manager/azColumnTypes/jsonschemas/JsonSchemasX.ts`

JSON Schema 轉換器，將簡化的 JSON 格式 Schema 轉換為 Core Schema 格式。

#### 建構函數

```typescript
constructor(dbSchemaName: string, rawSchemas: RawSchemas)
```

**參數**:
- `dbSchemaName`: 資料庫 Schema 名稱（通常為 'public'）
- `rawSchemas`: 原始 JSON Schema 定義

#### 方法

##### `toCoreSchemas(): AmmSchemas | Error`

將 JSON Schema 轉換為 Core Schema。

```typescript
const jsonSchemasX = new JsonSchemasX('public', rawSchemas);
const ammSchemas = jsonSchemasX.toCoreSchemas();

if (ammSchemas instanceof Error) {
  console.error('Schema 轉換失敗:', ammSchemas.message);
  return;
}

const ammOrm = new AmmOrm(sequelizeDb, ammSchemas);
```

##### `parseRawSchemas(): Error | void`

解析原始 Schema（內部使用）。

##### `normalizeRawSchemas(): Error | void`

正規化原始 Schema（內部使用）。

##### `buildModelTsFile(args?): Promise<string>`

生成 TypeScript 模型定義檔案。

```typescript
const tsContent = await jsonSchemasX.buildModelTsFile({
  orders: ['user', 'accountLink'], // 模型排序
  liquidRoot: './liquids',         // 模板目錄
});
```

##### `compareDb(db: Db): CompareResult`

比較 Schema 定義與實際資料庫結構。

```typescript
import pgStructure from 'pg-structure';

const db = await pgStructure(pgClient, { includeSchemas: ['public'] });
const result = jsonSchemasX.compareDb(db);

console.log('缺少的表格:', result.missedTables);
console.log('缺少的欄位:', result.missedColumns);
console.log('新增欄位 SQL:', result.missedColumnsQuery);
console.log('缺少的索引:', result.missedIndexes);
console.log('新增索引 SQL:', result.missedIndexesQuery);
```

##### `parseSchemaFromDb(db: Db): ParsedSchema`

從資料庫解析 Schema 結構。

```typescript
const parsed = jsonSchemasX.parseSchemaFromDb(db);
console.log('資料庫 Schema:', parsed.dbSchema);
console.log('表格:', parsed.tables);
```

#### 屬性

| 屬性 | 類型 | 說明 |
|------|------|------|
| `rawSchemas` | `RawSchemas` | 原始 JSON Schema |
| `dbSchemaName` | `string` | 資料庫 Schema 名稱 |
| `parsed` | `boolean` | 是否已解析 |
| `schemasMetadata` | `SchemasMetadata` | Schema 元數據 |
| `schemas` | `IJsonSchemas` | 解析後的 Schema |

### 6.2 AzModelManager 類別

**檔案**: `src/library/manager/AzModelManager.ts`

資料庫管理器，提供資料庫結構解析功能。

#### 建構函數

```typescript
constructor(connectString: string)
```

#### 方法

##### `getPgStructureDb(): Promise<Db>`

取得 PostgreSQL 資料庫結構。

##### `reportDb(): Promise<void>`

輸出資料庫結構報告。

##### `testParseSchema(): Promise<void>`

測試 Schema 解析。

### 6.3 IJsonSchemas 介面

**檔案**: `src/library/manager/azColumnTypes/jsonschemas/IJsonSchemas.ts`

定義 JSON Schema 的型別。

```typescript
interface IJsonSchemas<ModelExtraOptions = any, ExtraOptions = any, CEO = any> {
  models: { [s: string]: IJsonSchema<ModelExtraOptions, CEO> };
  associationModels: { [s: string]: IJsonSchema<ModelExtraOptions, CEO> };
  options?: IJsonSchemasOptions<ModelExtraOptions, ExtraOptions>;
  extraOptions?: ExtraOptions;
}

interface IJsonSchema<ModelExtraOptions = any, CEO = any> {
  columns: JsonModelAttributes<any, any, CEO>;
  options?: ModelOptions;
  extraOptions?: ModelExtraOptions;
}
```

---

## 7. Schema 定義指南

### 7.1 直接 Sequelize 格式

直接使用 Sequelize 的資料類型：

```typescript
import sequelize from 'sequelize';
import AmmOrm, { AmmSchemas } from 'az-model-manager/core';

const ammSchemas: AmmSchemas = {
  models: {
    user: {
      columns: {
        // 主鍵
        id: {
          type: sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: '主鍵',
        },

        // 字串
        username: {
          type: sequelize.STRING,      // VARCHAR(255)
          allowNull: false,
          unique: true,
        },
        email: sequelize.STRING(500),   // VARCHAR(500) - 簡寫

        // 數字
        age: sequelize.INTEGER,
        balance: sequelize.DECIMAL(10, 2),
        score: sequelize.FLOAT,

        // 布林
        isActive: {
          type: sequelize.BOOLEAN,
          defaultValue: true,
        },

        // 日期
        birthday: sequelize.DATEONLY,
        lastLogin: sequelize.DATE,

        // JSON
        metadata: {
          type: sequelize.JSONB,
          defaultValue: {},
        },

        // 文字
        bio: sequelize.TEXT,

        // UUID
        uuid: sequelize.UUID,

        // 關聯
        posts: {
          type: AmmOrm.columnTypes.HAS_MANY('post', {
            foreignKey: 'author_id',
          }),
        },
      },
      options: {
        tableName: 'tbl_user',  // 自訂表名（可選）
        indexes: [
          {
            unique: true,
            fields: ['email'],
            where: { deleted_at: null },
          },
        ],
        hooks: {
          beforeCreate: (user) => {
            // 建立前的處理
          },
        },
      },
    },
  },
  associationModels: {},
  options: {
    model: {
      tablePrefix: 'tbl_',  // 一般模型表前綴
    },
    associationModel: {
      tablePrefix: 'mn_',   // 多對多中間表前綴
    },
  },
};
```

### 7.2 支援的 Sequelize 資料類型

| 類型 | 說明 | 範例 |
|------|------|------|
| `STRING` | 變長字串 | `STRING`, `STRING(500)` |
| `STRING.BINARY` | 二進制字串 | `STRING(200, true)` |
| `TEXT` | 長文字 | `TEXT` |
| `INTEGER` | 整數 | `INTEGER` |
| `BIGINT` | 大整數 | `BIGINT`, `BIGINT.UNSIGNED` |
| `FLOAT` | 浮點數 | `FLOAT` |
| `DOUBLE` | 雙精度浮點數 | `DOUBLE` |
| `REAL` | 實數 | `REAL` |
| `DECIMAL` | 精確小數 | `DECIMAL(10, 2)` |
| `BOOLEAN` | 布林值 | `BOOLEAN` |
| `DATE` | 日期時間 | `DATE` |
| `DATEONLY` | 僅日期 | `DATEONLY` |
| `UUID` | UUID | `UUID` |
| `JSON` | JSON | `JSON` |
| `JSONB` | 二進制 JSON（PostgreSQL） | `JSONB` |
| `ARRAY` | 陣列（PostgreSQL） | `ARRAY(INTEGER)` |
| `RANGE` | 範圍（PostgreSQL） | `RANGE(INTEGER)` |

### 7.3 模型選項 (ModelOptions)

```typescript
interface ModelOptions {
  // 表格設定
  tableName?: string;                    // 自訂表名
  timestamps?: boolean;                  // 是否自動管理時間戳（預設 true）
  paranoid?: boolean;                    // 是否啟用軟刪除（預設 true）
  underscored?: boolean;                 // 使用底線命名（預設 true）

  // 時間戳欄位名稱
  createdAt?: string | boolean;          // 預設 'created_at'
  updatedAt?: string | boolean;          // 預設 'updated_at'
  deletedAt?: string | boolean;          // 預設 'deleted_at'

  // 模型名稱
  name?: {
    singular?: string;
    plural?: string;
  };

  // 索引
  indexes?: IndexesOptions[];

  // 鉤子函數
  hooks?: {
    beforeCreate?: (instance, options) => void | Promise<void>;
    afterCreate?: (instance, options) => void | Promise<void>;
    beforeUpdate?: (instance, options) => void | Promise<void>;
    afterUpdate?: (instance, options) => void | Promise<void>;
    beforeDestroy?: (instance, options) => void | Promise<void>;
    afterDestroy?: (instance, options) => void | Promise<void>;
    beforeSync?: (options) => void | Promise<void>;
    afterSync?: (options) => void | Promise<void>;
    // ... 更多鉤子
  };

  // 預設作用域
  defaultScope?: {
    attributes?: { exclude?: string[]; include?: string[] };
    where?: object;
  };
}
```

### 7.4 索引定義

```typescript
{
  options: {
    indexes: [
      // 唯一索引
      {
        unique: true,
        fields: ['email'],
        where: { deleted_at: null },  // 部分索引
      },

      // 複合索引
      {
        name: 'idx_user_org',
        fields: ['user_id', 'organization_id'],
      },

      // 命名索引
      {
        name: 'custom_index_name',
        unique: true,
        fields: ['provider_id', 'provider_user_id'],
        where: { deleted_at: null },
      },
    ],
  },
}
```

---

## 8. 關聯類型詳解

### 8.1 一對一關聯 (HasOne)

外鍵存在於**目標模型**。

```typescript
// User hasOne Profile
// 外鍵 user_id 在 profile 表

const schemas: AmmSchemas = {
  models: {
    user: {
      columns: {
        id: { type: sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        username: sequelize.STRING,
        profile: {
          type: AmmOrm.columnTypes.HAS_ONE('profile', {
            foreignKey: 'user_id',
          }),
        },
      },
    },
    profile: {
      columns: {
        id: { type: sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        bio: sequelize.TEXT,
        user: {
          type: AmmOrm.columnTypes.BELONGS_TO('user', {
            foreignKey: 'user_id',
          }),
        },
      },
    },
  },
};

// 使用
const user = await User.create({
  username: 'john',
  profile: {
    bio: 'Hello World',
  },
});

// 查詢
const userWithProfile = await User.findOne({
  where: { id: 1 },
  include: [{ model: Profile, as: 'profile' }],
});
```

### 8.2 一對多關聯 (HasMany)

外鍵存在於**目標模型**。

```typescript
// User hasMany Posts
// 外鍵 author_id 在 post 表

const schemas: AmmSchemas = {
  models: {
    user: {
      columns: {
        id: { type: sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        username: sequelize.STRING,
        posts: {
          type: AmmOrm.columnTypes.HAS_MANY('post', {
            foreignKey: 'author_id',
          }),
        },
      },
    },
    post: {
      columns: {
        id: { type: sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        title: sequelize.STRING,
        content: sequelize.TEXT,
        author: {
          type: AmmOrm.columnTypes.BELONGS_TO('user', {
            foreignKey: 'author_id',
          }),
        },
      },
    },
  },
};

// 使用 - 建立帶有多個文章的使用者
const user = await User.create({
  username: 'john',
  posts: [
    { title: 'Post 1', content: 'Content 1' },
    { title: 'Post 2', content: 'Content 2' },
  ],
});

// 查詢使用者的所有文章
const userWithPosts = await User.findOne({
  where: { id: 1 },
  include: [{ model: Post, as: 'posts' }],
});
```

### 8.3 屬於關聯 (BelongsTo)

外鍵存在於**本模型**。

```typescript
// Post belongsTo User
// 外鍵 author_id 在 post 表

const schemas: AmmSchemas = {
  models: {
    post: {
      columns: {
        id: { type: sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        title: sequelize.STRING,
        // author_id 欄位會自動建立
        author: {
          type: AmmOrm.columnTypes.BELONGS_TO('user', {
            foreignKey: 'author_id',
            targetKey: 'id',  // 目標模型的鍵（通常是主鍵）
          }),
        },
      },
    },
  },
};

// 使用 - 建立文章並關聯到現有使用者
const post = await Post.create({
  title: 'New Post',
  author_id: 1,  // 直接設定外鍵
});

// 或者巢狀建立
const postWithAuthor = await Post.create({
  title: 'New Post',
  author: {
    username: 'new_user',
  },
});

// 查詢文章的作者
const postWithAuthor = await Post.findOne({
  where: { id: 1 },
  include: [{ model: User, as: 'author' }],
});
```

### 8.4 多對多關聯 (BelongsToMany)

使用**中間表**連接兩個模型。

```typescript
// User belongsToMany UserGroup (through UserUserGroup)
// 中間表: mn_user_user_group

const schemas: AmmSchemas = {
  models: {
    user: {
      columns: {
        id: { type: sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        username: sequelize.STRING,
        userGroups: {
          type: AmmOrm.columnTypes.BELONGS_TO_MANY('userGroup', {
            through: {
              ammModelName: 'userUserGroup',  // 中間表模型名稱
              ammThroughAs: 'relationship',   // 存取中間表資料的別名
            },
            foreignKey: 'user_id',   // user 在中間表的外鍵
            otherKey: 'group_id',    // userGroup 在中間表的外鍵
          }),
        },
      },
    },
    userGroup: {
      columns: {
        id: { type: sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        name: sequelize.STRING,
        users: {
          type: AmmOrm.columnTypes.BELONGS_TO_MANY('user', {
            through: {
              ammModelName: 'userUserGroup',
              ammThroughAs: 'relationship',
            },
            foreignKey: 'group_id',
            otherKey: 'user_id',
          }),
        },
      },
    },
  },
  // 中間表定義
  associationModels: {
    userUserGroup: {
      columns: {
        id: { type: sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        role: sequelize.STRING,  // 額外欄位
      },
      options: {
        indexes: [
          {
            unique: true,
            fields: ['user_id', 'group_id'],
            where: { deleted_at: null },
          },
        ],
      },
    },
  },
};

// 使用 - 建立使用者並加入群組
const user = await User.create({
  username: 'john',
  userGroups: [{
    name: 'Admin Group',
    [AmmOrm.ThroughValues]: {
      role: 'owner',  // 中間表的額外欄位
    },
  }],
});

// 或建立群組並加入使用者
const group = await UserGroup.create({
  name: 'New Group',
  users: [{
    username: 'new_member',
    [AmmOrm.ThroughValues]: {
      role: 'member',
    },
  }],
});

// 查詢使用者的所有群組（包含中間表資料）
const userWithGroups = await User.findOne({
  where: { id: 1 },
  include: [{
    model: UserGroup,
    as: 'userGroups',
    through: { attributes: ['role'] },  // 包含中間表欄位
  }],
});

// 存取中間表資料
userWithGroups.userGroups.forEach(group => {
  console.log(`${group.name}: ${group.relationship.role}`);
});
```

### 8.5 自動 Include 機制

AMM 提供自動 Include 功能，可以在建立資料時自動處理巢狀關聯：

```typescript
// 傳統 Sequelize 需要明確指定 include
const user = await User.create({
  username: 'john',
  posts: [{ title: 'Post 1' }],
}, {
  include: [{
    model: Post,
    as: 'posts',
  }],
});

// AMM 自動偵測並處理
const user = await User.create({
  username: 'john',
  posts: [{ title: 'Post 1' }],
});  // 不需要 include 選項！

// 多層巢狀也可以
const accountLink = await AccountLink.create({
  provider_id: 'github',
  owner: {
    username: 'john',
    posts: [{ title: 'Post 1' }],
  },
});
```

### 8.6 使用 ammInclude 簡化查詢

```typescript
const User = ammOrm.getSqlzModel('user');

// 傳統方式
const user = await User.findOne({
  where: { id: 1 },
  include: [
    { model: Post, as: 'posts' },
    { model: Profile, as: 'profile' },
  ],
});

// 使用 ammInclude
const user = await User.findOne({
  where: { id: 1 },
  include: User.ammInclude(['posts', 'profile']),
});

// 巢狀關聯
const user = await User.findOne({
  where: { id: 1 },
  include: User.ammInclude([
    'posts',
    'posts.comments',        // 巢狀關聯
    'profile',
    'userGroups',
  ]),
});

// 帶額外選項
const user = await User.findOne({
  where: { id: 1 },
  include: User.ammInclude([
    { as: 'posts', required: true },
    { as: 'profile', attributes: ['bio'] },
  ]),
});
```

### 8.7 反向關聯自動生成（JSON Schema 功能）

在使用 JSON Schema 格式定義時，`belongsTo` 關聯支援自動生成反向關聯。

#### 8.7.1 ammTargetAs 與 ammTargetHasMany

通過設定 `ammTargetAs` 和 `ammTargetHasMany` 選項，可以自動在目標模型生成反向關聯：

```typescript
// JSON Schema 定義
const rawSchemas = {
  models: {
    post: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        title: 'string',
        // 定義 belongsTo 並自動生成反向關聯
        author: ['belongsTo', 'user', {
          foreignKey: 'author_id',
          ammTargetAs: 'posts',         // 在 user 模型自動生成 'posts' 欄位
          ammTargetHasMany: true,       // 生成 hasMany（如果是 false 則生成 hasOne）
        }],
      },
    },
    user: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        username: 'string',
        // 不需要手動定義 posts！會自動生成：
        // posts: ['hasMany', 'post', { foreignKey: 'author_id' }]
      },
    },
  },
};
```

**選項說明**:
| 選項 | 類型 | 說明 |
|------|------|------|
| `ammTargetAs` | `string` | 在目標模型中自動生成的關聯欄位名稱 |
| `ammTargetHasMany` | `boolean` | `true` 生成 `hasMany`，`false`（預設）生成 `hasOne` |

#### 8.7.2 外鍵欄位自動生成

使用 JSON Schema 時，如果 `belongsTo` 關聯的外鍵欄位沒有明確定義，系統會自動建立：

```typescript
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
        // author_id 欄位會自動生成，包含：
        // - 類型：從 user.id 推斷（bigint）
        // - 外鍵約束：references user(id)
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
```

#### 8.7.3 中間表關聯自動生成

`belongsToMany` 會自動在中間表（associationModel）中生成對應的 `belongsTo` 關聯：

```typescript
const rawSchemas = {
  models: {
    user: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        userGroups: ['belongsToMany', 'userGroup', {
          through: {
            ammModelName: 'userUserGroup',
            ammThroughTableColumnAs: 'user',   // 中間表中的關聯欄位名
            ammThroughAs: 'membership',        // 存取中間表的別名
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
        // 以下欄位會自動生成：
        // user: ['belongsTo', 'user', { foreignKey: 'user_id', ... }]
        // group: ['belongsTo', 'userGroup', { foreignKey: 'group_id', ... }]
      },
    },
  },
};
```

#### 8.7.4 索引自動生成

JSON Schema 處理時會自動生成以下索引：

1. **時間戳索引**：`created_at`、`updated_at`、`deleted_at`
2. **外鍵索引**：所有帶有 `ammReferences` 的欄位

```typescript
// 自動生成的索引範例：
// tbl_post_created_at
// tbl_post_updated_at
// tbl_post_deleted_at
// tbl_post_author_id  (外鍵索引)
```

> **詳細說明**: 請參考 [JSON Schema 處理系統詳解](./JSON_SCHEMA_PROCESSING.md) 了解完整的處理流程和更多進階功能。

---

## 9. JSON Schema 格式

### 9.1 概述

JSON Schema 格式是 AMM 提供的簡化 Schema 定義方式，使用字串或陣列表示資料類型，比直接使用 Sequelize 更簡潔。

### 9.2 基本類型對照表

| JSON Schema 類型 | Sequelize 類型 | 範例 |
|------------------|----------------|------|
| `'string'` | `STRING` | `'string'` 或 `['string', 255]` |
| `'text'` | `TEXT` | `'text'` |
| `'integer'` | `INTEGER` | `'integer'` |
| `'bigint'` | `BIGINT` | `'bigint'` |
| `'float'` | `FLOAT` | `'float'` |
| `'double'` | `DOUBLE` | `'double'` |
| `'real'` | `REAL` | `'real'` |
| `'decimal'` | `DECIMAL` | `['decimal', 10, 2]` |
| `'boolean'` | `BOOLEAN` | `'boolean'` |
| `'date'` | `DATE` | `'date'` |
| `'dateonly'` | `DATEONLY` | `'dateonly'` |
| `'uuid'` | `UUID` | `'uuid'` |
| `'json'` | `JSON` | `'json'` |
| `'jsonb'` | `JSONB` | `'jsonb'` |
| `'binary'` | `STRING.BINARY` / `BLOB` | `'binary'` |
| `'range'` | `RANGE` | `['range', 'integer']` |

### 9.3 關聯類型對照表

| JSON Schema 格式 | 關聯類型 |
|-----------------|----------|
| `['hasOne', targetModel, options]` | 一對一 |
| `['hasMany', targetModel, options]` | 一對多 |
| `['belongsTo', targetModel, options]` | 屬於 |
| `['belongsToMany', targetModel, options]` | 多對多 |

### 9.4 完整 JSON Schema 範例

```typescript
import { IJsonSchemas } from 'az-model-manager/manager';

const rawSchemas: IJsonSchemas = {
  models: {
    // 使用者模型
    user: {
      columns: {
        // 主鍵
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },

        // 字串 - 簡寫
        username: 'string',

        // 字串 - 帶長度
        email: ['string', 500],

        // 字串 - 完整選項
        nickname: {
          type: 'string',
          allowNull: true,
          defaultValue: null,
          comment: '暱稱',
        },

        // 帶長度的字串 - 完整選項
        displayName: {
          type: ['string', 200],
          defaultValue: 'anonymous',
        },

        // 數字類型
        age: 'integer',
        balance: {
          type: ['decimal', 10, 2],
          defaultValue: 0,
        },

        // 布林
        isActive: {
          type: 'boolean',
          defaultValue: true,
        },

        // 日期
        birthday: 'dateonly',
        lastLogin: 'date',

        // JSON
        settings: {
          type: 'jsonb',
          defaultValue: {},
        },

        // 關聯 - 一對多
        posts: ['hasMany', 'post', {
          foreignKey: 'author_id',
        }],

        // 關聯 - 多對多
        userGroups: ['belongsToMany', 'userGroup', {
          through: {
            ammModelName: 'userUserGroup',
            ammThroughAs: 'membership',
          },
          foreignKey: 'user_id',
          otherKey: 'group_id',
        }],

        // 外鍵引用（手動定義外鍵欄位）
        department_id: {
          type: 'bigint',
          ammReferences: {
            model: 'department',
            key: 'id',
            deferrable: 'initially_immediate',
          },
        },
      },
      options: {
        name: {
          singular: 'user',
          plural: 'users',
        },
        indexes: [
          {
            unique: true,
            fields: ['email'],
            where: { deleted_at: null },
          },
        ],
        hooks: {
          afterSync(options: any) {
            // 設定序列起始值
            return options.sequelize.query(
              "SELECT setval('tbl_user_id_seq', 1000000001, false)"
            );
          },
        },
      },
    },

    // 文章模型
    post: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        title: ['string', 500],
        content: 'text',
        status: {
          type: ['string', 50],
          defaultValue: 'draft',
        },
        views: {
          type: 'integer',
          defaultValue: 0,
        },
        metadata: {
          type: 'jsonb',
          defaultValue: {},
        },

        // 屬於
        author: ['belongsTo', 'user', {
          foreignKey: 'author_id',
        }],

        // 一對一
        postDetail: ['hasOne', 'postDetail', {
          foreignKey: 'post_id',
        }],

        // 一對多
        comments: ['hasMany', 'comment', {
          foreignKey: 'post_id',
        }],
      },
      options: {
        indexes: [
          {
            fields: ['author_id'],
          },
          {
            fields: ['status'],
          },
        ],
      },
    },

    // 群組模型
    userGroup: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        name: ['string', 200],
        description: 'text',

        users: ['belongsToMany', 'user', {
          through: {
            ammModelName: 'userUserGroup',
            ammThroughAs: 'membership',
          },
          foreignKey: 'group_id',
          otherKey: 'user_id',
        }],
      },
    },
  },

  // 中間表模型
  associationModels: {
    userUserGroup: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        role: {
          type: 'string',
          defaultValue: 'member',
        },
        joinedAt: 'date',
        permissions: {
          type: 'jsonb',
          defaultValue: {},
        },
      },
      options: {
        indexes: [
          {
            name: 'unique_user_group',
            unique: true,
            fields: ['user_id', 'group_id'],
            where: { deleted_at: null },
          },
        ],
      },
    },
  },

  // 全域選項
  options: {
    model: {
      tablePrefix: 'tbl_',
    },
    associationModel: {
      tablePrefix: 'mn_',
    },
  },
};
```

### 9.5 外鍵引用 (ammReferences)

用於手動定義外鍵約束：

```typescript
{
  columns: {
    // 自動推遲檢查的外鍵
    user_id: {
      type: 'bigint',
      ammReferences: {
        model: 'user',           // 目標模型
        key: 'id',               // 目標欄位
        deferrable: 'initially_immediate',  // 推遲模式
        autogenerated: false,    // 是否自動生成
      },
    },
  },
}
```

**deferrable 選項**:
- `'initially_immediate'`: 立即檢查約束
- `'initially_deferred'`: 延遲到交易結束時檢查
- `'not'`: 不可延遲

### 9.6 轉換為 Core Schema

```typescript
import { JsonSchemasX } from 'az-model-manager/manager';
import { Sequelize } from 'sequelize';
import AmmOrm from 'az-model-manager/core';

// 原始 JSON Schema
const rawSchemas = {
  models: {
    user: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        username: 'string',
      },
    },
  },
  associationModels: {},
};

// 轉換
const jsonSchemasX = new JsonSchemasX('public', rawSchemas);
const ammSchemas = jsonSchemasX.toCoreSchemas();

if (ammSchemas instanceof Error) {
  console.error('轉換失敗:', ammSchemas.message);
  process.exit(1);
}

// 使用
const sequelizeDb = new Sequelize('postgres://...');
const ammOrm = new AmmOrm(sequelizeDb, ammSchemas);
```

---

## 10. 工具函數

### 10.1 toSeqPromise

順序執行 Promise 陣列，用於需要依序處理的操作。

```typescript
import { toSeqPromise } from 'az-model-manager/core/utils';

const items = [1, 2, 3, 4, 5];

await toSeqPromise(items, async (prev, value, index, array) => {
  console.log(`處理第 ${index + 1} 個: ${value}`);
  await someAsyncOperation(value);
  return Promise.resolve();
});
```

### 10.2 promiseWait

建立延遲 Promise。

```typescript
import { promiseWait } from 'az-model-manager/core/utils';

console.log('開始');
await promiseWait(2000);  // 等待 2 秒
console.log('2 秒後');
```

### 10.3 toMap

將陣列轉換為以指定鍵索引的物件。

```typescript
import { toMap } from 'az-model-manager/core/utils';

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
];

const userMap = toMap(users, user => user.id);
// 結果:
// {
//   '1': { id: 1, name: 'Alice' },
//   '2': { id: 2, name: 'Bob' },
//   '3': { id: 3, name: 'Charlie' },
// }

console.log(userMap['2'].name);  // 'Bob'
```

### 10.4 命名轉換函數

```typescript
import { toCamel, toUnderscore, capitalizeFirstLetter } from 'az-model-manager/core/utils';

// 底線轉駝峰
toCamel('user_name');        // 'userName'
toCamel('first_name_last'); // 'firstNameLast'

// 駝峰轉底線
toUnderscore('userName');    // 'user_name'
toUnderscore('firstName');   // 'first_name'

// 首字母大寫
capitalizeFirstLetter('user');    // 'User'
capitalizeFirstLetter('myModel'); // 'MyModel'
```

---

## 11. 進階用法

### 11.1 交易處理

```typescript
const sequelizeDb = ammOrm.db;
const User = ammOrm.getSqlzModel('user');
const Post = ammOrm.getSqlzModel('post');

// 使用交易
const transaction = await sequelizeDb.transaction({
  isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
});

try {
  const user = await User.create({
    username: 'john',
    posts: [{ title: 'Post 1' }],
  }, { transaction });

  await Post.create({
    title: 'Another Post',
    author_id: user.id,
  }, { transaction });

  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

### 11.2 多對多中間表資料

```typescript
const User = ammOrm.getSqlzModel('user');
const UserGroup = ammOrm.getSqlzModel('userGroup');

// 建立時設定中間表資料
const group = await UserGroup.create({
  name: 'Admin Group',
  users: [{
    username: 'admin',
    [AmmOrm.ThroughValues]: {
      role: 'owner',
      permissions: { canDelete: true, canEdit: true },
    },
  }, {
    username: 'member1',
    [AmmOrm.ThroughValues]: {
      role: 'member',
      permissions: { canDelete: false, canEdit: true },
    },
  }],
});

// 查詢時取得中間表資料
const userWithGroups = await User.findOne({
  where: { username: 'admin' },
  include: [{
    model: UserGroup,
    as: 'userGroups',
    through: {
      attributes: ['role', 'permissions'],
    },
  }],
});

// 存取中間表資料
userWithGroups.userGroups.forEach(group => {
  const membership = group.membership;  // ammThroughAs 定義的別名
  console.log(`群組: ${group.name}, 角色: ${membership.role}`);
});
```

### 11.3 資料庫結構比較

```typescript
import pgStructure from 'pg-structure';
import { JsonSchemasX } from 'az-model-manager/manager';
import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  user: 'postgres',
  password: 'password',
});

await client.connect();

// 從資料庫取得結構
const db = await pgStructure(client, {
  includeSchemas: ['public'],
  keepConnection: true,
});

// 比較 Schema 與資料庫
const jsonSchemasX = new JsonSchemasX('public', rawSchemas);
const result = jsonSchemasX.compareDb(db);

if (result.missedTables.length > 0) {
  console.log('缺少的表格:', result.missedTables);
}

if (result.missedColumns.length > 0) {
  console.log('缺少的欄位:', result.missedColumns);
  console.log('新增欄位的 SQL:\n', result.missedColumnsQuery);
}

if (result.missedIndexes.length > 0) {
  console.log('缺少的索引:', result.missedIndexes);
  console.log('新增索引的 SQL:\n', result.missedIndexesQuery);
}

await client.end();
```

### 11.4 生成 TypeScript 類型定義

```typescript
const jsonSchemasX = new JsonSchemasX('public', rawSchemas);

// 確保 Schema 已解析
const schemas = jsonSchemasX.toCoreSchemas();
if (schemas instanceof Error) throw schemas;

// 生成 TypeScript 檔案
const tsContent = await jsonSchemasX.buildModelTsFile({
  orders: ['user', 'post', 'userGroup'],  // 模型排序
  liquidRoot: './node_modules/az-model-manager/liquids',  // 模板路徑
});

// 寫入檔案
import fs from 'fs';
fs.writeFileSync('./src/models.ts', tsContent);
```

### 11.5 自訂表名前綴

```typescript
const ammSchemas: AmmSchemas = {
  models: {
    user: { /* ... */ },
  },
  associationModels: {
    userUserGroup: { /* ... */ },
  },
  options: {
    model: {
      tablePrefix: 'app_',  // 一般模型: app_user
    },
    associationModel: {
      tablePrefix: 'rel_',  // 關聯模型: rel_user_user_group
    },
  },
};
```

### 11.6 使用鉤子

```typescript
const rawSchemas = {
  models: {
    user: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        username: 'string',
        passwordHash: 'string',
      },
      options: {
        hooks: {
          // 建立前
          beforeCreate: async (user, options) => {
            if (user.password) {
              user.passwordHash = await hashPassword(user.password);
            }
          },

          // 更新前
          beforeUpdate: async (user, options) => {
            if (user.changed('password')) {
              user.passwordHash = await hashPassword(user.password);
            }
          },

          // 同步後（用於設定序列值等）
          afterSync: async (options) => {
            await options.sequelize.query(
              "SELECT setval('app_user_id_seq', 1000000, false)"
            );
          },
        },
      },
    },
  },
};
```

---

## 12. 測試

### 12.1 測試環境設置

使用 Docker 啟動 PostgreSQL：

```bash
npm run start-db    # 啟動 PostgreSQL
npm run stop-db     # 停止 PostgreSQL
```

`dev.yml` 配置：
```yaml
version: '3'
services:
  postgres:
    image: postgres:13
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: test_db
```

### 12.2 執行測試

```bash
npm test              # 執行所有測試
npm run test-watch    # 監視模式
```

### 12.3 測試範例

```typescript
// test/library/example.spec.ts
import chai from 'chai';
import { Sequelize } from 'sequelize';
import AmmOrm from 'library/core';
import AzRdbmsMgr from '../test-utils/AzRdbmsMgr';
import { getModelDefs01 } from '../test-data/az-sequelize-utils-testdata';

const { expect } = chai;

describe('User Model Tests', () => {
  let ammMgr: AzRdbmsMgr;

  beforeEach(async () => {
    // 重設資料庫
    await resetTestDb();
    ammMgr = new AzRdbmsMgr(
      getModelDefs01(),
      'postgres://postgres:postgres@localhost:5432/test_db',
      console.log
    );
    await ammMgr.sync();
  });

  afterEach(async () => {
    await ammMgr.close();
  });

  it('should create user with nested associations', async () => {
    const User = ammMgr.ammOrm.getSqlzModel('user');
    const AccountLink = ammMgr.ammOrm.getSqlzModel('accountLink');

    const user = await User.create({
      username: 'testuser',
      accountLinks: [{
        provider_id: 'github',
        provider_user_id: '12345',
      }],
    });

    expect(user.username).to.equal('testuser');
    expect(user.id).to.be.a('number');

    // 驗證關聯
    const userWithLinks = await User.findOne({
      where: { id: user.id },
      include: [{ model: AccountLink, as: 'accountLinks' }],
    });

    expect(userWithLinks.accountLinks).to.have.length(1);
    expect(userWithLinks.accountLinks[0].provider_id).to.equal('github');
  });

  it('should handle many-to-many with through values', async () => {
    const UserGroup = ammMgr.ammOrm.getSqlzModel('userGroup');
    const User = ammMgr.ammOrm.getSqlzModel('user');

    const group = await UserGroup.create({
      name: 'Test Group',
      users: [{
        username: 'member1',
        [AmmOrm.ThroughValues]: {
          role: 'admin',
        },
      }],
    });

    const groupWithUsers = await UserGroup.findOne({
      where: { id: group.id },
      include: [{
        model: User,
        as: 'users',
        through: { attributes: ['role'] },
      }],
    });

    expect(groupWithUsers.users[0].relationship.role).to.equal('admin');
  });
});
```

---

## 13. 架構設計

### 13.1 目錄結構

```
az-model-manager/
├── src/
│   └── library/
│       ├── index.ts                    # 主導出檔
│       ├── core/                       # 核心 ORM 模組
│       │   ├── index.ts                # Core 模組導出
│       │   ├── AmmOrm/                 # ORM 主類
│       │   │   ├── index.ts            # AmmOrm 類
│       │   │   └── OriginalAmmOrm.ts   # 基礎 ORM 類
│       │   ├── AmmModel.ts             # 模型類
│       │   ├── AssociationModel.ts     # 關聯模型類
│       │   ├── columnTypes.ts          # 欄位類型定義
│       │   ├── interfaces.ts           # 介面定義
│       │   └── utils.ts                # 工具函數
│       └── manager/                    # 管理層模組
│           ├── index.ts                # Manager 模組導出
│           ├── AzModelManager.ts       # 資料庫管理器
│           ├── azColumnTypes/          # JSON Schema 類型
│           │   └── jsonschemas/
│           │       ├── index.ts
│           │       ├── IJsonSchemas.ts # JSON Schema 介面
│           │       ├── JsonSchemasX.ts # Schema 轉換器
│           │       ├── JsonSchemasXHelpers.ts
│           │       ├── typeConfigs.ts  # 類型配置
│           │       └── interfaces.ts
│           ├── getTestSchema.ts        # 測試 Schema
│           └── azpg/
│               └── az_pglib.js         # PostgreSQL 工具
├── test/
│   ├── library/                        # 測試用例
│   │   └── *.spec.js
│   ├── test-data/                      # 測試資料
│   │   └── az-sequelize-utils-testdata/
│   └── test-utils/                     # 測試工具
│       ├── AzRdbmsMgr.ts
│       └── utils.js
├── liquids/                            # Liquid 模板
├── package.json
└── tsconfig.json
```

### 13.2 資料流

```
用戶定義 Schema
      ↓
┌─────────────────────────────────────────────────────┐
│                   JSON Schema                        │
│  (簡化的字串/陣列格式)                               │
└─────────────────────────────────────────────────────┘
      ↓ JsonSchemasX.toCoreSchemas()
┌─────────────────────────────────────────────────────┐
│                   Core Schema                        │
│  (AmmSchemas, 使用 Sequelize 類型)                   │
└─────────────────────────────────────────────────────┘
      ↓ new AmmOrm()
┌─────────────────────────────────────────────────────┐
│                    AmmOrm                            │
│  - 建立 AmmModel 實例                                │
│  - 建立 AssociationModel 實例                        │
│  - 設置關聯                                          │
└─────────────────────────────────────────────────────┘
      ↓ Sequelize Model
┌─────────────────────────────────────────────────────┐
│              Sequelize Models                        │
│  - 帶有 ammInclude 方法                              │
│  - 自動 Include 的 build/save                        │
└─────────────────────────────────────────────────────┘
      ↓ 資料庫操作
┌─────────────────────────────────────────────────────┐
│                PostgreSQL Database                   │
└─────────────────────────────────────────────────────┘
```

### 13.3 類別關係圖

```
┌─────────────────────────────────────────────────────────────┐
│                        AmmOrm                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  tableInfo: { [name]: AmmModel }                    │    │
│  │  associationModelInfo: { [name]: AssociationModel } │    │
│  │  db: Sequelize                                      │    │
│  │  ammSchemas: AmmSchemas                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                     AmmModel                        │    │
│  │  ┌─────────────────────────────────────────────┐   │    │
│  │  │  sqlzModel: ModelDefined (Sequelize Model)  │   │    │
│  │  │  associations: { [name]: AssociationColumn }│   │    │
│  │  │  columns: ModelAttributes                   │   │    │
│  │  └─────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                AssociationModel                     │    │
│  │            (extends AmmModel)                       │    │
│  │            tablePrefix: 'mn_'                       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     JsonSchemasX                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  rawSchemas: RawSchemas (JSON 格式)                 │    │
│  │  schemas: IJsonSchemas (解析後)                     │    │
│  │  schemasMetadata: SchemasMetadata                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                              │                               │
│                  toCoreSchemas()                             │
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              AmmSchemas (Core 格式)                 │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 13.4 設計模式

1. **工廠模式**: `columnTypes` 中的 `HAS_ONE`, `HAS_MANY` 等函數
2. **裝飾器模式**: 增強 Sequelize Model 的 `build` 和 `save` 方法
3. **代理模式**: `ExtendedModelDefined` 包裝 Sequelize Model
4. **建造者模式**: `JsonSchemasX` 逐步解析和轉換 Schema

---

## 附錄

### A. 錯誤處理

```typescript
import { JsonSchemasX } from 'az-model-manager/manager';

const jsonSchemasX = new JsonSchemasX('public', rawSchemas);
const result = jsonSchemasX.toCoreSchemas();

// 檢查是否為錯誤
if (result instanceof Error) {
  console.error('Schema 解析錯誤:', result.message);
  // 處理錯誤...
  return;
}

// result 是有效的 AmmSchemas
const ammOrm = new AmmOrm(sequelizeDb, result);
```

### B. 常見問題

**Q: 為什麼關聯沒有自動建立？**
A: 確保兩邊的模型都正確定義了關聯，且外鍵名稱一致。

**Q: 如何處理軟刪除？**
A: AMM 預設啟用 `paranoid: true`，使用 `deleted_at` 欄位。刪除時會設定 `deleted_at`，查詢時會自動排除。

**Q: 表名不符合預期怎麼辦？**
A: 可以在模型選項中明確指定 `tableName`，或調整 `options.model.tablePrefix`。

### C. 版本歷史

- **0.7.0**: 修復 source key bug
- **0.6.2**: 更新框架
- **0.6.0**: 支援 JSON Schema 格式

---

*本文件由 Az Model Manager 開發團隊維護。如有問題，請提交 Issue。*
