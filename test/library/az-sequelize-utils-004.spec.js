/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import Sequelize from 'sequelize';
import AmmOrm from 'library/core';
import AzModelManager from 'library/manager';
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

const { expect } = chai;

class AzRdbmsMgr {
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
    return this.ammOrm.sync({ force });
  }

  close() {
    return this.ammOrm.db.close();
  }
}

describe('AmmOrm test 04', () => {
  describe('Basic', () => {
    let ammMgr = null;
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
      const User = ammMgr.ammOrm.getSqlzModel('user');
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
      user = await User.findOne({
        where: {
          username: 'xxxx',
        },
        include: [{
          model: UserGroup,
          as: 'userGroups',
        }],
      });
      // console.log('user :', JSON.stringify(user));
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
      const amMgr = new AzModelManager(getConnectString(postgresUser));
      const testResult = amMgr.testParseSchema();
      console.log('testResult :', testResult);
      return amMgr.reportDb();
    });

    it('should able to do CRUD with transaction', function () {
      this.timeout(900000);
      const User = ammMgr.ammOrm.getSqlzModel('user');
      const UserGroup = ammMgr.ammOrm.getSqlzModel('userGroup');

      return ammMgr.sync()
      .then(() => ammMgr.sequelizeDb.transaction({
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        // deferrable: Sequelize.Deferrable.SET_DEFERRED(['mn_user_user_group_user_id_fkey']),
        // deferrable: Sequelize.Deferrable.SET_DEFERRED,
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
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        // deferrable: Sequelize.Deferrable.SET_DEFERRED(['mn_user_user_group_user_id_fkey']),
        // deferrable: Sequelize.Deferrable.SET_DEFERRED,
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
