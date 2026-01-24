"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const productColumns = {
  thumbnail: {
    type: 'jsonb',
    defaultValue: {}
  },
  pictures: {
    type: 'jsonb',
    defaultValue: []
  },
  name: ['string', 900],
  price: ['integer'],
  weight: 'float',
  description: 'text',
  data: {
    type: 'jsonb',
    defaultValue: {}
  }
};

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
          foreignKey: 'user_id',
          ammTargetAs: 'accountLinks',
          ammTargetHasMany: true
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
          foreignKey: 'user_id',
          ammTargetAs: 'userSettings',
          ammTargetHasMany: true
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
        data: {
          type: 'jsonb',
          defaultValue: {}
        },
        testDataForDiff: {
          type: 'jsonb',
          defaultValue: {
            d: `{"'--drfrfr\`srb}`
          }
        },
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
        testAssociation: ['belongsTo', 'project', {
          foreignKey: 'test_asc_id'
        }],
        ownedUser: ['hasMany', 'user', {
          foreignKey: 'org_mgr_id'
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
      },
      options: {
        indexes: [{
          name: 'organization_name_idx',
          unique: false,
          fields: ['name']
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
          otherKey: 'user_id',
          ammTargetOptions: {
            through: {
              unique: false,
              ammModelName: 'userMemo',
              ammThroughTableColumnAs: 'user',
              ammThroughAs: 'relation'
            },
            foreignKey: 'user_id',
            otherKey: 'memo_id'
          },
          ammTargetAs: 'memos'
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
          foreignKey: 'author_id',
          ammTargetAs: 'leftMessages',
          ammTargetHasMany: true
        }],
        assignee: ['belongsTo', 'user', {
          foreignKey: 'assignee_id',
          ammTargetAs: 'assignedMessage',
          ammTargetHasMany: true
        }],
        state: {
          type: ['string', 900],
          defaultValue: 'pending'
        }
      }
    },
    productCategory: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        name: 'string',
        priority: 'integer',
        active: 'boolean',
        data: {
          type: 'jsonb',
          defaultValue: {}
        },
        groups: ['hasMany', 'productGroup', {
          foreignKey: 'category_id'
        }]
      }
    },
    product: {
      columns: _objectSpread(_objectSpread({
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        customId: 'string',
        color: 'string',
        colorName: 'string',
        size: 'string'
      }, productColumns), {}, {
        ordering: 'integer',
        instock: 'integer',
        group: ['belongsTo', 'productGroup', {
          foreignKey: 'group_id'
        }],
        orders: ['belongsToMany', 'order', {
          through: {
            unique: false,
            ammModelName: 'orderProduct',
            ammThroughTableColumnAs: 'product',
            ammThroughAs: 'relation'
          },
          foreignKey: 'product_id',
          otherKey: 'order_id'
        }]
      })
    },
    productGroup: {
      columns: _objectSpread(_objectSpread({
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        customId: 'string'
      }, productColumns), {}, {
        materials: 'text',
        products: ['hasMany', 'product', {
          foreignKey: 'group_id'
        }],
        category: ['belongsTo', 'productCategory', {
          foreignKey: 'category_id'
        }],
        campaigns: ['belongsToMany', 'campaign', {
          through: {
            unique: false,
            ammModelName: 'productGroupCampaign',
            ammThroughTableColumnAs: 'productGroup',
            ammThroughAs: 'relation'
          },
          foreignKey: 'product_group_id',
          otherKey: 'campaign_id'
        }]
      })
    },
    campaign: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        name: ['string', 900],
        type: ['string', 191],
        durationType: ['string', 900],
        start: 'date',
        end: 'date',
        state: 'string',
        data: {
          type: 'jsonb',
          defaultValue: {}
        },
        parent: ['belongsTo', 'campaign', {
          foreignKey: 'parent_id',
          ammTargetAs: 'children',
          ammTargetHasMany: true
        }],
        productGroups: ['belongsToMany', 'productGroup', {
          through: {
            unique: false,
            ammModelName: 'productGroupCampaign',
            ammThroughTableColumnAs: 'campaign',
            ammThroughAs: 'relation'
          },
          foreignKey: 'campaign_id',
          otherKey: 'product_group_id'
        }]
      }
    },
    pgCollection: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        name: ['string', 900],
        nameEn: ['string', 900],
        description: 'text',
        priority: {
          type: 'integer',
          defaultValue: 0
        },
        prTitle: 'text',
        prDescription: 'text',
        thumbnail: {
          type: 'jsonb',
          defaultValue: {}
        },
        pictures: {
          type: 'jsonb',
          defaultValue: []
        },
        type: ['string', 191],
        start: 'date',
        end: 'date',
        state: 'string',
        parent: ['belongsTo', 'pgCollection', {
          foreignKey: 'parent_id',
          ammTargetAs: 'children',
          ammTargetHasMany: true
        }],
        data: {
          type: 'jsonb',
          defaultValue: {}
        }
      },
      extraOptions: {}
    },
    ordererInfo: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        name: 'string',
        mobile: 'string',
        phone1: 'string',
        phone2: 'string',
        zipcode: 'string',
        address: 'string',
        area: 'string',
        email1: 'string',
        email2: 'string',
        user: ['belongsTo', 'user', {
          foreignKey: 'user_id',
          ammTargetAs: 'ordererInfos',
          ammTargetHasMany: true
        }],
        asDefaultTo: ['belongsTo', 'user', {
          foreignKey: 'as_default_to',
          ammTargetAs: 'defaultOrdererInfo'
        }]
      }
    },
    recipientInfo: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        name: 'string',
        mobile: 'string',
        phone1: 'string',
        phone2: 'string',
        zipcode: 'string',
        address: 'string',
        area: 'string',
        email1: 'string',
        email2: 'string',
        user: ['belongsTo', 'user', {
          foreignKey: 'user_id',
          ammTargetAs: 'recipientInfos',
          ammTargetHasMany: true
        }],
        asDefaultTo: ['belongsTo', 'user', {
          foreignKey: 'as_default_to',
          ammTargetAs: 'defaultRecipientInfo'
        }]
      }
    },
    order: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        memo: 'text',
        shipmentId: 'text',
        orderer: {
          type: 'jsonb',
          defaultValue: {}
        },
        recipient: {
          type: 'jsonb',
          defaultValue: {}
        },
        data: {
          type: 'jsonb',
          defaultValue: {}
        },
        user: ['belongsTo', 'user', {
          foreignKey: 'user_id',
          ammTargetAs: 'orders',
          ammTargetHasMany: true
        }],
        products: ['belongsToMany', 'product', {
          through: {
            unique: false,
            ammModelName: 'orderProduct',
            ammThroughTableColumnAs: 'order',
            ammThroughAs: 'relation'
          },
          foreignKey: 'order_id',
          otherKey: 'product_id'
        }]
      }
    },
    subscriptionOrder: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        memo: 'text',
        shipmentId: 'text',
        orderer: {
          type: 'jsonb',
          defaultValue: {}
        },
        recipient: {
          type: 'jsonb',
          defaultValue: {}
        },
        data: {
          type: 'jsonb',
          defaultValue: {}
        },
        user: ['belongsTo', 'user', {
          foreignKey: 'user_id',
          ammTargetAs: 'subscriptionOrders',
          ammTargetHasMany: true
        }]
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
    groupPgCollection: {
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
        group: ['belongsTo', 'productGroup', {
          foreignKey: 'group_id',
          ammTargetAs: 'pgCollections',
          ammTargetHasMany: true
        }],
        pgCollection: ['belongsTo', 'pgCollection', {
          foreignKey: 'pgc_id',
          ammTargetAs: 'groups',
          ammTargetHasMany: true
        }]
      },
      options: {
        indexes: [{
          name: 'group_pgc_uniqueness',
          unique: true,
          fields: ['group_id', 'pgc_id'],
          where: {
            deleted_at: null
          }
        }]
      },
      extraOptions: {}
    },
    pgCollectionCampaign: {
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
        campaign: ['belongsTo', 'campaign', {
          foreignKey: 'campaign_id',
          ammTargetAs: 'pgCollections',
          ammTargetHasMany: true
        }],
        include: ['belongsTo', 'pgCollection', {
          foreignKey: 'include_pgc_id',
          ammTargetAs: 'includedBy',
          ammTargetHasMany: true
        }],
        require: ['belongsTo', 'pgCollection', {
          foreignKey: 'require_pgc_id',
          ammTargetAs: 'requiredBy',
          ammTargetHasMany: true
        }],
        exclude: ['belongsTo', 'pgCollection', {
          foreignKey: 'exclude_pgc_id',
          ammTargetAs: 'excludedBy',
          ammTargetHasMany: true
        }]
      },
      options: {
        indexes: [{
          name: 'pgc_c_include_uniqueness',
          unique: true,
          fields: ['campaign_id', 'include_pgc_id'],
          where: {
            deleted_at: null
          }
        }, {
          name: 'pgc_c_require_uniqueness',
          unique: true,
          fields: ['campaign_id', 'require_pgc_id'],
          where: {
            deleted_at: null
          }
        }, {
          name: 'pgc_c_exclude_uniqueness',
          unique: true,
          fields: ['campaign_id', 'exclude_pgc_id'],
          where: {
            deleted_at: null
          }
        }]
      },
      extraOptions: {
        hasura: {
          publicColumns: 'all',
          views: {},
          restrictedColumns: [],
          customViewsInfo: {
            views: {
              productGroupCampaignByPgc: {
                customColumnNames: {
                  group_id: 'group_id',
                  campaign_id: 'campaign_id'
                },
                relationships: [{
                  type: 'pg_create_array_relationship',
                  args: {
                    name: 'campaignsByPgc',
                    table: {
                      name: 'tbl_product_group',
                      schema: 'public'
                    },
                    using: {
                      manual_configuration: {
                        remote_table: {
                          name: 'view_product_group_campaign_by_pgc',
                          schema: 'public'
                        },
                        column_mapping: {
                          id: 'group_id'
                        },
                        insertion_order: null
                      }
                    }
                  }
                }, {
                  type: 'pg_create_object_relationship',
                  args: {
                    name: 'group',
                    table: {
                      name: 'view_product_group_campaign_by_pgc',
                      schema: 'public'
                    },
                    using: {
                      manual_configuration: {
                        remote_table: {
                          name: 'tbl_product_group',
                          schema: 'public'
                        },
                        column_mapping: {
                          group_id: 'id'
                        }
                      }
                    }
                  }
                }, {
                  type: 'pg_create_array_relationship',
                  args: {
                    name: 'groupsByPgc',
                    table: {
                      name: 'tbl_campaign',
                      schema: 'public'
                    },
                    using: {
                      manual_configuration: {
                        remote_table: {
                          name: 'view_product_group_campaign_by_pgc',
                          schema: 'public'
                        },
                        column_mapping: {
                          id: 'campaign_id'
                        },
                        insertion_order: null
                      }
                    }
                  }
                }, {
                  type: 'pg_create_object_relationship',
                  args: {
                    name: 'campaign',
                    table: {
                      name: 'view_product_group_campaign_by_pgc',
                      schema: 'public'
                    },
                    using: {
                      manual_configuration: {
                        remote_table: {
                          name: 'tbl_campaign',
                          schema: 'public'
                        },
                        column_mapping: {
                          campaign_id: 'id'
                        }
                      }
                    }
                  }
                }],
                dropScript: 'DROP VIEW IF EXISTS view_product_group_campaign_by_pgc;',
                createScript: `
                  CREATE VIEW view_product_group_campaign_by_pgc AS (
                    SELECT
                      id as "group_id", "view_g_campaign"."campaign_id" as "campaign_id"
                    FROM
                      "public"."tbl_product_group" as "view_group"
                    LEFT JOIN (
                      SELECT
                        id as "gpId",
                        "view_g_pgc"."group_id" as "group_id",
                        "view_g_pgc"."pgc_id" as "pgc_id",
                        "view_pgc_c"."include_pgc_id" as "include_pgc_id",
                        "view_pgc_c"."campaign_id" as "campaign_id"
                      FROM
                        "public"."mn_group_pg_collection"  AS "view_g_pgc"
                      LEFT JOIN (
                        SELECT
                          include_pgc_id, exclude_pgc_id, campaign_id
                        FROM
                          "public"."mn_pg_collection_campaign"
                      ) AS "view_pgc_c"
                      ON (("view_g_pgc"."pgc_id") = ("view_pgc_c"."include_pgc_id"))
                      WHERE "view_pgc_c"."campaign_id" IS NOT NULL
                    ) AS "view_g_campaign"
                    ON (("view_group"."id") = ("view_g_campaign"."group_id"))
                  )
                  EXCEPT (
                    SELECT
                      id as "group_id", "view_g_campaign"."campaign_id" as "campaign_id"
                    FROM
                      "public"."tbl_product_group" as "view_group"
                    LEFT JOIN (
                      SELECT
                        id as "gpId",
                        "view_g_pgc"."group_id" as "group_id",
                        "view_g_pgc"."pgc_id" as "pgc_id",
                        "view_pgc_c"."include_pgc_id" as "include_pgc_id",
                        "view_pgc_c"."campaign_id" as "campaign_id"
                      FROM
                        "public"."mn_group_pg_collection"  AS "view_g_pgc"
                      LEFT JOIN (
                        SELECT
                          include_pgc_id, exclude_pgc_id, campaign_id
                        FROM
                          "public"."mn_pg_collection_campaign"
                      ) AS "view_pgc_c"
                      ON (("view_g_pgc"."pgc_id") = ("view_pgc_c"."exclude_pgc_id"))
                      WHERE "view_pgc_c"."campaign_id" IS NOT NULL
                    ) AS "view_g_campaign"
                    ON (("view_group"."id") = ("view_g_campaign"."group_id"))
                  );
                `
              },
              productGroupPgcCampaignByPgc: {
                customColumnNames: {
                  group_id: 'group_id',
                  campaign_id: 'campaign_id'
                },
                relationships: [{
                  type: 'pg_create_array_relationship',
                  args: {
                    name: 'campaignsWithPgcByPgc',
                    table: {
                      name: 'tbl_product_group',
                      schema: 'public'
                    },
                    using: {
                      manual_configuration: {
                        remote_table: {
                          name: 'view_product_group_pgc_campaign_by_pgc',
                          schema: 'public'
                        },
                        column_mapping: {
                          id: 'group_id'
                        },
                        insertion_order: null
                      }
                    }
                  }
                }, {
                  type: 'pg_create_object_relationship',
                  args: {
                    name: 'group',
                    table: {
                      name: 'view_product_group_pgc_campaign_by_pgc',
                      schema: 'public'
                    },
                    using: {
                      manual_configuration: {
                        remote_table: {
                          name: 'tbl_product_group',
                          schema: 'public'
                        },
                        column_mapping: {
                          group_id: 'id'
                        }
                      }
                    }
                  }
                }, {
                  type: 'pg_create_array_relationship',
                  args: {
                    name: 'groupPgcCampaigns',
                    table: {
                      name: 'mn_group_pg_collection',
                      schema: 'public'
                    },
                    using: {
                      manual_configuration: {
                        remote_table: {
                          name: 'view_product_group_pgc_campaign_by_pgc',
                          schema: 'public'
                        },
                        column_mapping: {
                          id: 'g_pgc_id'
                        },
                        insertion_order: null
                      }
                    }
                  }
                }, {
                  type: 'pg_create_object_relationship',
                  args: {
                    name: 'groupPgCollection',
                    table: {
                      name: 'view_product_group_pgc_campaign_by_pgc',
                      schema: 'public'
                    },
                    using: {
                      manual_configuration: {
                        remote_table: {
                          name: 'mn_group_pg_collection',
                          schema: 'public'
                        },
                        column_mapping: {
                          g_pgc_id: 'id'
                        }
                      }
                    }
                  }
                }, {
                  type: 'pg_create_array_relationship',
                  args: {
                    name: 'asGroupCampaignConnection',
                    table: {
                      name: 'tbl_pg_collection',
                      schema: 'public'
                    },
                    using: {
                      manual_configuration: {
                        remote_table: {
                          name: 'view_product_group_pgc_campaign_by_pgc',
                          schema: 'public'
                        },
                        column_mapping: {
                          id: 'pgc_id'
                        },
                        insertion_order: null
                      }
                    }
                  }
                }, {
                  type: 'pg_create_object_relationship',
                  args: {
                    name: 'pgCollection',
                    table: {
                      name: 'view_product_group_pgc_campaign_by_pgc',
                      schema: 'public'
                    },
                    using: {
                      manual_configuration: {
                        remote_table: {
                          name: 'tbl_pg_collection',
                          schema: 'public'
                        },
                        column_mapping: {
                          pgc_id: 'id'
                        }
                      }
                    }
                  }
                }, {
                  type: 'pg_create_array_relationship',
                  args: {
                    name: 'groupPgcCampaigns',
                    table: {
                      name: 'mn_pg_collection_campaign',
                      schema: 'public'
                    },
                    using: {
                      manual_configuration: {
                        remote_table: {
                          name: 'view_product_group_pgc_campaign_by_pgc',
                          schema: 'public'
                        },
                        column_mapping: {
                          id: 'pgc_c_id'
                        },
                        insertion_order: null
                      }
                    }
                  }
                }, {
                  type: 'pg_create_object_relationship',
                  args: {
                    name: 'pgCollectionCampaign',
                    table: {
                      name: 'view_product_group_pgc_campaign_by_pgc',
                      schema: 'public'
                    },
                    using: {
                      manual_configuration: {
                        remote_table: {
                          name: 'mn_pg_collection_campaign',
                          schema: 'public'
                        },
                        column_mapping: {
                          pgc_c_id: 'id'
                        }
                      }
                    }
                  }
                }, {
                  type: 'pg_create_array_relationship',
                  args: {
                    name: 'groupsWithPgcByPgc',
                    table: {
                      name: 'tbl_campaign',
                      schema: 'public'
                    },
                    using: {
                      manual_configuration: {
                        remote_table: {
                          name: 'view_product_group_pgc_campaign_by_pgc',
                          schema: 'public'
                        },
                        column_mapping: {
                          id: 'campaign_id'
                        },
                        insertion_order: null
                      }
                    }
                  }
                }, {
                  type: 'pg_create_object_relationship',
                  args: {
                    name: 'campaign',
                    table: {
                      name: 'view_product_group_pgc_campaign_by_pgc',
                      schema: 'public'
                    },
                    using: {
                      manual_configuration: {
                        remote_table: {
                          name: 'tbl_campaign',
                          schema: 'public'
                        },
                        column_mapping: {
                          campaign_id: 'id'
                        }
                      }
                    }
                  }
                }],
                dropScript: 'DROP VIEW IF EXISTS view_product_group_pgc_campaign_by_pgc;',
                createScript: `
                  CREATE VIEW view_product_group_pgc_campaign_by_pgc AS (
                    WITH g_pgc_c AS (
                      SELECT
                        "view_g_pgc"."group_id" as "group_id",
                      "view_g_pgc"."id" as "g_pgc_id",
                        "view_pgc_c"."include_pgc_id" as "include_pgc_id",
                        "view_pgc_c"."exclude_pgc_id" as "exclude_pgc_id",
                      "view_pgc_c"."id" as "pgc_c_id",
                        "view_pgc_c"."campaign_id" as "campaign_id"
                      FROM
                        "public"."mn_group_pg_collection"  AS "view_g_pgc"
                      LEFT JOIN (
                        SELECT
                        id, include_pgc_id, exclude_pgc_id, campaign_id
                        FROM
                        "public"."mn_pg_collection_campaign"
                      ) AS "view_pgc_c"
                      ON (("view_g_pgc"."pgc_id") = ("view_pgc_c"."include_pgc_id") OR ("view_g_pgc"."pgc_id") = ("view_pgc_c"."exclude_pgc_id"))
                      WHERE "view_pgc_c"."campaign_id" IS NOT NULL
                    )
                    SELECT
                      "view_g_gpc_c_2"."group_id",
                      "view_g_gpc_c_2"."g_pgc_id",
                      "view_g_gpc_c_2"."include_pgc_id" AS pgc_id,
                      "view_g_gpc_c_2"."pgc_c_id",
                      "view_g_gpc_c_2"."campaign_id"
                    FROM(
                      SELECT
                        group_id,
                        campaign_id
                      FROM
                        g_pgc_c
                      WHERE include_pgc_id IS NOT NULL
                      EXCEPT (
                        SELECT
                          group_id,
                          campaign_id
                        FROM
                          g_pgc_c
                        WHERE exclude_pgc_id IS NOT NULL
                      )
                    ) AS "view_ava_g_c"
                    LEFT JOIN (
                      SELECT
                        group_id, g_pgc_id, include_pgc_id, exclude_pgc_id, pgc_c_id, campaign_id
                      FROM
                        g_pgc_c
                    ) AS "view_g_gpc_c_2"
                    ON (
                        ("view_g_gpc_c_2"."group_id") = ("view_ava_g_c"."group_id")
                      AND
                        ("view_g_gpc_c_2"."campaign_id") = ("view_ava_g_c"."campaign_id"))
                    WHERE (
                        ("view_g_gpc_c_2"."campaign_id" IS NOT NULL)
                      AND
                        ("view_g_gpc_c_2"."include_pgc_id" IS NOT NULL)
                    )
                  );
                `
              }
            }
          }
        }
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
        role: 'string',
        userSetting: ['hasOne', 'userSetting', {
          foreignKey: 'user_setting_id'
        }]
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
    },
    userMemoEx: {
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
        userSetting: ['belongsTo', 'userSetting', {
          foreignKey: 'user_setting_id',
          ammTargetAs: 'exData',
          ammTargetHasMany: false
        }],
        userMemo: ['belongsTo', 'userMemo', {
          foreignKey: 'user_memo_id',
          ammTargetAs: 'exData',
          ammTargetHasMany: false
        }]
      }
    },
    orderProduct: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        quantity: 'integer',
        price: 'integer',
        totalPrice: 'integer',
        data: {
          type: 'jsonb',
          defaultValue: {}
        }
      },
      options: {
        indexes: [{
          name: 'order_product_uniqueness',
          unique: true,
          fields: ['order_id', 'product_id'],
          where: {
            deleted_at: null
          }
        }]
      }
    },
    productGroupCampaign: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true
        },
        data: {
          type: 'jsonb',
          defaultValue: {}
        }
      },
      options: {
        indexes: [{
          name: 'product_group_campaign_uniqueness',
          unique: true,
          fields: ['product_group_id', 'campaign_id'],
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