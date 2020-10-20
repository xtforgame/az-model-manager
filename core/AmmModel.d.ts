import sequelize, { ModelDefined, ModelAttributes, ModelOptions, ModelNameOptions, Sequelize } from 'sequelize';
import * as columnTypes from './columnTypes';
import { AmmOrmI, AmmSchema } from './interfaces';
export declare const ThroughValues: unique symbol;
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
        sqlzOptions: sequelize.ModelOptions<sequelize.Model<any, any>>;
        associations: {};
    };
    setupAssociations(): void;
}
