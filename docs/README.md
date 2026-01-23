# Az Model Manager 文件

歡迎使用 Az Model Manager (AMM) 文件！

## 文件列表

| 文件 | 說明 | 適合對象 |
|------|------|----------|
| [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) | 完整技術文件 | 需要深入了解框架的開發者 |
| [API_REFERENCE.md](./API_REFERENCE.md) | API 快速參考 | 需要快速查閱 API 的開發者 |
| [EXAMPLES.md](./EXAMPLES.md) | 範例程式碼集 | 想要看實際用法的開發者 |
| [JSON_SCHEMA_PROCESSING.md](./JSON_SCHEMA_PROCESSING.md) | JSON Schema 處理系統詳解 | 需要了解 Schema 處理內部實作的開發者 |

## 快速入門

### 安裝

```bash
npm install az-model-manager sequelize pg pg-structure
```

### 基本使用

```typescript
import { Sequelize } from 'sequelize';
import AmmOrm, { AmmSchemas } from 'az-model-manager/core';

// 定義 Schema
const ammSchemas: AmmSchemas = {
  models: {
    user: {
      columns: {
        id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        username: Sequelize.STRING,
      },
    },
  },
};

// 建立 ORM
const sequelizeDb = new Sequelize('postgres://...');
const ammOrm = new AmmOrm(sequelizeDb, ammSchemas);

// 使用模型
const User = ammOrm.getSqlzModel('user');
await User.create({ username: 'john' });
```

## 文件內容概覽

### TECHNICAL_DOCUMENTATION.md

- 專案概述與安裝指南
- 核心概念與架構設計
- 完整 API 參考
- Schema 定義指南
- 關聯類型詳解
- JSON Schema 格式說明
- 進階用法與最佳實踐

### API_REFERENCE.md

- 模組導入速查
- 類別方法速查表
- 類型定義速查
- 關聯類型語法
- 工具函數列表

### EXAMPLES.md

- 基本設置範例
- 完整模型定義範例
- CRUD 操作範例
- 關聯操作範例
- JSON Schema 範例
- 電商系統完整範例
- 進階用法（交易、批次處理、驗證等）

### JSON_SCHEMA_PROCESSING.md

- Schema 處理完整流程（7 個階段詳解）
- TypeConfig 系統與類型配置
- **反向關聯自動生成**（belongsTo → hasOne/hasMany）
- **外鍵欄位自動生成**（從關聯推斷）
- **中間表關聯自動處理**（belongsToMany）
- **索引自動生成**（時間戳、外鍵）
- TypeScript 類型生成
- 資料庫結構比較與遷移 SQL 生成
- 完整處理範例（輸入到輸出）

## 相關連結

- [GitHub Repository](https://github.com/xtforgame/az-model-manager)
- [Sequelize 文件](https://sequelize.org/)
- [pg-structure 文件](https://www.pg-structure.com/)

## 版本資訊

- **目前版本**: 0.7.0
- **Node.js 需求**: >= 14.0
- **Sequelize 版本**: ^6.3.5
- **PostgreSQL**: 支援

## 問題回報

如有問題或建議，請至 GitHub 提交 Issue。
