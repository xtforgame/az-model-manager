/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import Sequelize from 'sequelize';
import AmmOrm from 'library/core';
import fs from 'fs';
import path from 'path';
import AzRdbmsMgr from '../test-utils/AzRdbmsMgr';
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

describe('AmmOrm test 03', () => {
  describe('Basic', () => {
    let ammMgr = null;
    beforeEach(() => resetTestDbAndTestRole()
      .then(() => {
        ammMgr = new AzRdbmsMgr(getModelDefs01(), getConnectString(postgresUser), databaseLogger);
      }));

    afterEach(() => ammMgr.close());

    it('should able to add has-many association ', function () {
      this.timeout(900000);
      const User = ammMgr.ammOrm.getSqlzModel('user');
      const UserGroup = ammMgr.ammOrm.getSqlzModel('userGroup');

      let user = null;
      return ammMgr.sync()
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
