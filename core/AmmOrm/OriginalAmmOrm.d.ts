import { Sequelize } from 'sequelize';
import { AmmModelI, AmmSchemas } from '../interfaces';
import AmmModel from '../AmmModel';
import { ExtendedModelDefined as EMD } from '../utils';
declare type ExtendedModelDefined<X, S = any, T = any> = EMD<X, S, T> & {
    orm: OriginalAmmOrm;
};
export default class OriginalAmmOrm {
    static ThroughValues: symbol;
    static columnTypes: typeof import("../columnTypes");
    db: Sequelize;
    ammSchemas: AmmSchemas;
    tableInfo: {
        [name: string]: AmmModel;
    };
    associationModelInfo: {
        [name: string]: AmmModelI;
    };
    constructor(sequelizeDb: Sequelize, ammSchemas: AmmSchemas);
    sync(force?: boolean): Promise<Sequelize>;
    addSqlzModelMethod(sqlzModel: EMD<any, any>): void;
    getAmmModel<Extended = {}, S = any, T = any>(name: any): AmmModelI<Extended, S, T> | undefined;
    getSqlzModel<Extended = {}, S = any, T = any>(name: any): ExtendedModelDefined<Extended, S, T> | undefined;
    getAmmAssociationModel<Extended = {}, S = any, T = any>(name: any): AmmModelI<Extended> | undefined;
    getSqlzAssociationModel<Extended = {}, S = any, T = any>(name: any): ExtendedModelDefined<Extended, S, T> | undefined;
}
export {};
