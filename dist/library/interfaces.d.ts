import { Sequelize, Model, ModelDefined, ModelAttributes, ModelOptions } from 'sequelize';
import { AssociationColumn } from './columnTypes';
export interface AsuOrmI {
    db: Sequelize;
    getAsuModel(modelName: string): AsuModelI | undefined;
    getAsuAssociationModel(modelName: string): AsuModelI | undefined;
    getSqlzModel(modelName: string): ModelDefined<Model, any> | undefined;
    getSqlzAssociationModel(modelName: string): ModelDefined<Model, any> | undefined;
}
export interface AsuModelI {
    sqlzModel: ModelDefined<Model, any>;
    associations: {
        [s: string]: AssociationColumn;
    };
}
export declare type Schema = {
    columns: ModelAttributes;
    options: ModelOptions;
};
export declare type Schemas = {
    models: {
        [s: string]: Schema;
    };
    associationModels: {
        [s: string]: Schema;
    };
};
