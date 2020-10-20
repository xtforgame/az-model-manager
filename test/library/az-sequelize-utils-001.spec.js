/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import Sequelize from 'sequelize';
import AmmOrm from 'library/core';
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

describe('AmmOrm test 01', () => {
  describe('Basic', () => {
    let ammMgr = null;
    beforeEach(() => resetTestDbAndTestRole()
      .then(() => {
        ammMgr = new AzRdbmsMgr(getModelDefs01());
      }));

    afterEach(() => ammMgr.close());

    it('should able to do CRUD', function () {
      this.timeout(900000);
      const User = ammMgr.ammOrm.getSqlzModel('user');
      const AccountLink = ammMgr.ammOrm.getSqlzModel('accountLink');

      return ammMgr.sync()
      .then(() => User.create({
        username: 'xxxx',
        accountLinks: [{
          provider_id: 'basic',
          provider_user_id: 'user1',
          provider_user_access_info: {},
        }],
      }, {
        // include: [{
        //   model: AccountLink,
        //   as: 'accountLinks',
        // }],
      })
        .then((user) => {
          // console.log('user :', user.dataValues);
        }))
      .then(() => User.findOne({
        where: {
          username: 'xxxx',
        },
        include: [{
          model: AccountLink,
          as: 'accountLinks',
        }],
      })
        .then((user) => {
          // console.log('user :', user && user.dataValues);
        }))
      .then(() => AccountLink.findOne({
        where: {
          provider_id: 'basic',
          provider_user_id: 'user1',
        },
        include: [{
          model: User,
          as: 'owner',
        }],
      })
        .then((accountLink) => {
          // console.log('accountLink :', accountLink && accountLink.dataValues);
        }))
      .then(() => AccountLink.create({
        provider_id: 'basic',
        provider_user_id: 'user2',
        owner: {
          username: 'oooo',
          accountLinks: [{
            provider_id: 'third-party-1',
            provider_user_id: 'user2',
          }],
        },
      }, {
        // include: [{
        //   model: User,
        //   as: 'owner',
        //   include: [{
        //     model: AccountLink,
        //     as: 'accountLinks',
        //   }],
        // }],
      })
        .then((accountLink) => {
          // console.log('accountLink :', accountLink && accountLink.dataValues);
        }));
    });

    it('should able to do CRUD with transaction', function () {
      this.timeout(900000);
      const User = ammMgr.ammOrm.getSqlzModel('user');
      const AccountLink = ammMgr.ammOrm.getSqlzModel('accountLink');

      return ammMgr.sync()
      .then(() => ammMgr.sequelizeDb.transaction({
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        // deferrable: Sequelize.Deferrable.SET_DEFERRED(['mn_user_user_group_user_id_fkey']),
        // deferrable: Sequelize.Deferrable.SET_DEFERRED,
      })
        .then(t => AccountLink.create({
          provider_id: 'basic',
          provider_user_id: 'user2',
          owner: {
            username: 'oooo',
            accountLinks: [{
              provider_id: 'third-party-1',
              provider_user_id: 'user2',
            }],
          },
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
        .then(t => AccountLink.create({
          provider_id: 'basic',
          provider_user_id: 'user2',
          owner: {
            username: 'oooo',
            accountLinks: [{
              provider_id: 'basic',
              provider_user_id: 'user2',
            }],
          },
        }, {
          transaction: t,
        })
          .then(result => t.commit()
            .then(() => result)).catch(error => t.rollback())));
    });
  });
});
