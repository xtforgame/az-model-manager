/* eslint-disable no-param-reassign, no-underscore-dangle, no-multi-assign, no-unused-expressions */
import {
  Sequelize,
  Model,
  ModelDefined,
  ModelAttributes,
  ModelOptions,
} from 'sequelize';
import { AssociationColumn } from './columnTypes';

export interface AmmOrmI {
  db : Sequelize;
  getAmmModel(modelName : string) : AmmModelI | undefined;
  getAmmAssociationModel(modelName : string) : AmmModelI | undefined;
  getSqlzModel(modelName : string) : ModelDefined<Model, any> | undefined;
  getSqlzAssociationModel(modelName : string) : ModelDefined<Model, any> | undefined;
}

export interface AmmModelI {
  sqlzModel: ModelDefined<Model, any>;
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
