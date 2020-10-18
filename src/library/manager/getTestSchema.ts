import sequelize from 'sequelize';
import { IJsonSchemas } from './azColumnTypes';

const getSchemas : () => IJsonSchemas = () => ({
  models: {
    user: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey',
        },
        username: {
          type: 'string',
          // unique: true,
          comment: 'Username',
        },
        mainAccountLink: {
          type: ['hasOne', 'accountLink', {
            foreignKey: 'main_al_owner_id',
          }],
        },
        accountLinks: {
          type: ['hasMany', 'accountLink', {
            foreignKey: 'owner_id',
          }],
        },
        privilege: {
          type: 'string',
        },
        userGroups: {
          type: ['belongsToMany', 'userGroup', {
            through: {
              ammModelName: 'userUserGroup',
              ammThroughAs: 'relationship',
            },
            foreignKey: 'u_id',
            otherKey: 'g_id',
          }],
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
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey',
        },
        provider_id: {
          type: 'string',
          // unique: true,
        },
        provider_user_id: {
          type: 'string',
          // unique: true,
        },
        provider_user_access_info: {
          type: 'jsonb',
          // unique: true,
        },
        integer: {
          type: 'integer',
          // unique: true,
        },
        decimal: {
          type: ['decimal', 12, 1],
          // unique: true,
        },
        real: {
          type: 'real',
          // unique: true,
        },
        float: {
          type: 'float',
          // unique: true,
        },
        double: {
          type: 'double',
          // unique: true,
        },
        bigint: {
          type: 'bigint',
          // unique: true,
        },
        boolean: {
          type: 'boolean',
          // unique: true,
        },
        string: {
          type: ['string', 900],
        },
        binary: {
          type: 'binary',
        },
        text: {
          type: 'text',
        },
        // citext: {
        //   type: sequelize.CITEXT,
        // },
        date: {
          type: 'date',
        },
        dateonly: {
          type: 'dateonly',
        },
        uuid: {
          type: 'uuid',
        },
        range: {
          type: ['range', 'integer'],
        },
        // array: {
        //   type: sequelize.ARRAY(sequelize.INTEGER),
        // },
        ownerAsMainAl: {
          type: ['belongsTo', 'user', {
            foreignKey: 'main_al_owner_id',
          }],
        },
        owner: {
          type: ['belongsTo', 'user', {
            foreignKey: 'owner_id',
          }],
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
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: ['string', 900],
        },
        users: {
          type: ['belongsToMany', 'user', {
            through: {
              ammModelName: 'userUserGroup',
            },
            foreignKey: 'g_id',
            otherKey: 'u_id',
          }],
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
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        role: {
          type: 'string',
        },
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

export default getSchemas;
