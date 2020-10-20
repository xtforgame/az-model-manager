/* eslint-disable no-unused-vars, no-undef */
import { Sequelize } from 'sequelize';
import AmmOrm, { AmmSchemas } from 'library/core';

export default class AzRdbmsMgr {
  ammSchemas : AmmSchemas;
  sequelizeDb : Sequelize;
  ammOrm : AmmOrm;

  constructor(ammSchemas, connectString, databaseLogger) {
    this.ammSchemas = ammSchemas;
    this.sequelizeDb = new Sequelize(connectString, {
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
