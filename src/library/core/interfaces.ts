/* eslint-disable no-param-reassign, no-underscore-dangle, no-multi-assign, no-unused-expressions */
import {
  Sequelize,
  Model,
  ModelDefined,

} from 'sequelize';
import { AssociationColumn } from './columnTypes';
import {
  ExtendedModelDefined,
  ModelAttributes,
  ModelOptions,
} from './utils';

export type AmmOrmI<Extended = {}> = {
  db : Sequelize;
  ammSchemas : AmmSchemas;
  addSqlzModelMethod: (sqlzModel : ModelDefined<any, any>) => void
  getAmmModel(modelName : string) : AmmModelI | undefined;
  getAmmAssociationModel(modelName : string) : AmmModelI | undefined;
  getSqlzModel(modelName : string) : ExtendedModelDefined<Extended, any, any> | undefined;
  getSqlzAssociationModel(modelName : string) : ExtendedModelDefined<Extended, any, any> | undefined;
}

export interface AmmModelI<Extended = {}, S = any, T = any> {
  sqlzModel: ExtendedModelDefined<Extended, S, T>;
  associations : { [s: string]: AssociationColumn; };
}

export type AmmSchema = {
  columns: ModelAttributes;
  options?: ModelOptions;
};

export type AmmSchemas = {
  models: { [s: string]: AmmSchema; };
  associationModels?: { [s: string]: AmmSchema; };
};
