/* eslint-disable no-param-reassign, import/no-named-as-default-member */
import { Sequelize, ModelDefined, Model } from 'sequelize';
import { AmmOrmI, AmmModelI, Schemas } from './interfaces';
import AmmModel from './AmmModel';
import AssociationModel from './AssociationModel';

export default class AmmOrm {
  static ThroughValues = AmmModel.ThroughValues;

  static columnTypes = AmmModel.columnTypes;

  db : Sequelize;
  ammSchemas : Schemas;
  tableInfo : { [name : string] : AmmModel };
  associationModelInfo : { [name : string] : AmmModelI };

  constructor(sequelizeDb : Sequelize, ammSchemas : Schemas) {
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

  getAmmModel(name) : AmmModelI | undefined {
    return this.tableInfo[name];
  }

  getSqlzModel(name) : ModelDefined<Model, any> | undefined {
    const model = this.getAmmModel(name);
    return model && model.sqlzModel;
  }

  getAmmAssociationModel(name) : AmmModelI | undefined {
    return this.associationModelInfo[name];
  }

  getSqlzAssociationModel(name) : ModelDefined<Model, any> | undefined {
    const model = this.getAmmAssociationModel(name);
    return model && model.sqlzModel;
  }
}

Object.keys(AmmModel.columnTypes).forEach((name) => {
  AmmOrm[name] = AmmModel.columnTypes[name];
});
