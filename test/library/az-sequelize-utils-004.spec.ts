/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import sequelize, {
  Sequelize,
  HasManyAddAssociationMixin,
  HasManyCreateAssociationMixin,
} from 'sequelize';
import parser from 'js-sql-parse';
import AmmOrm, { AmmSchemas } from 'library/core';
import AzModelManager, { JsonSchemasX } from 'library/manager';
import { Overwrite, ExtendedModel } from 'library';
import getTestSchema from 'library/manager/getTestSchema';
import fs from 'fs';
import path from 'path';
import getLogFileNamefrom from '../test-utils/getLogFileName';

import {
  postgresPort,
  postgresUser,
  postgresDbName,
  postgresPassword,
  postgresHost,
  getConnectString,
  resetTestDbAndTestRole,
} from '../test-utils/utils';

import {
  getModelDefs01,
} from '../test-data/az-sequelize-utils-testdata';

import {
  getModelDefs04,
} from '../test-data/az-sequelize-utils-testdata/fromAzModelSchemas';

declare const describe;
declare const beforeEach;
declare const afterEach;
declare const it;

const logFiles = {};

const write = (file, data) => {
  logFiles[file] = logFiles[file] || fs.createWriteStream(file, { flags: 'w' });
  const logFile = logFiles[file];
  logFile.write(data);
};

export default write;

const logFileName = getLogFileNamefrom(__filename);
function databaseLogger(...args) { // eslint-disable-line no-unused-vars
  write(path.resolve(__dirname, logFileName), `${args[0]}\n`);
}

// const { expect } = chai;

class AzRdbmsMgr {
  ammSchemas : AmmSchemas;
  sequelizeDb : Sequelize;
  ammOrm : AmmOrm;

  constructor(ammSchemas) {
    this.ammSchemas = ammSchemas;
    this.sequelizeDb = new Sequelize(getConnectString(postgresUser), {
      dialect: 'postgres',
      logging: databaseLogger,
      minifyAliases: true,
      define: {
        defaultScope: {
          attributes: {
            exclude: ['created_at', 'updated_at', 'deleted_at'],
          },
        },
      },
    });

    this.ammOrm = new AmmOrm(this.sequelizeDb, this.ammSchemas);
  }

  sync(force = true) {
    return this.ammOrm.sync(force);
  }

  close() {
    return this.ammOrm.db.close();
  }
}

type AccountLinkCreationAttributes = {
  name: string;
};

type AccountLinkAttributes = AccountLinkCreationAttributes & {
  id: string;
};

type AccountLinkI = AccountLinkAttributes & {
  owner?: UserI;
};

type UserGroupCreationAttributes = {
  name: string;
};

type UserGroupAttributes = UserGroupCreationAttributes & {
  id: string;
};

type UserCreationAttributes = {
  username: string;
  accountLinks?: AccountLinkCreationAttributes[];
  userGroups?: UserGroupCreationAttributes[];
};

type UserAttributes = Overwrite<UserCreationAttributes, {
  id: string;
  accountLinks: AccountLinkI[];
  userGroups: UserGroupAttributes[];
}>;

type UserI = UserAttributes & {
  addAccountLink: HasManyAddAssociationMixin<ExtendedModel<{}, UserGroupAttributes, UserGroupCreationAttributes>, string>;
  createAccountLink: HasManyCreateAssociationMixin<ExtendedModel<{}, UserGroupAttributes, UserGroupCreationAttributes>>;

  // timestamps!
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

describe('AmmOrm test 04', () => {
  describe('Basic', () => {
    let ammMgr : AzRdbmsMgr = null;
    beforeEach(() => resetTestDbAndTestRole()
      .then(() => {
        const schemas = getModelDefs04();
        if (schemas instanceof Error) {
          return Promise.reject(schemas);
        }
        ammMgr = new AzRdbmsMgr(schemas);
        return ammMgr;
      }));

    afterEach(() => ammMgr.close());

    it('should able to do CRUD for has-many association ', async function () {
      this.timeout(900000);
      const User = ammMgr.ammOrm.getSqlzModel<UserI/* can simply use 'any' */, UserAttributes, UserCreationAttributes>('user');
      const UserGroup = ammMgr.ammOrm.getSqlzModel('userGroup');

      await ammMgr.sync();
      let user = await User.create({
        username: 'xxxx',
        userGroups: [{
          name: 'group 1',
        }],
      }, {
        // include: [{
        //   model: UserGroup,
        //   as: 'userGroups',
        // }],
      });
      // console.log('user :', JSON.stringify(user));
      await user.createAccountLink({
        name: '2',
      })
      user = await User.findOne({
        where: {
          username: 'xxxx',
        },
        include: User.ammIncloud(['userGroups.users.accountLinks', 'accountLinks.owner']),
        // include: [{
        //   model: UserGroup,
        //   as: 'userGroups',
        // }],
      });
      console.log('user :', JSON.stringify(user.toJSON()));
      let userGroup = await UserGroup.findOne({
        where: {
          name: 'group 1',
        },
        include: [{
          model: User,
          as: 'users',
        }],
      });
      // console.log('userGroup :', userGroup && userGroup.dataValues);

      userGroup = await UserGroup.create({
        name: 'group 2',
        users: [{
          username: 'oooo',
          userGroups: [{
            name: 'group 3',
          }],
        }],
      }, {
        // include: [{
        //   model: User,
        //   as: 'users',
        //   include: [{
        //     model: UserGroup,
        //     as: 'userGroups',
        //   }],
        // }],
      });
      // console.log('userGroup :', userGroup && userGroup.dataValues);

      // https://www.pg-structure.com/nav.01.guide/guide--nc/examples.html#connection
      // const result = parser.parse('SELECT * FROM dummy WHERE ((deleted_at IS NULL) AND (owner_id = 1) AND (xxx != 8) AND (kkk IS NOT NULL))');
      // {
      //   const { where } = result.parsed.table_exp;
      //   const { condition } = where;
      //   console.log('condition.exprs :', condition.exprs);
      //   console.log('condition.exprs[0].right.exprs[0] :', condition.exprs[0].right.exprs[0]);
      // }
      const jsonSchemaX = new JsonSchemasX('public', <any>getTestSchema());
      jsonSchemaX.parseRawSchemas();
      const schemaFromJson = jsonSchemaX.schema;
      write(path.resolve(__dirname, 'schema_from_json.json'), JSON.stringify(schemaFromJson, null, 2));
      const testResult = jsonSchemaX.toCoreSchemas();
      const amMgr = new AzModelManager(getConnectString(postgresUser));
      return amMgr.reportDb();
    });

    it('should able to do CRUD with transaction', function () {
      this.timeout(900000);
      const User = ammMgr.ammOrm.getSqlzModel('user');
      const UserGroup = ammMgr.ammOrm.getSqlzModel('userGroup');

      return ammMgr.sync()
      .then(() => ammMgr.sequelizeDb.transaction({
        isolationLevel: sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        // deferrable: sequelize.Deferrable.SET_DEFERRED(['mn_user_user_group_user_id_fkey']),
        // deferrable: sequelize.Deferrable.SET_DEFERRED,
      })
        .then(t => UserGroup.create({
          name: 'group 2',
          users: [{
            username: 'oooo',
            userGroups: [{
              name: 'group 3',
              [AmmOrm.ThroughValues]: {
                role: 'group 3',
              },
            }],
            [AmmOrm.ThroughValues]: {
              role: 'group 2',
            },
          }],
        }, {
          transaction: t,
        })
          .then(result => t.commit()
            .then(() => result)).catch((error) => {
            console.log(error);
            return t.rollback()
            .then(() => Promise.reject(error));
          })))
      .then(() => ammMgr.sequelizeDb.transaction({
        isolationLevel: sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        // deferrable: sequelize.Deferrable.SET_DEFERRED(['mn_user_user_group_user_id_fkey']),
        // deferrable: sequelize.Deferrable.SET_DEFERRED,
      })
        .then(t => UserGroup.create({
          name: 'group 2',
          users: [{
            username: 'oooo',
            userGroups: [{
              id: 1,
              name: 'group 3',
              [AmmOrm.ThroughValues]: {
                role: 'group 3',
              },
            }],
            [AmmOrm.ThroughValues]: {
              role: 'group 2',
            },
          }],
        }, {
          transaction: t,
        })
          .then(result => t.commit()
            .then(() => result)).catch(error => t.rollback())));
    });
  });
});
