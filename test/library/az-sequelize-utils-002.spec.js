/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import Sequelize from 'sequelize';
import AsuOrm from 'library/AsuOrm';
import fs from 'fs';
import path from 'path';
import pgStructure from 'pg-structure';
import getLogFileNamefrom from '../test-utils/getLogFileName';
import az_pglib from '../test-utils/azpg/az_pglib';

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
  constructor(asuSchemas) {
    this.asuSchemas = asuSchemas;
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

    this.asuOrm = new AsuOrm(this.sequelizeDb, this.asuSchemas);
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

    it('should able to do CRUD for has-many association ', async function () {
      this.timeout(900000);
      const User = asuMgr.asuOrm.getSqlzModel('user');
      const UserGroup = asuMgr.asuOrm.getSqlzModel('userGroup');

      await asuMgr.sync();
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
      const r = await az_pglib.create_connection(getConnectString(postgresUser));
      const db = await pgStructure(r.client, { includeSchemas: ['public'], keepConnection: true });
      console.log('db.schemas.get("public") :', db.schemas.get('public').sequences);
      const table = db.get('tbl_account_link');
      const columnNames = table.columns.map(c => c.name);
      console.log('columnNames :', columnNames);
      // const constraintNames = table.constraints.map((c) => {
      //   console.log('c :', c);
      //   return c.name;
      // });
      // console.log('constraintNames :', constraintNames);
      const indexNames = table.indexes.map((c) => {
        console.log('c.columnsAndExpressions :', c.columnsAndExpressions.map(col => col.name).join(', '));
        return c.name;
      });
      console.log('indexNames :', indexNames);
      // const columnTypeName = table.columns.get('owner_id').type.name;
      // const indexColumnNames = table.indexes.get('ix_mail').columns;
      const relatedTables = table.hasManyTables;
      await r.client.end();
    });

    it('should able to do CRUD with transaction', function () {
      this.timeout(900000);
      const User = asuMgr.asuOrm.getSqlzModel('user');
      const UserGroup = asuMgr.asuOrm.getSqlzModel('userGroup');

      return asuMgr.sync()
      .then(() => asuMgr.sequelizeDb.transaction({
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
              [AsuOrm.ThroughValues]: {
                role: 'group 3',
              },
            }],
            [AsuOrm.ThroughValues]: {
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
      .then(() => asuMgr.sequelizeDb.transaction({
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
              [AsuOrm.ThroughValues]: {
                role: 'group 3',
              },
            }],
            [AsuOrm.ThroughValues]: {
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
