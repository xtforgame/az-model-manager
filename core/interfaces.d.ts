import { Sequelize, ModelDefined } from 'sequelize';
import { AssociationColumn } from './columnTypes';
import { ExtendedModelDefined, ModelAttributes, ModelOptions } from './utils';
export declare type AmmOrmI<Extended = {}> = {
    db: Sequelize;
    ammSchemas: AmmSchemas;
    addSqlzModelMethod: (sqlzModel: ModelDefined<any, any>) => void;
    getAmmModel(modelName: string): AmmModelI | undefined;
    getAmmAssociationModel(modelName: string): AmmModelI | undefined;
    getSqlzModel(modelName: string): ExtendedModelDefined<Extended, any, any> | undefined;
    getSqlzAssociationModel(modelName: string): ExtendedModelDefined<Extended, any, any> | undefined;
};
export interface AmmModelI<Extended = {}, S = any, T = any> {
    sqlzModel: ExtendedModelDefined<Extended, S, T>;
    associations: {
        [s: string]: AssociationColumn;
    };
}
export declare type AmmSchema = {
    columns: ModelAttributes;
    options?: ModelOptions;
};
export declare type AmmSchemasModelOptions = {
    tablePrefix?: string;
};
export declare type AmmSchemasOptions = {
    model?: AmmSchemasModelOptions;
    associationModel?: AmmSchemasModelOptions;
};
export declare type AmmSchemas = {
    models: {
        [s: string]: AmmSchema;
    };
    associationModels?: {
        [s: string]: AmmSchema;
    };
    options?: AmmSchemasOptions;
};
