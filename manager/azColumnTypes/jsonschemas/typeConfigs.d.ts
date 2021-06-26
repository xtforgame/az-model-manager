import { AbstractDataTypeConstructor, AssociationOptions, Model, DataType } from 'sequelize';
import { AssociationType } from '../../../core/columnTypes';
import { JsonModelAttributeInOptionsForm } from './IJsonSchemas';
import { NormalizeJsonFuncArgs, ParseJsonFuncArgs } from './interfaces';
import { ModelAttributeColumnOptions } from '../../../core/utils';
export declare type TypeConfig = {
    sequleizeDataType?: AbstractDataTypeConstructor;
    associationType?: AssociationType;
    normalize(args: NormalizeJsonFuncArgs): Error | void;
    parse(args: ParseJsonFuncArgs): Error | JsonModelAttributeInOptionsForm;
    toCoreColumn(args: ParseJsonFuncArgs): Error | ModelAttributeColumnOptions<Model>;
    getTsTypeExpression(column: JsonModelAttributeInOptionsForm): string;
    getTsTypeExpressionForCreation(column: JsonModelAttributeInOptionsForm): string;
    getAddColumnExpression(column: JsonModelAttributeInOptionsForm): string;
};
export declare type TypeConfigs = {
    [s: string]: TypeConfig;
};
export declare const basicParse: (extraNumber?: number, normalize?: (r: JsonModelAttributeInOptionsForm | void) => JsonModelAttributeInOptionsForm) => (args: ParseJsonFuncArgs) => Error | JsonModelAttributeInOptionsForm;
export declare const basicToCoreColumn: (dataType: DataType, extraNumber?: number) => (args: ParseJsonFuncArgs) => Error | ModelAttributeColumnOptions<Model>;
export declare const parseAssociationOptions: (a: ParseJsonFuncArgs) => AssociationOptions | Error;
export declare const basicGetTsTypeExpression: (tsType: string) => (column: JsonModelAttributeInOptionsForm) => string;
export declare const capitalize: (str: any) => any;
export declare const toInterfaceType: (str: any) => string;
export declare const toTypeForCreation: (str: any) => string;
export declare let typeConfigs: TypeConfigs;
