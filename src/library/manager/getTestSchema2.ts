import sequelize from 'sequelize';
import { IJsonSchemas, JsonModelAttributes } from './azColumnTypes';

const productColumns : JsonModelAttributes = {
  thumbnail: {
    type: 'jsonb',
    defaultValue: {},
  },
  pictures: {
    type: 'jsonb',
    defaultValue: [],
  },
  name: ['string', 900],
  price: ['integer'],
  weight: 'float',
  description: 'text',
  data: {
    type: 'jsonb',
    defaultValue: {},
  },
};

const getSchemas : () => IJsonSchemas = () => ({
  models: {
    accountLink: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        provider_id: 'string',
        provider_user_id: 'string',
        provider_user_access_info: {
          type: 'jsonb',
          // unique: true,
        },
        data: {
          type: 'jsonb',
          defaultValue: {},
        },
        user: ['belongsTo', 'user', {
          foreignKey: 'user_id',
          ammTargetAs: 'accountLinks',
          ammTargetHasMany: true,
        }],
        recoveryToken: ['hasOne', 'recoveryToken', {
          foreignKey: 'account_link_id',
        }],
      },
      options: {
        indexes: [
          {
            name: 'provider_user_id_should_be_unique',
            unique: true,
            fields: ['user_id', 'provider_id', 'provider_user_id'],
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
    user: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: 'string',
          // unique: true,
          comment: 'Username',
        },
        type: {
          type: 'string',
          defaultValue: 'regular',
          comment: 'type of user. ex. regular, room, ... etc.',
        },
        privilege: 'string',
        labels: {
          type: 'jsonb',
          defaultValue: {},
        },
        // email: ['string', 900],
        picture: 'text',
        data: {
          type: 'jsonb',
          defaultValue: {},
        },
        managedBy: ['belongsTo', 'organization', {
          foreignKey: 'org_mgr_id',
        }],
        userGroups: ['belongsToMany', 'userGroup', {
          through: {
            unique: false,
            ammModelName: 'userUserGroup',
            ammThroughTableColumnAs: 'user',
            ammThroughAs: 'relation',
          },
          foreignKey: 'user_id',
          otherKey: 'group_id',
        }],
        groupInvitations: ['belongsToMany', 'userGroup', {
          through: {
            unique: false,
            ammModelName: 'groupInvitation',
            ammThroughTableColumnAs: 'invitee',
            ammThroughAs: 'state',
          },
          foreignKey: 'invitee_id',
          otherKey: 'group_id',
        }],
        invitedGroupUsers: ['belongsToMany', 'userGroup', {
          through: {
            unique: false,
            ammModelName: 'groupInvitation',
            ammThroughTableColumnAs: 'inviter',
            ammThroughAs: 'state',
          },
          foreignKey: 'inviter_id',
          otherKey: 'group_id',
        }],
        organizations: ['belongsToMany', 'organization', {
          through: {
            unique: false,
            ammModelName: 'userOrganization',
            ammThroughTableColumnAs: 'user',
            ammThroughAs: 'relation',
          },
          foreignKey: 'user_id',
          otherKey: 'organization_id',
        }],
        organizationInvitations: ['belongsToMany', 'organization', {
          through: {
            unique: false,
            ammModelName: 'organizationInvitation',
            ammThroughTableColumnAs: 'invitee',
            ammThroughAs: 'state',
          },
          foreignKey: 'invitee_id',
          otherKey: 'organization_id',
        }],
        invitedOrganizationUsers: ['belongsToMany', 'organization', {
          through: {
            unique: false,
            ammModelName: 'organizationInvitation',
            ammThroughTableColumnAs: 'inviter',
            ammThroughAs: 'state',
          },
          foreignKey: 'inviter_id',
          otherKey: 'organization_id',
        }],
        projects: ['belongsToMany', 'project', {
          through: {
            unique: false,
            ammModelName: 'userProject',
            ammThroughTableColumnAs: 'user',
            ammThroughAs: 'relation',
          },
          foreignKey: 'user_id',
          otherKey: 'project_id',
        }],
        projectInvitations: ['belongsToMany', 'project', {
          through: {
            unique: false,
            ammModelName: 'projectInvitation',
            ammThroughTableColumnAs: 'invitee',
            ammThroughAs: 'state',
          },
          foreignKey: 'invitee_id',
          otherKey: 'project_id',
        }],
        invitedProjectUsers: ['belongsToMany', 'project', {
          through: {
            unique: false,
            ammModelName: 'projectInvitation',
            ammThroughTableColumnAs: 'inviter',
            ammThroughAs: 'state',
          },
          foreignKey: 'inviter_id',
          otherKey: 'project_id',
        }],
      },
      options: {
        name: {
          singular: 'user',
          plural: 'users',
        },
        // defaultScope: {
        //   attributes: userPublicColumns,
        // },
        hooks: {
          // executed "before" `Model.sync(...)`
          beforeSync(options) {
            // console.log('beforeSync');
          },
          // executed "after" `Model.sync(...)`
          afterSync(options : any) {
            // this = Model
            // console.log('afterSync');
            return options.sequelize.query('SELECT last_value, is_called FROM public.tbl_user_id_seq', { type: sequelize.QueryTypes.SELECT })
              .then(([result]) => {
                if (!result.is_called) {
                  return options.sequelize.query('ALTER SEQUENCE tbl_user_id_seq RESTART WITH 1000000001', { type: sequelize.QueryTypes.SELECT })
                  .then((result2) => {});
                }
                return Promise.resolve();
              });
          },
        },
      },
    },
    userSetting: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        // exData: ['hasOne', 'userMemoEx', {
        //   foreignKey: 'user_setting_id',
        // }],
        type: {
          type: ['string', 200],
          defaultValue: 'general',
        },
        data: {
          type: 'jsonb',
          defaultValue: {},
        },
        user: ['belongsTo', 'user', {
          foreignKey: 'user_id',
          ammTargetAs: 'userSettings',
          ammTargetHasMany: true,
        }],
      },
      options: {
        indexes: [
          {
            name: 'setting_type_should_be_unique_for_each_user',
            unique: true,
            fields: ['user_id', 'type'],
          },
        ],
      },
    },
    log: {
      columns: {
        type: ['string', 900],
        data: {
          type: 'jsonb',
          defaultValue: {},
        },
      },
    },
    recoveryToken: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        type: ['string', 200],
        key: ['string', 900],
        token: ['string', 900],
        accountLink: ['belongsTo', 'accountLink', {
          foreignKey: 'account_link_id',
        }],
      },
      options: {
        timestamps: true,
        paranoid: false,
        indexes: [
          {
            name: 'reset_password_key_should_be_unique',
            unique: true,
            fields: [/* 'type', */'key'],
          },
          {
            name: 'reset_password_token_should_be_unique',
            unique: true,
            fields: ['token'],
          },
          {
            name: 'only_one_reset_password_token_for_account_link',
            unique: true,
            fields: ['account_link_id'],
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
        name: ['string', 900],
        users: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'userUserGroup',
            ammThroughTableColumnAs: 'group',
            ammThroughAs: 'relation',
          },
          foreignKey: 'group_id',
          otherKey: 'user_id',
        }],
        inviters: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'groupInvitation',
            ammThroughTableColumnAs: 'group',
            ammThroughAs: 'state',
          },
          foreignKey: 'group_id',
          otherKey: 'inviter_id',
        }],
        invitees: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'groupInvitation',
            ammThroughTableColumnAs: 'group',
            ammThroughAs: 'state',
          },
          foreignKey: 'group_id',
          otherKey: 'invitee_id',
        }],
      },
    },
    organization: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        name: ['string', 900],
        data: {
          type: 'jsonb',
          defaultValue: {},
        },
        testDataForDiff: {
          type: 'jsonb',
          defaultValue: {
            d: `{"'--drfrfr\`srb}`,
          },
        },
        users: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'userOrganization',
            ammThroughTableColumnAs: 'organization',
            ammThroughAs: 'relation',
          },
          foreignKey: 'organization_id',
          otherKey: 'user_id',
        }],
        testAssociation: ['belongsTo', 'project', {
          foreignKey: 'test_asc_id',
        }],
        ownedUser: ['hasMany', 'user', {
          foreignKey: 'org_mgr_id',
        }],
        projects: ['hasMany', 'project', {
          foreignKey: 'organization_id',
        }],
        inviters: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'organizationInvitation',
            ammThroughTableColumnAs: 'organization',
            ammThroughAs: 'state',
          },
          foreignKey: 'organization_id',
          otherKey: 'inviter_id',
        }],
        invitees: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'organizationInvitation',
            ammThroughTableColumnAs: 'organization',
            ammThroughAs: 'state',
          },
          foreignKey: 'organization_id',
          otherKey: 'invitee_id',
        }],
      },
      options: {
        indexes: [
          {
            name: 'organization_name_idx',
            unique: false,
            fields: ['name'],
          },
        ],
      },
    },
    project: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        type: ['string', 900],
        name: ['string', 900],
        data: {
          type: 'jsonb',
          defaultValue: {},
        },
        users: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'userProject',
            ammThroughTableColumnAs: 'project',
            ammThroughAs: 'relation',
          },
          foreignKey: 'project_id',
          otherKey: 'user_id',
        }],
        organization: ['belongsTo', 'organization', {
          foreignKey: 'organization_id',
        }],
        inviters: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'projectInvitation',
            ammThroughTableColumnAs: 'project',
            ammThroughAs: 'state',
          },
          foreignKey: 'project_id',
          otherKey: 'inviter_id',
        }],
        invitees: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'projectInvitation',
            ammThroughTableColumnAs: 'project',
            ammThroughAs: 'state',
          },
          foreignKey: 'project_id',
          otherKey: 'invitee_id',
        }],
      },
    },
    memo: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        data: {
          type: 'jsonb',
          defaultValue: {},
        },
        users: ['belongsToMany', 'user', {
          through: {
            unique: false,
            ammModelName: 'userMemo',
            ammThroughTableColumnAs: 'memo',
            ammThroughAs: 'relation',
          },
          foreignKey: 'memo_id',
          otherKey: 'user_id',
          ammTargetOptions: {
            through: {
              unique: false,
              ammModelName: 'userMemo',
              ammThroughTableColumnAs: 'user',
              ammThroughAs: 'relation',
            },
            foreignKey: 'user_id',
            otherKey: 'memo_id',
          },
          ammTargetAs: 'memos',
        }],
      },
    },
    contactUsMessage: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        message: ['string', 900],
        data: {
          type: 'jsonb',
          defaultValue: {},
        },
        author: ['belongsTo', 'user', {
          foreignKey: 'author_id',
          ammTargetAs: 'leftMessages',
          ammTargetHasMany: true,
        }],
        assignee: ['belongsTo', 'user', {
          foreignKey: 'assignee_id',
          ammTargetAs: 'assignedMessage',
          ammTargetHasMany: true,
        }],
        state: {
          type: ['string', 900],
          defaultValue: 'pending',
        },
      },
    },
    productCategory: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        name: 'string',
        priority: 'integer',
        active: 'boolean',
        data: {
          type: 'jsonb',
          defaultValue: {},
        },
        groups: ['hasMany', 'productGroup', {
          foreignKey: 'category_id',
        }],
      },
    },
    product: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        customId: 'string',
        color: 'string',
        colorName: 'string',
        size: 'string',
        ...productColumns,
        ordering: 'integer',
        instock: 'integer',
        group: ['belongsTo', 'productGroup', {
          foreignKey: 'group_id',
        }],
        orders: ['belongsToMany', 'order', {
          through: {
            unique: false,
            ammModelName: 'orderProduct',
            ammThroughTableColumnAs: 'product',
            ammThroughAs: 'relation',
          },
          foreignKey: 'product_id',
          otherKey: 'order_id',
        }],
      },
    },
    productGroup: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        customId: 'string',
        ...productColumns,
        materials: 'text',
        products: ['hasMany', 'product', {
          foreignKey: 'group_id',
        }],
        category: ['belongsTo', 'productCategory', {
          foreignKey: 'category_id',
        }],
        campaigns: ['belongsToMany', 'campaign', {
          through: {
            unique: false,
            ammModelName: 'productGroupCampaign',
            ammThroughTableColumnAs: 'productGroup',
            ammThroughAs: 'relation',
          },
          foreignKey: 'product_group_id',
          otherKey: 'campaign_id',
        }],
      },
    },
    campaign: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        name: ['string', 900],
        type: ['string', 191],
        durationType: ['string', 900], // 'time-range', 'permanent'
        start: 'date',
        end: 'date',
        state: 'string',
        data: {
          type: 'jsonb',
          defaultValue: {},
        },
        productGroups: ['belongsToMany', 'productGroup', {
          through: {
            unique: false,
            ammModelName: 'productGroupCampaign',
            ammThroughTableColumnAs: 'campaign',
            ammThroughAs: 'relation',
          },
          foreignKey: 'campaign_id',
          otherKey: 'product_group_id',
        }],
      },
    },
    ordererInfo: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
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
          ammTargetHasMany: true,
        }],
        asDefaultTo: ['belongsTo', 'user', {
          foreignKey: 'as_default_to',
          ammTargetAs: 'defaultOrdererInfo',
        }],
      },
    },
    recipientInfo: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
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
          ammTargetHasMany: true,
        }],
        asDefaultTo: ['belongsTo', 'user', {
          foreignKey: 'as_default_to',
          ammTargetAs: 'defaultRecipientInfo',
        }],
      },
    },
    order: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        memo: 'text',
        shipmentId: 'text',
        orderer: {
          type: 'jsonb',
          defaultValue: {},
        },
        recipient: {
          type: 'jsonb',
          defaultValue: {},
        },
        data: {
          type: 'jsonb',
          defaultValue: {},
        },
        user: ['belongsTo', 'user', {
          foreignKey: 'user_id',
          ammTargetAs: 'orders',
          ammTargetHasMany: true,
        }],
        products: ['belongsToMany', 'product', {
          through: {
            unique: false,
            ammModelName: 'orderProduct',
            ammThroughTableColumnAs: 'order',
            ammThroughAs: 'relation',
          },
          foreignKey: 'order_id',
          otherKey: 'product_id',
        }],
      },
    },
    subscriptionOrder: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        memo: 'text',
        shipmentId: 'text',
        orderer: {
          type: 'jsonb',
          defaultValue: {},
        },
        recipient: {
          type: 'jsonb',
          defaultValue: {},
        },
        data: {
          type: 'jsonb',
          defaultValue: {},
        },
        user: ['belongsTo', 'user', {
          foreignKey: 'user_id',
          ammTargetAs: 'subscriptionOrders',
          ammTargetHasMany: true,
        }],
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
        role: 'string',
      },
      options: {
        indexes: [
          {
            name: 'user_user_group_uniqueness',
            unique: true,
            fields: ['user_id', 'group_id'],
            where: {
              deleted_at: null,
            },
          },
        ],
      },
    },
    groupInvitation: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        state: 'integer',
      },
      options: {
        indexes: [
          {
            name: 'group_only_invite_once',
            unique: true,
            fields: ['group_id', 'inviter_id', 'invitee_id'],
            where: {
              deleted_at: null,
            },
          },
        ],
      },
    },
    userOrganization: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        labels: {
          type: 'jsonb',
          defaultValue: {},
        },
        data: {
          type: 'jsonb',
          defaultValue: {},
        },
        role: 'string',
      },
      options: {
        indexes: [
          {
            name: 'user_organization_uniqueness',
            unique: true,
            fields: ['user_id', 'organization_id'],
            where: {
              deleted_at: null,
            },
          },
        ],
      },
    },
    organizationInvitation: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        state: 'integer',
      },
      options: {
        indexes: [
          {
            name: 'organization_only_invite_once',
            unique: true,
            fields: ['organization_id', 'inviter_id', 'invitee_id'],
            where: {
              deleted_at: null,
            },
          },
        ],
      },
    },
    userProject: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        labels: {
          type: 'jsonb',
          defaultValue: {},
        },
        data: {
          type: 'jsonb',
          defaultValue: {},
        },
        role: 'string',
      },
      options: {
        indexes: [
          {
            name: 'user_project_uniqueness',
            unique: true,
            fields: ['user_id', 'project_id'],
            where: {
              deleted_at: null,
            },
          },
        ],
      },
    },
    projectInvitation: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        state: 'integer',
      },
      options: {
        indexes: [
          {
            name: 'project_only_invite_once',
            unique: true,
            fields: ['project_id', 'inviter_id', 'invitee_id'],
            where: {
              deleted_at: null,
            },
          },
        ],
      },
    },
    userMemo: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        role: 'string',
        // exData: ['hasOne', 'userMemoEx', {
        //   foreignKey: 'user_memo_id',
        // }],
        userSetting: ['hasOne', 'userSetting', {
          foreignKey: 'user_setting_id',
        }],
      },
      options: {
        indexes: [
          {
            name: 'user_memo_uniqueness',
            unique: true,
            fields: ['user_id', 'memo_id'],
            where: {
              deleted_at: null,
            },
          },
        ],
      },
    },
    userMemoEx: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        data: {
          type: 'jsonb',
          defaultValue: {},
        },
        userSetting: ['belongsTo', 'userSetting', {
          foreignKey: 'user_setting_id',
          ammTargetAs: 'exData',
          ammTargetHasMany: false,
        }],
        userMemo: ['belongsTo', 'userMemo', {
          foreignKey: 'user_memo_id',
          ammTargetAs: 'exData',
          ammTargetHasMany: false,
        }],
      },
    },
    orderProduct: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        quantity: 'integer',
        price: 'integer',
        totalPrice: 'integer',
        data: {
          type: 'jsonb',
          defaultValue: {},
        },
      },
      options: {
        indexes: [
          {
            name: 'order_product_uniqueness',
            unique: true,
            fields: ['order_id', 'product_id'],
            where: {
              deleted_at: null,
            },
          },
        ],
      },
    },
    productGroupCampaign: {
      columns: {
        id: {
          type: 'bigint',
          primaryKey: true,
          autoIncrement: true,
        },
        data: {
          type: 'jsonb',
          defaultValue: {},
        },
      },
      options: {
        indexes: [
          {
            name: 'product_group_campaign_uniqueness',
            unique: true,
            fields: ['product_group_id', 'campaign_id'],
            where: {
              deleted_at: null,
            },
          },
        ],
      },
    },
  },
});

export default getSchemas;
