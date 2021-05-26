/* eslint-disable no-param-reassign, import/no-named-as-default-member */
import { Sequelize, ModelCtor, Model } from 'sequelize';
import { AmmOrmI, AmmModelI, AmmSchemas } from '../interfaces';
import AmmModel from '../AmmModel';
import AssociationModel from '../AssociationModel';
import { ExtendedModelDefined as EMD } from '../utils';

type ExtendedModelDefined<X, S = any, T = any> = EMD<X, S, T> & { orm: OriginalAmmOrm };

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

    const { models = {}, associationModels = {}, options = {} } = this.ammSchemas;

    Object.keys(associationModels).forEach(name => (this.associationModelInfo[name] = new AssociationModel(this, name, associationModels[name], options.associationModel?.tablePrefix)));

    Object.keys(models).forEach(name => (this.tableInfo[name] = new AmmModel(this, name, models[name], options.model?.tablePrefix)));

    Object.keys(this.tableInfo).forEach(name => this.tableInfo[name].setupAssociations());
    Object.keys(this.associationModelInfo).forEach(name => (<any>this.associationModelInfo[name]).setupAssociations());
  }

  sync(force = true) {
    return this.db.sync({ force });
  }

  addSqlzModelMethod(sqlzModel : EMD<any, any>) {
  }

  getAmmModel<Extended = {}, S = any, T = any>(name) : AmmModelI<Extended, S, T> | undefined {
    return <any>this.tableInfo[name];
  }

  getSqlzModel<Extended = {}, S = any, T = any>(name) : ExtendedModelDefined<Extended, S, T> | undefined {
    const model = this.getAmmModel<Extended, S, T>(name);
    return model && <any>model.sqlzModel;
  }

  getAmmAssociationModel<Extended = {}, S = any, T = any>(name) : AmmModelI<Extended> | undefined {
    return <any>this.associationModelInfo[name];
  }

  getSqlzAssociationModel<Extended = {}, S = any, T = any>(name) : ExtendedModelDefined<Extended, S, T> | undefined {
    const model = this.getAmmAssociationModel<Extended, S, T>(name);
    return model && <any>model.sqlzModel;
  }
}

Object.keys(AmmModel.columnTypes).forEach((name) => {
  OriginalAmmOrm[name] = AmmModel.columnTypes[name];
});
