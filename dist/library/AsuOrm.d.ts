import { Sequelize, ModelDefined, Model } from 'sequelize';
import { AsuModelI, AmmSchemas } from './interfaces';
import AsuModel from './AsuModel';
export default class AsuOrm {
    static ThroughValues: symbol;
    static columnTypes: typeof import("./columnTypes");
    db: Sequelize;
    asuSchemas: Schemas;
    tableInfo: {
        [name: string]: AsuModel;
    };
    associationModelInfo: {
        [name: string]: AsuModelI;
    };
    constructor(sequelizeDb: Sequelize, asuSchemas: Schemas);
    sync(force?: boolean): Promise<Sequelize>;
    getAsuModel(name: any): AsuModelI | undefined;
    getSqlzModel(name: any): ModelDefined<Model, any> | undefined;
    getAsuAssociationModel(name: any): AsuModelI | undefined;
    getSqlzAssociationModel(name: any): ModelDefined<Model, any> | undefined;
}
