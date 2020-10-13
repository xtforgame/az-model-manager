/* eslint-disable no-param-reassign, import/no-named-as-default-member */
import { Sequelize, ModelDefined, Model } from 'sequelize';
import { AsuOrmI, AsuModelI, Schemas } from './interfaces';
import AsuModel from './AsuModel';
import AssociationModel from './AssociationModel';

export default class AsuOrm {
  static ThroughValues = AsuModel.ThroughValues;

  static columnTypes = AsuModel.columnTypes;

  db : Sequelize;
  asuSchemas : Schemas;
  tableInfo : { [name : string] : AsuModel };
  associationModelInfo : { [name : string] : AsuModelI };

  constructor(sequelizeDb : Sequelize, asuSchemas : Schemas) {
    this.db = sequelizeDb;
    this.asuSchemas = asuSchemas;
    this.tableInfo = {};
    this.associationModelInfo = {};

    const { models = {}, associationModels = {} } = this.asuSchemas;

    Object.keys(associationModels).forEach(name => (this.associationModelInfo[name] = new AssociationModel(this, name, associationModels[name])));

    Object.keys(models).forEach(name => (this.tableInfo[name] = new AsuModel(this, name, models[name])));

    Object.keys(this.tableInfo).forEach(name => this.tableInfo[name].setupAssociations());
  }

  sync(force = true) {
    return this.db.sync({ force });
  }

  getAsuModel(name) : AsuModelI | undefined {
    return this.tableInfo[name];
  }

  getSqlzModel(name) : ModelDefined<Model, any> | undefined {
    const model = this.getAsuModel(name);
    return model && model.sqlzModel;
  }

  getAsuAssociationModel(name) : AsuModelI | undefined {
    return this.associationModelInfo[name];
  }

  getSqlzAssociationModel(name) : ModelDefined<Model, any> | undefined {
    const model = this.getAsuAssociationModel(name);
    return model && model.sqlzModel;
  }
}

Object.keys(AsuModel.columnTypes).forEach((name) => {
  AsuOrm[name] = AsuModel.columnTypes[name];
});
