import sequelize, { ModelDefined, ModelNameOptions, Sequelize } from 'sequelize';
import * as columnTypes from './columnTypes';
import { AmmOrmI, AmmSchema } from './interfaces';
import { ModelAttributes, ModelOptions } from './utils';
export declare const ThroughValues: unique symbol;
export declare const getNormalizedModelOptions: (modelName: string, options: ModelOptions) => any;
export default class AmmModel {
    static columnTypes: typeof columnTypes;
    static ThroughValues: symbol;
    ammOrm: AmmOrmI;
    db: Sequelize;
    tableDefine: AmmSchema;
    tablePrefix: string;
    sqlzModel: ModelDefined<any, any>;
    sqlzOptions: ModelOptions;
    modelName: string;
    columns: ModelAttributes;
    name: ModelNameOptions;
    tableName: string;
    associations: {
        [s: string]: columnTypes.AssociationColumn;
    };
    constructor(ammOrm: AmmOrmI, modelName: string, tableDefine: AmmSchema, tablePrefix?: string);
    get primaryKey(): string;
    separateNxNAssociations(instance: any): any;
    addModelMethods(): void;
    getNormalizedSettings(modelName: any): {
        columns: {};
        sqlzOptions: ModelOptions<sequelize.Model<any, any>>;
        associations: {};
    };
    setupAssociations(): void;
}
