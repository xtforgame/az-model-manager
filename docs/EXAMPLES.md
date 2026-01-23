# Az Model Manager 範例程式碼

本文件提供各種使用情境的完整範例。

---

## 目錄

1. [基本設置](#1-基本設置)
2. [模型定義範例](#2-模型定義範例)
3. [CRUD 操作](#3-crud-操作)
4. [關聯操作](#4-關聯操作)
5. [JSON Schema 範例](#5-json-schema-範例)
6. [進階範例](#6-進階範例)

---

## 1. 基本設置

### 1.1 使用 Sequelize 類型定義

```typescript
import { Sequelize } from 'sequelize';
import sequelize from 'sequelize';
import AmmOrm, { AmmSchemas } from 'az-model-manager/core';

// 定義 Schema
const ammSchemas: AmmSchemas = {
  models: {
    user: {
      columns: {
        id: {
          type: sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        username: {
          type: sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        email: sequelize.STRING(255),
        createdAt: sequelize.DATE,
      },
      options: {
        indexes: [
          {
            unique: true,
            fields: ['email'],
            where: { deleted_at: null },
          },
        ],
      },
    },
  },
  associationModels: {},
};

// 建立連線
const sequelizeDb = new Sequelize('postgres://user:password@localhost:5432/mydb', {
  dialect: 'postgres',
  logging: console.log,
});

// 建立 ORM 實例
const ammOrm = new AmmOrm(sequelizeDb, ammSchemas);

// 同步資料庫
async function init() {
  await ammOrm.sync(true); // true = 強制重建表格
  console.log('資料庫同步完成');
}

init();
```

### 1.2 使用 JSON Schema 定義

```typescript
import { Sequelize } from 'sequelize';
import AmmOrm from 'az-model-manager/core';
import { JsonSchemasX, IJsonSchemas } from 'az-model-manager/manager';

// JSON Schema 定義
const rawSchemas: IJsonSchemas = {
  models: {
    user: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        username: {
          type: 'string',
          allowNull: false,
        },
        email: ['string', 255],
        settings: {
          type: 'jsonb',
          defaultValue: {},
        },
      },
    },
  },
  associationModels: {},
};

// 轉換 Schema
const jsonSchemasX = new JsonSchemasX('public', rawSchemas);
const ammSchemas = jsonSchemasX.toCoreSchemas();

if (ammSchemas instanceof Error) {
  console.error('Schema 轉換失敗:', ammSchemas);
  process.exit(1);
}

// 建立 ORM
const sequelizeDb = new Sequelize('postgres://user:password@localhost:5432/mydb');
const ammOrm = new AmmOrm(sequelizeDb, ammSchemas);
```

---

## 2. 模型定義範例

### 2.1 完整使用者模型

```typescript
const ammSchemas: AmmSchemas = {
  models: {
    user: {
      columns: {
        // 主鍵
        id: {
          type: sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: '使用者 ID',
        },

        // 基本資訊
        username: {
          type: sequelize.STRING(100),
          allowNull: false,
          unique: true,
        },
        email: {
          type: sequelize.STRING(255),
          allowNull: false,
          validate: {
            isEmail: true,
          },
        },
        passwordHash: {
          type: sequelize.STRING(255),
          allowNull: false,
        },

        // 個人資料
        firstName: sequelize.STRING(50),
        lastName: sequelize.STRING(50),
        displayName: sequelize.STRING(100),
        avatar: sequelize.TEXT,
        bio: sequelize.TEXT,

        // 狀態
        status: {
          type: sequelize.ENUM('active', 'inactive', 'banned'),
          defaultValue: 'active',
        },
        isEmailVerified: {
          type: sequelize.BOOLEAN,
          defaultValue: false,
        },

        // 日期
        birthday: sequelize.DATEONLY,
        lastLoginAt: sequelize.DATE,

        // JSON 資料
        settings: {
          type: sequelize.JSONB,
          defaultValue: {
            notifications: true,
            theme: 'light',
          },
        },
        metadata: {
          type: sequelize.JSONB,
          defaultValue: {},
        },

        // 關聯
        profile: {
          type: AmmOrm.columnTypes.HAS_ONE('userProfile', {
            foreignKey: 'user_id',
          }),
        },
        posts: {
          type: AmmOrm.columnTypes.HAS_MANY('post', {
            foreignKey: 'author_id',
          }),
        },
        roles: {
          type: AmmOrm.columnTypes.BELONGS_TO_MANY('role', {
            through: {
              ammModelName: 'userRole',
              ammThroughAs: 'assignment',
            },
            foreignKey: 'user_id',
            otherKey: 'role_id',
          }),
        },
      },
      options: {
        tableName: 'users',
        indexes: [
          {
            unique: true,
            fields: ['email'],
            where: { deleted_at: null },
          },
          {
            fields: ['status'],
          },
          {
            fields: ['last_login_at'],
          },
        ],
        hooks: {
          beforeCreate: async (user: any) => {
            // 設定顯示名稱
            if (!user.displayName) {
              user.displayName = user.username;
            }
          },
        },
      },
    },

    userProfile: {
      columns: {
        id: {
          type: sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        phone: sequelize.STRING(20),
        address: sequelize.TEXT,
        city: sequelize.STRING(100),
        country: sequelize.STRING(100),
        postalCode: sequelize.STRING(20),
        user: {
          type: AmmOrm.columnTypes.BELONGS_TO('user', {
            foreignKey: 'user_id',
          }),
        },
      },
    },

    role: {
      columns: {
        id: {
          type: sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: sequelize.STRING(50),
          unique: true,
        },
        description: sequelize.TEXT,
        permissions: {
          type: sequelize.JSONB,
          defaultValue: [],
        },
        users: {
          type: AmmOrm.columnTypes.BELONGS_TO_MANY('user', {
            through: {
              ammModelName: 'userRole',
            },
            foreignKey: 'role_id',
            otherKey: 'user_id',
          }),
        },
      },
    },

    post: {
      columns: {
        id: {
          type: sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        title: sequelize.STRING(500),
        slug: {
          type: sequelize.STRING(500),
          unique: true,
        },
        content: sequelize.TEXT,
        excerpt: sequelize.TEXT,
        status: {
          type: sequelize.ENUM('draft', 'published', 'archived'),
          defaultValue: 'draft',
        },
        viewCount: {
          type: sequelize.INTEGER,
          defaultValue: 0,
        },
        publishedAt: sequelize.DATE,
        author: {
          type: AmmOrm.columnTypes.BELONGS_TO('user', {
            foreignKey: 'author_id',
          }),
        },
        comments: {
          type: AmmOrm.columnTypes.HAS_MANY('comment', {
            foreignKey: 'post_id',
          }),
        },
        tags: {
          type: AmmOrm.columnTypes.BELONGS_TO_MANY('tag', {
            through: {
              ammModelName: 'postTag',
            },
            foreignKey: 'post_id',
            otherKey: 'tag_id',
          }),
        },
      },
      options: {
        indexes: [
          { unique: true, fields: ['slug'], where: { deleted_at: null } },
          { fields: ['author_id'] },
          { fields: ['status'] },
          { fields: ['published_at'] },
        ],
      },
    },

    comment: {
      columns: {
        id: {
          type: sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        content: sequelize.TEXT,
        post: {
          type: AmmOrm.columnTypes.BELONGS_TO('post', {
            foreignKey: 'post_id',
          }),
        },
        author: {
          type: AmmOrm.columnTypes.BELONGS_TO('user', {
            foreignKey: 'author_id',
          }),
        },
        parent: {
          type: AmmOrm.columnTypes.BELONGS_TO('comment', {
            foreignKey: 'parent_id',
          }),
        },
        replies: {
          type: AmmOrm.columnTypes.HAS_MANY('comment', {
            foreignKey: 'parent_id',
          }),
        },
      },
    },

    tag: {
      columns: {
        id: {
          type: sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: sequelize.STRING(100),
          unique: true,
        },
        slug: {
          type: sequelize.STRING(100),
          unique: true,
        },
        posts: {
          type: AmmOrm.columnTypes.BELONGS_TO_MANY('post', {
            through: {
              ammModelName: 'postTag',
            },
            foreignKey: 'tag_id',
            otherKey: 'post_id',
          }),
        },
      },
    },
  },

  associationModels: {
    userRole: {
      columns: {
        id: {
          type: sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        grantedAt: {
          type: sequelize.DATE,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        grantedBy: sequelize.BIGINT.UNSIGNED,
      },
      options: {
        indexes: [
          {
            unique: true,
            fields: ['user_id', 'role_id'],
            where: { deleted_at: null },
          },
        ],
      },
    },

    postTag: {
      columns: {
        id: {
          type: sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
      },
      options: {
        indexes: [
          {
            unique: true,
            fields: ['post_id', 'tag_id'],
            where: { deleted_at: null },
          },
        ],
      },
    },
  },

  options: {
    model: { tablePrefix: 'app_' },
    associationModel: { tablePrefix: 'rel_' },
  },
};
```

---

## 3. CRUD 操作

### 3.1 建立 (Create)

```typescript
const User = ammOrm.getSqlzModel('user');
const Post = ammOrm.getSqlzModel('post');

// 基本建立
const user = await User.create({
  username: 'john_doe',
  email: 'john@example.com',
  passwordHash: 'hashed_password',
});

// 建立帶有關聯的資料（自動 include）
const userWithProfile = await User.create({
  username: 'jane_doe',
  email: 'jane@example.com',
  passwordHash: 'hashed_password',
  profile: {
    phone: '123-456-7890',
    city: 'New York',
  },
  posts: [
    { title: 'My First Post', content: 'Hello World!' },
    { title: 'Second Post', content: 'Another content' },
  ],
});

// 建立帶有多對多關聯的資料
const userWithRoles = await User.create({
  username: 'admin_user',
  email: 'admin@example.com',
  passwordHash: 'hashed_password',
  roles: [{
    name: 'admin',
    description: 'Administrator role',
    [AmmOrm.ThroughValues]: {
      grantedAt: new Date(),
      grantedBy: 1,
    },
  }],
});

// 批次建立
const users = await User.bulkCreate([
  { username: 'user1', email: 'user1@example.com', passwordHash: 'hash1' },
  { username: 'user2', email: 'user2@example.com', passwordHash: 'hash2' },
  { username: 'user3', email: 'user3@example.com', passwordHash: 'hash3' },
]);
```

### 3.2 查詢 (Read)

```typescript
const User = ammOrm.getSqlzModel('user');
const Post = ammOrm.getSqlzModel('post');
const Role = ammOrm.getSqlzModel('role');

// 查詢單一記錄
const user = await User.findOne({
  where: { username: 'john_doe' },
});

// 依主鍵查詢
const userById = await User.findByPk(1);

// 查詢所有記錄
const allUsers = await User.findAll();

// 條件查詢
const activeUsers = await User.findAll({
  where: {
    status: 'active',
    isEmailVerified: true,
  },
  order: [['createdAt', 'DESC']],
  limit: 10,
  offset: 0,
});

// 使用 ammInclude 查詢關聯
const userWithRelations = await User.findOne({
  where: { id: 1 },
  include: User.ammInclude([
    'profile',
    'posts',
    'roles',
  ]),
});

// 巢狀關聯查詢
const userWithNestedRelations = await User.findOne({
  where: { id: 1 },
  include: User.ammInclude([
    'profile',
    'posts',
    'posts.comments',          // 文章的評論
    'posts.comments.author',   // 評論的作者
    'posts.tags',              // 文章的標籤
    'roles',
  ]),
});

// 帶條件的關聯查詢
const userWithPublishedPosts = await User.findOne({
  where: { id: 1 },
  include: [{
    model: Post,
    as: 'posts',
    where: { status: 'published' },
    required: false, // LEFT JOIN
  }],
});

// 計數
const userCount = await User.count({
  where: { status: 'active' },
});

// findOrCreate
const [user, created] = await User.findOrCreate({
  where: { email: 'new@example.com' },
  defaults: {
    username: 'new_user',
    passwordHash: 'hash',
  },
});
```

### 3.3 更新 (Update)

```typescript
const User = ammOrm.getSqlzModel('user');

// 更新單一記錄
const user = await User.findByPk(1);
await user.update({
  displayName: 'New Display Name',
  settings: { notifications: false },
});

// 批次更新
await User.update(
  { status: 'inactive' },
  {
    where: {
      lastLoginAt: {
        [Sequelize.Op.lt]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    },
  }
);

// increment / decrement
const post = await Post.findByPk(1);
await post.increment('viewCount', { by: 1 });
await post.decrement('viewCount', { by: 1 });
```

### 3.4 刪除 (Delete)

```typescript
const User = ammOrm.getSqlzModel('user');

// 軟刪除（預設行為，設定 deleted_at）
const user = await User.findByPk(1);
await user.destroy();

// 批次軟刪除
await User.destroy({
  where: { status: 'banned' },
});

// 硬刪除（永久刪除）
await User.destroy({
  where: { id: 1 },
  force: true,
});

// 還原軟刪除的記錄
await user.restore();

// 查詢包含已刪除的記錄
const allUsersIncludingDeleted = await User.findAll({
  paranoid: false,
});
```

---

## 4. 關聯操作

### 4.1 一對一關聯

```typescript
const User = ammOrm.getSqlzModel('user');
const UserProfile = ammOrm.getSqlzModel('userProfile');

// 建立使用者和個人資料
const user = await User.create({
  username: 'john',
  email: 'john@example.com',
  passwordHash: 'hash',
  profile: {
    phone: '123-456-7890',
    city: 'New York',
  },
});

// 查詢使用者和個人資料
const userWithProfile = await User.findOne({
  where: { id: user.id },
  include: [{ model: UserProfile, as: 'profile' }],
});

console.log(userWithProfile.profile.city); // 'New York'

// 更新個人資料
await userWithProfile.profile.update({
  city: 'Los Angeles',
});

// 設定或更換關聯
const newProfile = await UserProfile.create({ phone: '999-999-9999' });
await user.setProfile(newProfile);

// 移除關聯
await user.setProfile(null);
```

### 4.2 一對多關聯

```typescript
const User = ammOrm.getSqlzModel('user');
const Post = ammOrm.getSqlzModel('post');

// 建立使用者和多篇文章
const user = await User.create({
  username: 'blogger',
  email: 'blogger@example.com',
  passwordHash: 'hash',
  posts: [
    { title: 'Post 1', content: 'Content 1' },
    { title: 'Post 2', content: 'Content 2' },
  ],
});

// 為現有使用者新增文章
const existingUser = await User.findByPk(1);
const newPost = await Post.create({
  title: 'New Post',
  content: 'New Content',
  author_id: existingUser.id,
});

// 或使用關聯方法
await existingUser.createPost({
  title: 'Another Post',
  content: 'Another Content',
});

// 查詢使用者的所有文章
const userWithPosts = await User.findOne({
  where: { id: 1 },
  include: [{ model: Post, as: 'posts' }],
});

console.log(`使用者有 ${userWithPosts.posts.length} 篇文章`);

// 使用關聯方法查詢
const posts = await existingUser.getPosts({
  where: { status: 'published' },
  order: [['createdAt', 'DESC']],
});

// 計算關聯數量
const postCount = await existingUser.countPosts();
```

### 4.3 多對多關聯

```typescript
const User = ammOrm.getSqlzModel('user');
const Role = ammOrm.getSqlzModel('role');
const UserRole = ammOrm.getSqlzAssociationModel('userRole');

// 建立使用者和角色
const user = await User.create({
  username: 'admin',
  email: 'admin@example.com',
  passwordHash: 'hash',
  roles: [{
    name: 'admin',
    permissions: ['read', 'write', 'delete'],
    [AmmOrm.ThroughValues]: {
      grantedAt: new Date(),
    },
  }, {
    name: 'moderator',
    permissions: ['read', 'write'],
    [AmmOrm.ThroughValues]: {
      grantedAt: new Date(),
    },
  }],
});

// 查詢使用者的角色（包含中間表資料）
const userWithRoles = await User.findOne({
  where: { id: user.id },
  include: [{
    model: Role,
    as: 'roles',
    through: {
      attributes: ['grantedAt', 'grantedBy'],
    },
  }],
});

userWithRoles.roles.forEach(role => {
  console.log(`角色: ${role.name}`);
  console.log(`授予時間: ${role.assignment.grantedAt}`);
});

// 為現有使用者新增角色
const existingUser = await User.findByPk(1);
const existingRole = await Role.findOne({ where: { name: 'viewer' } });

// 使用關聯方法
await existingUser.addRole(existingRole, {
  through: {
    grantedAt: new Date(),
    grantedBy: 1,
  },
});

// 新增多個角色
const roles = await Role.findAll({
  where: { name: { [Sequelize.Op.in]: ['editor', 'reviewer'] } },
});
await existingUser.addRoles(roles);

// 設定角色（會移除舊的，設定新的）
await existingUser.setRoles([role1, role2]);

// 移除角色
await existingUser.removeRole(existingRole);

// 檢查是否有某角色
const hasRole = await existingUser.hasRole(existingRole);

// 直接操作中間表
const userRole = await UserRole.create({
  user_id: 1,
  role_id: 2,
  grantedAt: new Date(),
});
```

### 4.4 自關聯（Self-referencing）

```typescript
// 評論的回覆功能
const Comment = ammOrm.getSqlzModel('comment');

// 建立評論和回覆
const comment = await Comment.create({
  content: 'This is a comment',
  author_id: 1,
  post_id: 1,
  replies: [{
    content: 'This is a reply',
    author_id: 2,
    post_id: 1,
    replies: [{
      content: 'Nested reply',
      author_id: 1,
      post_id: 1,
    }],
  }],
});

// 查詢評論和所有回覆（遞迴）
const commentWithReplies = await Comment.findOne({
  where: { id: comment.id },
  include: [{
    model: Comment,
    as: 'replies',
    include: [{
      model: Comment,
      as: 'replies',
    }],
  }],
});
```

---

## 5. JSON Schema 範例

### 5.1 電商系統 Schema

```typescript
import { IJsonSchemas } from 'az-model-manager/manager';

const ecommerceSchemas: IJsonSchemas = {
  models: {
    // 產品
    product: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        name: ['string', 200],
        slug: {
          type: ['string', 200],
          unique: true,
        },
        description: 'text',
        price: ['decimal', 10, 2],
        comparePrice: ['decimal', 10, 2],
        sku: ['string', 100],
        barcode: ['string', 100],
        quantity: {
          type: 'integer',
          defaultValue: 0,
        },
        weight: ['decimal', 8, 2],
        status: {
          type: ['string', 50],
          defaultValue: 'draft',
        },
        images: {
          type: 'jsonb',
          defaultValue: [],
        },
        metadata: {
          type: 'jsonb',
          defaultValue: {},
        },
        // 關聯
        category: ['belongsTo', 'category', { foreignKey: 'category_id' }],
        brand: ['belongsTo', 'brand', { foreignKey: 'brand_id' }],
        variants: ['hasMany', 'productVariant', { foreignKey: 'product_id' }],
        reviews: ['hasMany', 'review', { foreignKey: 'product_id' }],
        tags: ['belongsToMany', 'tag', {
          through: { ammModelName: 'productTag' },
          foreignKey: 'product_id',
          otherKey: 'tag_id',
        }],
      },
      options: {
        indexes: [
          { unique: true, fields: ['slug'], where: { deleted_at: null } },
          { unique: true, fields: ['sku'], where: { deleted_at: null } },
          { fields: ['category_id'] },
          { fields: ['brand_id'] },
          { fields: ['status'] },
        ],
      },
    },

    // 產品變體
    productVariant: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        name: ['string', 200],
        sku: ['string', 100],
        price: ['decimal', 10, 2],
        quantity: { type: 'integer', defaultValue: 0 },
        options: { type: 'jsonb', defaultValue: {} },
        product: ['belongsTo', 'product', { foreignKey: 'product_id' }],
      },
    },

    // 分類
    category: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        name: ['string', 100],
        slug: ['string', 100],
        description: 'text',
        image: 'text',
        parentId: 'bigint',
        sortOrder: { type: 'integer', defaultValue: 0 },
        products: ['hasMany', 'product', { foreignKey: 'category_id' }],
        children: ['hasMany', 'category', { foreignKey: 'parent_id' }],
        parent: ['belongsTo', 'category', { foreignKey: 'parent_id' }],
      },
    },

    // 品牌
    brand: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        name: ['string', 100],
        slug: ['string', 100],
        logo: 'text',
        description: 'text',
        products: ['hasMany', 'product', { foreignKey: 'brand_id' }],
      },
    },

    // 標籤
    tag: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        name: ['string', 50],
        slug: ['string', 50],
        products: ['belongsToMany', 'product', {
          through: { ammModelName: 'productTag' },
          foreignKey: 'tag_id',
          otherKey: 'product_id',
        }],
      },
    },

    // 訂單
    order: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        orderNumber: ['string', 50],
        status: {
          type: ['string', 50],
          defaultValue: 'pending',
        },
        subtotal: ['decimal', 10, 2],
        tax: ['decimal', 10, 2],
        shipping: ['decimal', 10, 2],
        total: ['decimal', 10, 2],
        currency: {
          type: ['string', 3],
          defaultValue: 'USD',
        },
        shippingAddress: 'jsonb',
        billingAddress: 'jsonb',
        notes: 'text',
        customer: ['belongsTo', 'customer', { foreignKey: 'customer_id' }],
        items: ['hasMany', 'orderItem', { foreignKey: 'order_id' }],
        payments: ['hasMany', 'payment', { foreignKey: 'order_id' }],
      },
      options: {
        indexes: [
          { unique: true, fields: ['order_number'] },
          { fields: ['customer_id'] },
          { fields: ['status'] },
        ],
      },
    },

    // 訂單項目
    orderItem: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        productName: ['string', 200],
        productSku: ['string', 100],
        quantity: 'integer',
        unitPrice: ['decimal', 10, 2],
        totalPrice: ['decimal', 10, 2],
        options: { type: 'jsonb', defaultValue: {} },
        order: ['belongsTo', 'order', { foreignKey: 'order_id' }],
        product: ['belongsTo', 'product', { foreignKey: 'product_id' }],
        variant: ['belongsTo', 'productVariant', { foreignKey: 'variant_id' }],
      },
    },

    // 顧客
    customer: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        email: ['string', 255],
        firstName: ['string', 100],
        lastName: ['string', 100],
        phone: ['string', 20],
        addresses: { type: 'jsonb', defaultValue: [] },
        orders: ['hasMany', 'order', { foreignKey: 'customer_id' }],
        reviews: ['hasMany', 'review', { foreignKey: 'customer_id' }],
        wishlist: ['belongsToMany', 'product', {
          through: { ammModelName: 'wishlistItem' },
          foreignKey: 'customer_id',
          otherKey: 'product_id',
        }],
      },
    },

    // 評論
    review: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        rating: 'integer',
        title: ['string', 200],
        content: 'text',
        isVerified: { type: 'boolean', defaultValue: false },
        product: ['belongsTo', 'product', { foreignKey: 'product_id' }],
        customer: ['belongsTo', 'customer', { foreignKey: 'customer_id' }],
      },
    },

    // 付款
    payment: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        amount: ['decimal', 10, 2],
        currency: ['string', 3],
        status: ['string', 50],
        method: ['string', 50],
        transactionId: ['string', 200],
        metadata: { type: 'jsonb', defaultValue: {} },
        order: ['belongsTo', 'order', { foreignKey: 'order_id' }],
      },
    },
  },

  associationModels: {
    productTag: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
      },
      options: {
        indexes: [
          { unique: true, fields: ['product_id', 'tag_id'], where: { deleted_at: null } },
        ],
      },
    },

    wishlistItem: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        addedAt: 'date',
      },
      options: {
        indexes: [
          { unique: true, fields: ['customer_id', 'product_id'], where: { deleted_at: null } },
        ],
      },
    },
  },

  options: {
    model: { tablePrefix: 'shop_' },
    associationModel: { tablePrefix: 'shop_' },
  },
};
```

---

## 6. 進階範例

### 6.1 交易與錯誤處理

```typescript
async function createOrderWithItems(orderData: any, items: any[]) {
  const sequelizeDb = ammOrm.db;
  const Order = ammOrm.getSqlzModel('order');
  const OrderItem = ammOrm.getSqlzModel('orderItem');
  const Product = ammOrm.getSqlzModel('product');

  const transaction = await sequelizeDb.transaction({
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  });

  try {
    // 建立訂單
    const order = await Order.create(orderData, { transaction });

    // 處理每個項目
    for (const item of items) {
      // 檢查庫存
      const product = await Product.findByPk(item.productId, {
        transaction,
        lock: true, // 鎖定行
      });

      if (!product || product.quantity < item.quantity) {
        throw new Error(`產品 ${item.productId} 庫存不足`);
      }

      // 建立訂單項目
      await OrderItem.create({
        order_id: order.id,
        product_id: item.productId,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: product.price * item.quantity,
      }, { transaction });

      // 扣除庫存
      await product.decrement('quantity', {
        by: item.quantity,
        transaction,
      });
    }

    // 計算總金額
    const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    await order.update({ subtotal: total, total }, { transaction });

    await transaction.commit();
    return order;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

### 6.2 批次處理

```typescript
import { toSeqPromise } from 'az-model-manager/core/utils';

async function processLargeDataset(items: any[]) {
  const User = ammOrm.getSqlzModel('user');
  const results: any[] = [];
  const batchSize = 100;

  // 分批處理
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    // 批次建立
    const created = await User.bulkCreate(batch, {
      updateOnDuplicate: ['email'], // 重複時更新
      returning: true,
    });

    results.push(...created);
    console.log(`已處理 ${Math.min(i + batchSize, items.length)} / ${items.length}`);
  }

  return results;
}

// 使用 toSeqPromise 順序處理
async function processSequentially(items: any[]) {
  await toSeqPromise(items, async (_, item, index) => {
    console.log(`處理第 ${index + 1} 個項目`);
    await someAsyncOperation(item);
    return Promise.resolve();
  });
}
```

### 6.3 資料驗證

```typescript
import { Sequelize } from 'sequelize';
import sequelize from 'sequelize';

const ammSchemas: AmmSchemas = {
  models: {
    user: {
      columns: {
        id: { type: sequelize.BIGINT, primaryKey: true, autoIncrement: true },

        email: {
          type: sequelize.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: {
              msg: '請輸入有效的電子郵件地址',
            },
            notEmpty: {
              msg: '電子郵件不能為空',
            },
          },
        },

        password: {
          type: sequelize.STRING,
          allowNull: false,
          validate: {
            len: {
              args: [8, 100],
              msg: '密碼長度必須在 8-100 之間',
            },
            isStrongPassword(value: string) {
              const hasUppercase = /[A-Z]/.test(value);
              const hasLowercase = /[a-z]/.test(value);
              const hasNumber = /[0-9]/.test(value);

              if (!hasUppercase || !hasLowercase || !hasNumber) {
                throw new Error('密碼必須包含大小寫字母和數字');
              }
            },
          },
        },

        age: {
          type: sequelize.INTEGER,
          validate: {
            min: {
              args: [0],
              msg: '年齡不能為負數',
            },
            max: {
              args: [150],
              msg: '年齡不能超過 150',
            },
          },
        },

        website: {
          type: sequelize.STRING,
          validate: {
            isUrl: {
              msg: '請輸入有效的網址',
            },
          },
        },

        status: {
          type: sequelize.STRING,
          validate: {
            isIn: {
              args: [['active', 'inactive', 'pending']],
              msg: '狀態必須是 active、inactive 或 pending',
            },
          },
        },
      },
    },
  },
};

// 捕獲驗證錯誤
try {
  const user = await User.create({
    email: 'invalid-email',
    password: '123',
  });
} catch (error) {
  if (error instanceof Sequelize.ValidationError) {
    error.errors.forEach(err => {
      console.log(`欄位 ${err.path}: ${err.message}`);
    });
  }
}
```

### 6.4 查詢建構器

```typescript
const User = ammOrm.getSqlzModel('user');
const Post = ammOrm.getSqlzModel('post');
const { Op } = Sequelize;

// 複雜查詢
const users = await User.findAll({
  where: {
    // AND 條件
    [Op.and]: [
      { status: 'active' },
      { isEmailVerified: true },
    ],

    // OR 條件
    [Op.or]: [
      { role: 'admin' },
      { role: 'moderator' },
    ],

    // 數值比較
    age: {
      [Op.gte]: 18,
      [Op.lte]: 65,
    },

    // 字串匹配
    username: {
      [Op.like]: '%john%',
    },

    // 陣列包含
    status: {
      [Op.in]: ['active', 'pending'],
    },

    // 非空
    email: {
      [Op.not]: null,
    },

    // JSON 欄位查詢 (PostgreSQL)
    settings: {
      notifications: true,
    },

    // 日期範圍
    createdAt: {
      [Op.between]: [
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      ],
    },
  },

  // 排序
  order: [
    ['createdAt', 'DESC'],
    ['username', 'ASC'],
  ],

  // 分頁
  limit: 20,
  offset: 0,

  // 選擇欄位
  attributes: ['id', 'username', 'email', 'createdAt'],

  // 排除欄位
  attributes: {
    exclude: ['passwordHash', 'deleted_at'],
  },

  // 聚合欄位
  attributes: [
    'id',
    'username',
    [Sequelize.fn('COUNT', Sequelize.col('posts.id')), 'postCount'],
  ],

  // 關聯
  include: [{
    model: Post,
    as: 'posts',
    attributes: [],  // 只用於計算
  }],

  // 分組
  group: ['user.id'],

  // Having
  having: Sequelize.literal('COUNT(posts.id) > 5'),
});

// 子查詢
const usersWithManyPosts = await User.findAll({
  where: {
    id: {
      [Op.in]: Sequelize.literal(`(
        SELECT author_id
        FROM posts
        WHERE status = 'published'
        GROUP BY author_id
        HAVING COUNT(*) > 10
      )`),
    },
  },
});

// 原生 SQL
const [results] = await sequelizeDb.query(`
  SELECT u.*, COUNT(p.id) as post_count
  FROM users u
  LEFT JOIN posts p ON p.author_id = u.id
  WHERE u.status = 'active'
  GROUP BY u.id
  ORDER BY post_count DESC
  LIMIT 10
`);
```

### 6.5 鉤子使用

```typescript
const ammSchemas: AmmSchemas = {
  models: {
    user: {
      columns: {
        id: { type: sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        username: sequelize.STRING,
        email: sequelize.STRING,
        passwordHash: sequelize.STRING,
        lastLoginAt: sequelize.DATE,
      },
      options: {
        hooks: {
          // 建立前
          beforeCreate: async (user, options) => {
            // 設定預設值
            user.lastLoginAt = new Date();

            // 發送歡迎郵件（非同步）
            setImmediate(() => {
              sendWelcomeEmail(user.email);
            });
          },

          // 建立後
          afterCreate: async (user, options) => {
            // 記錄日誌
            await createAuditLog('user_created', user.id);
          },

          // 更新前
          beforeUpdate: async (user, options) => {
            // 檢查變更
            if (user.changed('email')) {
              user.isEmailVerified = false;
            }
          },

          // 刪除前
          beforeDestroy: async (user, options) => {
            // 清理相關資料
            await cleanupUserData(user.id);
          },

          // 查詢前
          beforeFind: (options) => {
            // 自動排除密碼欄位
            if (!options.attributes) {
              options.attributes = { exclude: ['passwordHash'] };
            }
          },

          // 同步後
          afterSync: async (options) => {
            // 設定序列值
            await options.sequelize.query(`
              SELECT setval('users_id_seq', COALESCE(MAX(id), 0) + 1, false)
              FROM users
            `);
          },
        },
      },
    },
  },
};
```

---

## 完整應用範例

```typescript
// app.ts
import { Sequelize } from 'sequelize';
import AmmOrm, { AmmSchemas } from 'az-model-manager/core';
import { JsonSchemasX, IJsonSchemas } from 'az-model-manager/manager';

// Schema 定義
const rawSchemas: IJsonSchemas = {
  models: {
    user: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        username: { type: 'string', allowNull: false },
        email: { type: 'string', allowNull: false },
        posts: ['hasMany', 'post', { foreignKey: 'author_id' }],
      },
    },
    post: {
      columns: {
        id: { type: 'bigint', primaryKey: true, autoIncrement: true },
        title: 'string',
        content: 'text',
        author: ['belongsTo', 'user', { foreignKey: 'author_id' }],
      },
    },
  },
  associationModels: {},
};

// 初始化
async function initDatabase() {
  const jsonSchemasX = new JsonSchemasX('public', rawSchemas);
  const ammSchemas = jsonSchemasX.toCoreSchemas();

  if (ammSchemas instanceof Error) {
    throw ammSchemas;
  }

  const sequelizeDb = new Sequelize(process.env.DATABASE_URL!, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });

  const ammOrm = new AmmOrm(sequelizeDb, ammSchemas);

  // 開發環境同步資料庫
  if (process.env.NODE_ENV === 'development') {
    await ammOrm.sync(false);
  }

  return ammOrm;
}

// 使用範例
async function main() {
  const ammOrm = await initDatabase();
  const User = ammOrm.getSqlzModel('user');
  const Post = ammOrm.getSqlzModel('post');

  // 建立使用者和文章
  const user = await User.create({
    username: 'demo_user',
    email: 'demo@example.com',
    posts: [
      { title: 'Hello World', content: 'My first post!' },
    ],
  });

  console.log('建立的使用者:', user.toJSON());

  // 查詢
  const users = await User.findAll({
    include: User.ammInclude(['posts']),
  });

  users.forEach(u => {
    console.log(`${u.username} 有 ${u.posts.length} 篇文章`);
  });

  // 關閉連線
  await ammOrm.db.close();
}

main().catch(console.error);
```

---

*更多範例請參考 `test/` 目錄中的測試用例。*
