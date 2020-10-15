import Sequelize from 'sequelize';
import AmmOrm, { Schemas } from 'library';

const getModelDefs00 : () => Schemas = () => ({
  models: {
    user: {
      columns: {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey',
        },
        username: {
          type: Sequelize.STRING,
          // unique: true,
          comment: 'Username',
        },
        accountLinks: {
          type: AmmOrm.columnTypes.HAS_MANY('accountLink', {
            foreignKey: 'owner_id',
          }),
        },
        privilege: Sequelize.STRING,
      },
      options: {
        // name: {
        //   singular: 'user',
        //   plural: 'users',
        // },
        // tableName: 'tbl_user',
      },
    },
    accountLink: {
      columns: {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey',
        },
        provider_id: {
          type: Sequelize.STRING,
          // unique: true,
        },
        provider_user_id: {
          type: Sequelize.STRING,
          // unique: true,
        },
        provider_user_access_info: {
          type: Sequelize.JSONB,
          // unique: true,
        },
        owner: {
          type: AmmOrm.columnTypes.BELONGS_TO('user', {
            foreignKey: 'owner_id',
          }),
        },
      },
      options: {
        indexes: [
          {
            unique: true,
            fields: ['owner_id', 'provider_id'],
            where: {
              deleted_at: null,
            },
          },
          {
            unique: true,
            fields: ['provider_id', 'provider_user_id'],
            where: {
              deleted_at: null,
            },
          },
        ],
      },
    },
  },
  associationModels: {},
});

const getModelDefs01 : () => Schemas = () => ({
  models: {
    user: {
      columns: {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey',
        },
        username: {
          type: Sequelize.STRING,
          // unique: true,
          comment: 'Username',
        },
        accountLinks: {
          type: AmmOrm.columnTypes.HAS_MANY('accountLink', {
            foreignKey: 'owner_id',
          }),
        },
        privilege: Sequelize.STRING,
        userGroups: {
          type: AmmOrm.columnTypes.BELONGS_TO_MANY('userGroup', {
            through: {
              ammModelName: 'userUserGroup',
              ammThroughAs: 'relationship',
            },
            foreignKey: 'u_id',
            otherKey: 'g_id',
          }),
        },
      },
      options: {
        // name: {
        //   singular: 'user',
        //   plural: 'users',
        // },
        // tableName: 'tbl_user',
      },
    },
    accountLink: {
      columns: {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey',
        },
        provider_id: {
          type: Sequelize.STRING,
          // unique: true,
        },
        provider_user_id: {
          type: Sequelize.STRING,
          // unique: true,
        },
        provider_user_access_info: {
          type: Sequelize.JSONB,
          // unique: true,
        },
        owner: {
          type: AmmOrm.columnTypes.BELONGS_TO('user', {
            foreignKey: 'owner_id',
          }),
        },
      },
      options: {
        indexes: [
          {
            unique: true,
            fields: ['owner_id', 'provider_id'],
            where: {
              deleted_at: null,
            },
          },
          {
            unique: true,
            fields: ['provider_id', 'provider_user_id'],
            where: {
              deleted_at: null,
            },
          },
        ],
      },
    },
    userGroup: {
      columns: {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        name: Sequelize.STRING(900),
        users: {
          type: AmmOrm.columnTypes.BELONGS_TO_MANY('user', {
            through: {
              ammModelName: 'userUserGroup',
            },
            foreignKey: 'g_id',
            otherKey: 'u_id',
          }),
        },
      },
      options: {
        // name: {
        //   singular: 'userGroup',
        //   plural: 'userGroups',
        // },
        // tableName: 'tbl_user_group',
      },
    },
  },
  associationModels: {
    userUserGroup: {
      columns: {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        role: Sequelize.STRING,
      },
      options: {
        // name: {
        //   singular: 'userUserGroup',
        //   plural: 'userUserGroups',
        // },
        // tableName: 'mn_user_user_group',
      },
    },
  },
});

const getModelDefs02 : () => Schemas = () => ({
  models: {
    user: {
      columns: {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey',
        },
        username: {
          type: Sequelize.STRING,
          // unique: true,
          comment: 'Username',
        },
        accountLinks: {
          type: AmmOrm.columnTypes.HAS_MANY('accountLink', {
            foreignKey: 'owner_id',
          }),
        },
        privilege: Sequelize.STRING,
      },
      options: {
        // name: {
        //   singular: 'user',
        //   plural: 'users',
        // },
        // tableName: 'tbl_user',
      },
    },
    accountLink: {
      columns: {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey',
        },
        provider_id: {
          type: Sequelize.STRING,
          // unique: true,
        },
        provider_user_id: {
          type: Sequelize.STRING,
          // unique: true,
        },
        provider_user_access_info: {
          type: Sequelize.JSONB,
          // unique: true,
        },
        owner: {
          type: AmmOrm.columnTypes.BELONGS_TO('user', {
            foreignKey: 'owner_id',
          }),
        },
      },
      options: {
        indexes: [
          {
            unique: true,
            fields: ['owner_id', 'provider_id'],
            where: {
              deleted_at: null,
            },
          },
          {
            unique: true,
            fields: ['provider_id', 'provider_user_id'],
            where: {
              deleted_at: null,
            },
          },
        ],
      },
    },
  },
  associationModels: {},
});

export {
  getModelDefs00,
  getModelDefs01,
  getModelDefs02,
};
