import sequelize, { Model, ModelDefined, ModelAttributes, ModelOptions, ModelNameOptions, Sequelize } from 'sequelize';
import * as columnTypes from './columnTypes';
import { AsuOrmI } from './interfaces';
export declare const ThroughValues: unique symbol;
export default class AmmModel {
    static columnTypes: typeof columnTypes;
    static ThroughValues: symbol;
    asuOrm: AsuOrmI;
    db: Sequelize;
    tableDefine: any;
    tablePrefix: string;
    sqlzModel: ModelDefined<Model, any>;
    sqlzOptions: ModelOptions;
    modelName: string;
    columns: ModelAttributes;
    name: ModelNameOptions;
    tableName: string;
    associations: {
        [s: string]: columnTypes.AssociationColumn;
    };
    constructor(asuOrm: AsuOrmI, modelName: string, tableDefine: any, tablePrefix?: string);
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
