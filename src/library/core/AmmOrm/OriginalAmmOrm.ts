/* eslint-disable no-param-reassign, import/no-named-as-default-member */
import { Sequelize, ModelDefined } from 'sequelize';
import { AmmOrmI, AmmModelI, AmmSchemas } from '../interfaces';
import AmmModel from '../AmmModel';
import AssociationModel from '../AssociationModel';

export default class OriginalAmmOrm {
  static ThroughValues = AmmModel.ThroughValues;

  static columnTypes = AmmModel.columnTypes;

  db : Sequelize;
  ammSchemas : AmmSchemas;
  tableInfo : { [name : string] : AmmModel };
  associationModelInfo : { [name : string] : AmmModelI };

  constructor(sequelizeDb : Sequelize, ammSchemas : AmmSchemas) {
    this.db = sequelizeDb;
    this.ammSchemas = ammSchemas;
    this.tableInfo = {};
    this.associationModelInfo = {};

    const { models = {}, associationModels = {} } = this.ammSchemas;

    Object.keys(associationModels).forEach(name => (this.associationModelInfo[name] = new AssociationModel(this, name, associationModels[name])));

    Object.keys(models).forEach(name => (this.tableInfo[name] = new AmmModel(this, name, models[name])));

    Object.keys(this.tableInfo).forEach(name => this.tableInfo[name].setupAssociations());
  }

  sync(force = true) {
    return this.db.sync({ force });
  }

  addSqlzModelMethod(sqlzModel : ModelDefined<any, any>) {
  }
}

Object.keys(AmmModel.columnTypes).forEach((name) => {
  OriginalAmmOrm[name] = AmmModel.columnTypes[name];
});
