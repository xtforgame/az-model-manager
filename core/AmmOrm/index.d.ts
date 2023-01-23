import { Sequelize, IncludeOptions } from 'sequelize';
import { AmmModelI, AmmSchemas } from '../interfaces';
import { Overwrite, ExtendedModelDefined as EMD } from '../utils';
import OriginalAmmOrm from './OriginalAmmOrm';
export declare type AssociationModelNameAsStringToInclude = string;
export declare type AssociationModelNameAsDataToInclude = Overwrite<IncludeOptions, {
    as: string;
}>;
export declare type AssociationModelNameAsToInclude = AssociationModelNameAsStringToInclude | AssociationModelNameAsDataToInclude;
declare type ExtendedModelDefined<X, S = any, T = any> = EMD<X, S, T> & {
    orm: OriginalAmmOrm;
    ammInclude: (associationModelNameAsArray: AssociationModelNameAsToInclude[]) => IncludeOptions[];
};
export default class AmmOrm extends OriginalAmmOrm {
    constructor(sequelizeDb: Sequelize, ammSchemas: AmmSchemas);
    addSqlzModelMethod(sqlzModel: EMD<any, any>): void;
    getAmmModel<Extended = {}, S = any, T = any>(name: any): AmmModelI<Extended & {
        _orm: AmmOrm;
    }, S, T> | undefined;
    getSqlzModel<Extended = {}, S = any, T = any>(name: any): ExtendedModelDefined<Extended & {
        _orm: AmmOrm;
    }, S, T> | undefined;
    getAmmAssociationModel<Extended = {}, S = any, T = any>(name: any): AmmModelI<Extended> | undefined;
    getSqlzAssociationModel<Extended = {}, S = any, T = any>(name: any): ExtendedModelDefined<Extended & {
        _orm: AmmOrm;
    }, S, T> | undefined;
    isAssociation: (baseModelName: string, associationModelNameAs: string) => boolean;
    getAssociationIncludeData: (baseModelName: string, associationModelNameAs: string) => {
        targetModelName: string | import("sequelize").ModelDefined<import("sequelize").Model<any, any>, any>;
        model: ExtendedModelDefined<{
            _orm: AmmOrm;
        }, any, any> | undefined;
        as: string;
        include: never[];
    } | null;
    getAssociationIncludeMap: (baseModelName: string, associationModelNameAsArray?: AssociationModelNameAsToInclude[]) => {};
    associationIncludeMapToArray: (includeMap: any) => any[];
    getAssociationIncludes: (baseModelName: string, associationModelNameAsArray?: AssociationModelNameAsToInclude[]) => any[];
}
export {};
