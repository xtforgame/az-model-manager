/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import sequelize, {
  Sequelize,
  HasManyAddAssociationMixin,
  HasManyCreateAssociationMixin,
  DataTypes,
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
import AzRdbmsMgr from '../test-utils/AzRdbmsMgr';

import {
  getModelDefs01,
} from '../test-data/az-sequelize-utils-testdata';

import {
  getModelDefs04,
} from '../test-data/az-sequelize-utils-testdata/fromAzModelSchemas';

import * as models from './models';

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

const addColumnTest = async (ammMgr : AzRdbmsMgr) => {
  const queryInterface = ammMgr.sequelizeDb.getQueryInterface();
  await queryInterface.addColumn(
    {
      schema: 'public',
      tableName: 'tbl_account_link',
    },
    'extra_user_id',
    {
      type: DataTypes.BIGINT,
    },
  );
  await queryInterface.addConstraint('tbl_account_link', {
    type: 'foreign key',
    fields: ['extra_user_id'],
    name: 'my_constraint_name',
    references: {
      table: 'tbl_user',
      field: 'id'
    },
    onDelete: 'CASCADE', // 'SET NULL' for mn tables
    onUpdate: 'CASCADE',
  });
  await queryInterface.addColumn(
    {
      schema: 'public',
      tableName: 'tbl_account_link',
    },
    'extra_user_id2',
    {
      type: DataTypes.BIGINT,
      references: {
        model: 'tbl_user',
        key: 'id',
      },
    },
  );
}

describe('AmmOrm test 04', () => {
  describe('Basic', () => {
    let ammMgr : AzRdbmsMgr = null;
    beforeEach(() => resetTestDbAndTestRole()
      .then(() => {
        const schemas = getModelDefs04();
        if (schemas instanceof Error) {
          return Promise.reject(schemas);
        }
        ammMgr = new AzRdbmsMgr(schemas, getConnectString(postgresUser), databaseLogger);
        return ammMgr;
      }));

    afterEach(() => ammMgr.close());

    it('should able to do CRUD for has-many association ', async function () {
      this.timeout(900000);
      const User = ammMgr.ammOrm.getSqlzModel<models.UserI/* can simply use 'any' */, models.UserAttributes, models.UserCreationAttributes>('user');
      const UserGroup = ammMgr.ammOrm.getSqlzModel<models.UserGroupI>('userGroup');
      const UserMemo = ammMgr.ammOrm.getSqlzAssociationModel<models.UserMemoI>('userMemo');
      const UserSetting = ammMgr.ammOrm.getSqlzModel<models.UserSettingI>('userSetting');

      await ammMgr.sync();
      let user = await User.create({
        name: 'xxxx',
        userGroups: [{
          name: 'group 1',
        }],
        memos: [{}],
      }, {
        // include: [{
        //   model: UserGroup,
        //   as: 'userGroups',
        // }],
      });
      console.log('user.memos :', user.memos[0].data);
      // console.log('user :', JSON.stringify(user.toJSON()));
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
          name: 'oooo',
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


      let userMemo = await UserMemo.create({
        exData: [{
          data: {
            name: 'xxxxx 3',
          },
        }],
      }, {
        // include: [{
        //   model: UserMemoEx,
        //   as: 'exData',
        // }],
      });
      // console.log('userMemo :', userMemo && userMemo.dataValues);

      userMemo = await UserMemo.findOne({
        where: {
          id: 2,
        },
        include: UserMemo.ammInclude(['exData']),
      });
      console.log('userMemo :', userMemo && userMemo.dataValues);


      let userSetting = await UserSetting.create({
        exData: [{
          data: {
            name: 'xxxxx 3',
          },
        }],
      }, {
        // include: [{
        //   model: UserSettingEx,
        //   as: 'exData',
        // }],
      });
      console.log('userSetting :', userSetting && userSetting.dataValues);

      userSetting = await UserSetting.findOne({
        where: {
          id: 1,
        },
        include: UserSetting.ammInclude(['exData']),
      });
      console.log('userSetting :', userSetting && userSetting.dataValues);


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
      const schemaFromJson = jsonSchemaX.schemas;
      write(path.resolve(__dirname, 'schema_from_json.json'), JSON.stringify(schemaFromJson, null, 2));
      const tsFile = await jsonSchemaX.buildModelTsFile();
      write(path.resolve(__dirname, 'models.tsx'), tsFile);
      const testResult = jsonSchemaX.toCoreSchemas();
      const amMgr = new AzModelManager(getConnectString(postgresUser));
      await addColumnTest(ammMgr);
      return amMgr.reportDb();
    });


    it('should able to do CRUD by ammInclude ', async function () {
      this.timeout(900000);
      const User = ammMgr.ammOrm.getSqlzModel<models.UserI/* can simply use 'any' */, models.UserAttributes, models.UserCreationAttributes>('user');
      const UserGroup = ammMgr.ammOrm.getSqlzModel('userGroup');

      await ammMgr.sync();
      let user = await User.create({
        name: 'xxxx',
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
          name: 'xxxx',
        },
        include: User.ammInclude(['userGroups.users.accountLinks', 'accountLinks.user']),
        // include: [{
        //   model: UserGroup,
        //   as: 'userGroups',
        // }],
      });
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
            name: 'oooo',
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
            name: 'oooo',
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
            .then(() => result)).catch(error => t.rollback())))
      .then(() => addColumnTest(ammMgr));
    });
  });
});
