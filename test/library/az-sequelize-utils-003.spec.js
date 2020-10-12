/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import Sequelize from 'sequelize';
import AsuOrm from 'library/AsuOrm';
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
  constructor(asuModelDefs) {
    this.asuModelDefs = asuModelDefs;
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

    this.asuOrm = new AsuOrm(this.sequelizeDb, this.asuModelDefs);
  }

  sync(force = true) {
    return this.asuOrm.sync({ force });
  }

  close() {
    return this.asuOrm.db.close();
  }
}

describe('AsuOrm test', () => {
  describe('Basic', () => {
    let asuMgr = null;
    beforeEach(() => resetTestDbAndTestRole()
      .then(() => {
        asuMgr = new AzRdbmsMgr(getModelDefs01());
      }));

    afterEach(() => asuMgr.close());

    it('should able to add has-many association ', function () {
      this.timeout(900000);
      const User = asuMgr.asuOrm.getSqlzModel('user');
      const UserGroup = asuMgr.asuOrm.getSqlzModel('userGroup');

      let user = null;
      return asuMgr.sync()
      .then(() => Promise.all([User.create(), UserGroup.create()])
        .then(([_user, userGroup]) => {
          user = _user;
          // console.log('user :', JSON.stringify(user));
          return user.addUserGroup(userGroup, { through: { role: 1 } });
        })
        .then(() => {

        }));
    });
  });
});
