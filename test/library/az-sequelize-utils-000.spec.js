/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import Sequelize from 'sequelize';
import fs from 'fs';
import path from 'path';
import getLogFileNamefrom from '../test-utils/getLogFileName';
import az_pglib, { removeRoleAndDb, createRoleAndDb } from '../test-utils/azpg/az_pglib';

import {
  postgresPort,
  postgresUser,
  postgresDbName,
  postgresPassword,
  postgresHost,
  getConnectString,
  resetTestDbAndTestRole,
} from '../test-utils/utils';


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

class SequelizeC1 {
  constructor() {
    this.database = new Sequelize(getConnectString(postgresUser), {
      dialect: 'postgres',
      logging: databaseLogger,
      minifyAliases: true,
    });

    this.userTable = this.database.define('users',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
        name: Sequelize.STRING(900),
      },
      {
        tableName: 'tbl_users',
        timestamps: true,
        paranoid: true,
        underscored: true,
        name: {
          singular: 'user',
          plural: 'users',
        },
      });
  }

  sync(force = true) {
    return this.database.sync({ force });
  }

  addUser() {
    return this.userTable.create({ name: 'testUser' });
  }

  close() {
    return this.database.close();
  }
}

class SequelizeC2 {
  constructor() {
    this.database = new Sequelize(getConnectString(postgresUser), {
      dialect: 'postgres',
      logging: databaseLogger,
      minifyAliases: true,
    });

    this.userTable = this.database.define('users',
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
        name: Sequelize.STRING(900),
      },
      {
        tableName: 'tbl_users',
        timestamps: true,
        paranoid: true,
        underscored: true,
        name: {
          singular: 'user',
          plural: 'users',
        },
      });
  }

  sync(force = true) {
    return this.database.sync({ force });
  }

  addUser() {
    return this.userTable.create({ name: 'testUser' });
  }

  close() {
    return this.database.close();
  }
}

describe('AzSqlOrm test', () => {
  beforeEach(() => resetTestDbAndTestRole());

  describe('Basic', () => {
    it('should able to sync', function () {
      this.timeout(900000);
      const testModle = new SequelizeC1();
      return testModle.sync()
      .then(() => {
        let client = null;
        return az_pglib.create_connection(getConnectString('postgres'))
        .then((result) => {
          ({ client } = result);
          return az_pglib.send_query_promise(result.client, `
            SELECT EXISTS (
              SELECT 1
              FROM information_schema.tables 
              WHERE table_name = 'tbl_users'
            );
          `);
        })
        .then(({ result }) => {
          expect(result.rowCount, 'result.rowCount').to.equal(1);
          return result;
        });
      })
      .then(() => testModle.close());
    });

    it('should able to sync', function () {
      this.timeout(900000);
      const testModle = new SequelizeC1();
      return testModle.sync()
      .then(() => testModle.addUser())
      .then((user) => {
        expect(user.name, 'user.name').to.equal('testUser');
      })
      .then(() => testModle.close());
    });
  });

  describe('Basic', () => {
    it('should able to sync', function () {
      this.timeout(900000);
      const testModle = new SequelizeC1();
      return testModle.sync()
      .then(() => {
        let client = null;
        return az_pglib.create_connection(getConnectString('postgres'))
        .then((result) => {
          ({ client } = result);
          return az_pglib.send_query_promise(result.client, `
            SELECT EXISTS (
              SELECT 1
              FROM information_schema.tables 
              WHERE table_name = 'tbl_users'
            );
          `);
        })
        .then(({ result }) => {
          expect(result.rowCount, 'result.rowCount').to.equal(1);
          return result;
        });
      })
      .then(() => testModle.close());
    });

    it('should able to sync', function () {
      this.timeout(900000);
      const testModle = new SequelizeC1();
      return testModle.sync()
      .then(() => testModle.addUser())
      .then((user) => {
        expect(user.name, 'user.name').to.equal('testUser');
      })
      .then(() => testModle.close());
    });
  });
});
