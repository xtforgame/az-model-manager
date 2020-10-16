import sequelize from 'sequelize';
import AmmOrm, { Schemas } from 'library/core';

const getModelDefs04 : () => Schemas = () => ({
  models: {
    user: {
      columns: {
        id: {
          type: sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey',
        },
        username: {
          type: sequelize.STRING,
          // unique: true,
          comment: 'Username',
        },
        accountLinks: {
          type: AmmOrm.columnTypes.HAS_MANY('accountLink', {
            foreignKey: 'owner_id',
          }),
        },
        privilege: sequelize.STRING,
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
          type: sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey',
        },
        provider_id: {
          type: sequelize.STRING,
          // unique: true,
        },
        provider_user_id: {
          type: sequelize.STRING,
          // unique: true,
        },
        provider_user_access_info: {
          type: sequelize.JSONB,
          // unique: true,
        },
        integer: {
          type: sequelize.INTEGER,
          // unique: true,
        },
        decimal: {
          type: sequelize.DECIMAL(10, 2),
          // unique: true,
        },
        real: {
          type: sequelize.REAL,
          // unique: true,
        },
        float: {
          type: sequelize.FLOAT,
          // unique: true,
        },
        double: {
          type: sequelize.DOUBLE,
          // unique: true,
        },
        bigint: {
          type: sequelize.BIGINT,
          // unique: true,
        },
        boolean: {
          type: sequelize.BOOLEAN,
          // unique: true,
        },
        string: {
          type: sequelize.STRING,
        },
        binary: {
          type: sequelize.STRING(200, true),
        },
        text: {
          type: sequelize.TEXT,
        },
        // citext: {
        //   type: sequelize.CITEXT,
        // },
        date: {
          type: sequelize.DATE,
        },
        dateonly: {
          type: sequelize.DATEONLY,
        },
        uuid: {
          type: sequelize.UUID,
        },
        range: {
          type: sequelize.RANGE(sequelize.INTEGER),
        },
        array: {
          type: sequelize.ARRAY(sequelize.INTEGER),
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
          type: sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        name: sequelize.STRING(900),
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
          type: sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        role: sequelize.STRING,
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

export {
  getModelDefs04,
};
