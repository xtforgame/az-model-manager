"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getSchemas = () => ({
  models: {
    accountLink: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        provider_id: 'string',
        provider_user_id: 'string',
        provider_user_access_info: {
          type: 'jsonb'
        },
        data: {
          type: 'jsonb',
          defaultValue: {}
        },
        user: ['belongsTo', 'user', {
          foreignKey: 'user_id'
        }],
        recoveryToken: ['hasOne', 'recoveryToken', {
          foreignKey: 'account_link_id'
        }]
      },
      options: {
        indexes: [{
          name: 'provider_user_id_should_be_unique',
          unique: true,
          fields: ['user_id', 'provider_id', 'provider_user_id'],
          where: {
            deleted_at: null
          }
        }, {
          unique: true,
          fields: ['provider_id', 'provider_user_id'],
          where: {
            deleted_at: null
          }
        }]
      }
    },
    user: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: 'string',
          comment: 'Username'
        },
        type: {
          type: 'string',
          defaultValue: 'regular',
          comment: 'type of user. ex. regular, room, ... etc.'
        },
        privilege: 'string',
        labels: {
          type: 'jsonb',
          defaultValue: {}
        },
        accountLinks: ['hasMany', 'accountLink', {
          foreignKey: 'user_id'
        }],
        picture: 'text',
        data: {
          type: 'jsonb',
          defaultValue: {}
        },
        managedBy: ['belongsTo', 'organization', {
          foreignKey: 'org_mgr_id'
        }],
        userGroups: ['belongsToMany', 'userGroup', {
          through: {
            unique: false,
            ammModelName: 'userUserGroup',
            ammThroughTableColumnAs: 'user',
            ammThroughAs: 'relation'
          },
          foreignKey: 'user_id',
          otherKey: 'group_id'
        }],
        groupInvitations: ['belongsToMany', 'userGroup', {
          through: {
            unique: false,
            ammModelName: 'groupInvitation',
            ammThroughTableColumnAs: 'invitee',
            ammThroughAs: 'state'
          },
          foreignKey: 'invitee_id',
          otherKey: 'group_id'
        }],
        invitedGroupUsers: ['belongsToMany', 'userGroup', {
          through: {
            unique: false,
            ammModelName: 'groupInvitation',
            ammThroughTableColumnAs: 'inviter',
            ammThroughAs: 'state'
          },
          foreignKey: 'inviter_id',
          otherKey: 'group_id'
        }],
        organizations: ['belongsToMany', 'organization', {
          through: {
            unique: false,
            ammModelName: 'userOrganization',
            ammThroughTableColumnAs: 'user',
            ammThroughAs: 'relation'
          },
          foreignKey: 'user_id',
          otherKey: 'organization_id'
        }],
        organizationInvitations: ['belongsToMany', 'organization', {
          through: {
            unique: false,
            ammModelName: 'organizationInvitation',
            ammThroughTableColumnAs: 'invitee',
            ammThroughAs: 'state'
          },
          foreignKey: 'invitee_id',
          otherKey: 'organization_id'
        }],
        invitedOrganizationUsers: ['belongsToMany', 'organization', {
          through: {
            unique: false,
            ammModelName: 'organizationInvitation',
            ammThroughTableColumnAs: 'inviter',
            ammThroughAs: 'state'
          },
          foreignKey: 'inviter_id',
          otherKey: 'organization_id'
        }],
        projects: ['belongsToMany', 'project', {
          through: {
            unique: false,
            ammModelName: 'userProject',
            ammThroughTableColumnAs: 'user',
            ammThroughAs: 'relation'
          },
          foreignKey: 'user_id',
          otherKey: 'project_id'
        }],
        projectInvitations: ['belongsToMany', 'project', {
          through: {
            unique: false,
            ammModelName: 'projectInvitation',
            ammThroughTableColumnAs: 'invitee',
            ammThroughAs: 'state'
          },
          foreignKey: 'invitee_id',
          otherKey: 'project_id'
        }],
        invitedProjectUsers: ['belongsToMany', 'project', {
          through: {
            unique: false,
            ammModelName: 'projectInvitation',
            ammThroughTableColumnAs: 'inviter',
            ammThroughAs: 'state'
          },
          foreignKey: 'inviter_id',
          otherKey: 'project_id'
        }],
        userSettings: ['hasMany', 'userSetting', {
          foreignKey: 'user_id'
        }],
        memos: ['belongsToMany', 'memo', {
          through: {
            unique: false,
            ammModelName: 'userMemo',
            ammThroughTableColumnAs: 'user',
            ammThroughAs: 'relation'
          },
          foreignKey: 'user_id',
          otherKey: 'memo_id'
        }]
      },
      options: {
        name: {
          singular: 'user',
          plural: 'users'
        },
        hooks: {
          beforeSync(options) {},

          afterSync(options) {
            return options.sequelize.query('SELECT last_value, is_called FROM public.tbl_user_id_seq', {
              type: _sequelize.default.QueryTypes.SELECT
            }).then(([result]) => {
              if (!result.is_called) {
                return options.sequelize.query('ALTER SEQUENCE tbl_user_id_seq RESTART WITH 1000000001', {
                  type: _sequelize.default.QueryTypes.SELECT
                }).then(result2 => {});
              }

              return Promise.resolve();
            });
          }

        }
      }
    },
    userSetting: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        type: {
          type: ['string', 200],
          defaultValue: 'general'
        },
        data: {
          type: 'jsonb',
          defaultValue: {}
        },
        user: ['belongsTo', 'user', {
          foreignKey: 'user_id'
        }]
      },
      options: {
        indexes: [{
          name: 'setting_type_should_be_unique_for_each_user',
          unique: true,
          fields: ['user_id', 'type']
        }]
      }
    },
    log: {
      columns: {
        type: ['string', 900],
        data: {
          type: 'jsonb',
          defaultValue: {}
        }
      }
    },
    recoveryToken: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        type: ['string', 200],
        key: ['string', 900],
        token: ['string', 900],
        accountLink: ['belongsTo', 'accountLink', {
          foreignKey: 'account_link_id'
        }]
      },
      options: {
        timestamps: true,
        paranoid: false,
        indexes: [{
          name: 'reset_password_key_should_be_unique',
          unique: true,
          fields: ['key']
        }, {
          name: 'reset_password_token_should_be_unique',
          unique: true,
          fields: ['token']
        }, {
          name: 'only_one_reset_password_token_for_account_link',
          unique: true,
          fields: ['account_link_id']
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
        name: ['string', 900],
        users: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'userUserGroup',
            ammThroughTableColumnAs: 'group',
            ammThroughAs: 'relation'
          },
          foreignKey: 'group_id',
          otherKey: 'user_id'
        }],
        inviters: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'groupInvitation',
            ammThroughTableColumnAs: 'group',
            ammThroughAs: 'state'
          },
          foreignKey: 'group_id',
          otherKey: 'inviter_id'
        }],
        invitees: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'groupInvitation',
            ammThroughTableColumnAs: 'group',
            ammThroughAs: 'state'
          },
          foreignKey: 'group_id',
          otherKey: 'invitee_id'
        }]
      }
    },
    organization: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        name: ['string', 900],
        users: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'userOrganization',
            ammThroughTableColumnAs: 'organization',
            ammThroughAs: 'relation'
          },
          foreignKey: 'organization_id',
          otherKey: 'user_id'
        }],
        projects: ['hasMany', 'project', {
          foreignKey: 'organization_id'
        }],
        inviters: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'organizationInvitation',
            ammThroughTableColumnAs: 'organization',
            ammThroughAs: 'state'
          },
          foreignKey: 'organization_id',
          otherKey: 'inviter_id'
        }],
        invitees: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'organizationInvitation',
            ammThroughTableColumnAs: 'organization',
            ammThroughAs: 'state'
          },
          foreignKey: 'organization_id',
          otherKey: 'invitee_id'
        }]
      }
    },
    project: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        type: ['string', 900],
        name: ['string', 900],
        data: {
          type: 'jsonb',
          defaultValue: {}
        },
        users: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'userProject',
            ammThroughTableColumnAs: 'project',
            ammThroughAs: 'relation'
          },
          foreignKey: 'project_id',
          otherKey: 'user_id'
        }],
        organization: ['belongsTo', 'organization', {
          foreignKey: 'organization_id'
        }],
        inviters: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'projectInvitation',
            ammThroughTableColumnAs: 'project',
            ammThroughAs: 'state'
          },
          foreignKey: 'project_id',
          otherKey: 'inviter_id'
        }],
        invitees: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'projectInvitation',
            ammThroughTableColumnAs: 'project',
            ammThroughAs: 'state'
          },
          foreignKey: 'project_id',
          otherKey: 'invitee_id'
        }]
      }
    },
    memo: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        data: {
          type: 'jsonb',
          defaultValue: {}
        },
        users: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'userMemo',
            ammThroughTableColumnAs: 'memo',
            ammThroughAs: 'relation'
          },
          foreignKey: 'memo_id',
          otherKey: 'user_id'
        }]
      }
    },
    contactUsMessage: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        message: ['string', 900],
        data: {
          type: 'jsonb',
          defaultValue: {}
        },
        author: ['belongsTo', 'user', {
          foreignKey: 'author_id'
        }],
        assignee: ['belongsTo', 'user', {
          foreignKey: 'assignee_id'
        }],
        state: {
          type: ['string', 900],
          defaultValue: 'pending'
        }
      }
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
        role: 'string'
      },
      options: {
        indexes: [{
          name: 'user_user_group_uniqueness',
          unique: true,
          fields: ['user_id', 'group_id'],
          where: {
            deleted_at: null
          }
        }]
      }
    },
    groupInvitation: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        state: 'integer'
      },
      options: {
        indexes: [{
          name: 'group_only_invite_once',
          unique: true,
          fields: ['group_id', 'inviter_id', 'invitee_id'],
          where: {
            deleted_at: null
          }
        }]
      }
    },
    userOrganization: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        labels: {
          type: 'jsonb',
          defaultValue: {}
        },
        data: {
          type: 'jsonb',
          defaultValue: {}
        },
        role: 'string'
      },
      options: {
        indexes: [{
          name: 'user_organization_uniqueness',
          unique: true,
          fields: ['user_id', 'organization_id'],
          where: {
            deleted_at: null
          }
        }]
      }
    },
    organizationInvitation: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        state: 'integer'
      },
      options: {
        indexes: [{
          name: 'organization_only_invite_once',
          unique: true,
          fields: ['organization_id', 'inviter_id', 'invitee_id'],
          where: {
            deleted_at: null
          }
        }]
      }
    },
    userProject: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        labels: {
          type: 'jsonb',
          defaultValue: {}
        },
        data: {
          type: 'jsonb',
          defaultValue: {}
        },
        role: 'string'
      },
      options: {
        indexes: [{
          name: 'user_project_uniqueness',
          unique: true,
          fields: ['user_id', 'project_id'],
          where: {
            deleted_at: null
          }
        }]
      }
    },
    projectInvitation: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        state: 'integer'
      },
      options: {
        indexes: [{
          name: 'project_only_invite_once',
          unique: true,
          fields: ['project_id', 'inviter_id', 'invitee_id'],
          where: {
            deleted_at: null
          }
        }]
      }
    },
    userMemo: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        role: 'string'
      },
      options: {
        indexes: [{
          name: 'user_memo_uniqueness',
          unique: true,
          fields: ['user_id', 'memo_id'],
          where: {
            deleted_at: null
          }
        }]
      }
    }
  }
});

var _default = getSchemas;
exports.default = _default;