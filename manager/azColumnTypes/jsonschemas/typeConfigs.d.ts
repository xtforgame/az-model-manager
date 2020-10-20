import { AbstractDataTypeConstructor, AssociationOptions, Model, ModelAttributeColumnOptions, DataType } from 'sequelize';
import { AssociationType } from '../../../core/columnTypes';
import { JsonModelAttribute } from './IJsonSchemas';
import { NormalizeJsonFuncArgs, ParseJsonFuncArgs } from './interfaces';
export declare type TypeConfig = {
    sequleizeDataType?: AbstractDataTypeConstructor;
    associationType?: AssociationType;
    normalize(args: NormalizeJsonFuncArgs): Error | void;
    parse(args: ParseJsonFuncArgs): Error | JsonModelAttribute;
    toCoreColumn(args: ParseJsonFuncArgs): Error | ModelAttributeColumnOptions<Model>;
};
export declare type TypeConfigs = {
    [s: string]: TypeConfig;
};
export declare const basicParse: (extraNumber?: number) => (args: ParseJsonFuncArgs) => Error | JsonModelAttribute;
export declare const basicToCoreColumn: (dataType: DataType, extraNumber?: number) => (args: ParseJsonFuncArgs) => Error | ModelAttributeColumnOptions<Model>;
export declare const parseAssociationOptions: (a: ParseJsonFuncArgs) => AssociationOptions | Error;
export declare let typeConfigs: TypeConfigs;
