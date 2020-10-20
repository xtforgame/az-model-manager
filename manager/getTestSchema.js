"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var getSchemas = function getSchemas() {
  return {
    models: {
      user: {
        columns: {
          id: {
            type: 'bigint',
            primaryKey: true,
            autoIncrement: true,
            comment: 'PrimaryKey'
          },
          username: {
            type: 'string',
            comment: 'Username'
          },
          mainAccountLink: {
            type: ['hasOne', 'accountLink', {
              foreignKey: 'main_al_owner_id'
            }]
          },
          accountLinks: {
            type: ['hasMany', 'accountLink', {
              foreignKey: 'owner_id'
            }]
          },
          privilege: {
            type: 'string'
          },
          userGroups: {
            type: ['belongsToMany', 'userGroup', {
              through: {
                ammModelName: 'userUserGroup',
                ammThroughAs: 'relationship'
              },
              foreignKey: 'u_id',
              otherKey: 'g_id'
            }]
          }
        },
        options: {}
      },
      accountLink: {
        columns: {
          id: {
            type: 'bigint',
            primaryKey: true,
            autoIncrement: true,
            comment: 'PrimaryKey'
          },
          provider_id: {
            type: 'string'
          },
          provider_user_id: {
            type: 'string'
          },
          provider_user_access_info: {
            type: 'jsonb'
          },
          integer: {
            type: 'integer'
          },
          decimal: {
            type: ['decimal', 12, 1]
          },
          real: {
            type: 'real'
          },
          "float": {
            type: 'float'
          },
          "double": {
            type: 'double'
          },
          bigint: {
            type: 'bigint'
          },
          "boolean": {
            type: 'boolean'
          },
          string: {
            type: ['string', 900]
          },
          binary: {
            type: 'binary'
          },
          text: {
            type: 'text'
          },
          date: {
            type: 'date'
          },
          dateonly: {
            type: 'dateonly'
          },
          uuid: {
            type: 'uuid'
          },
          range_integer: {
            type: ['range', 'integer']
          },
          range_decimal: {
            type: ['range', 'decimal']
          },
          ownerAsMainAl: {
            type: ['belongsTo', 'user', {
              foreignKey: 'main_al_owner_id'
            }]
          },
          owner: {
            type: ['belongsTo', 'user', {
              foreignKey: 'owner_id'
            }]
          }
        },
        options: {
          indexes: [{
            unique: true,
            name: 'al_owner_provider',
            fields: ['owner_id', 'provider_id'],
            where: {
              deleted_at: null
            }
          }, {
            unique: true,
            name: 'al_provider_provider_user',
            fields: ['provider_id', 'provider_user_id'],
            where: {
              deleted_at: null
            }
          }]
        }
      },
      userGroup: {
        columns: {
          id: {
            type: 'bigint',
            primaryKey: true,
            autoIncrement: true
          },
          name: {
            type: ['string', 900]
          },
          users: {
            type: ['belongsToMany', 'user', {
              through: {
                ammModelName: 'userUserGroup'
              },
              foreignKey: 'g_id',
              otherKey: 'u_id'
            }]
          }
        },
        options: {}
      }
    },
    associationModels: {
      userUserGroup: {
        columns: {
          id: {
            type: 'bigint',
            primaryKey: true,
            autoIncrement: true
          },
          role: {
            type: 'string'
          }
        },
        options: {}
      }
    }
  };
};

var _default = getSchemas;
exports["default"] = _default;