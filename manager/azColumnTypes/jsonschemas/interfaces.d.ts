export * from './IJsonSchemas';
import { Model } from 'sequelize';
import { JsonModelAttributeInOptionsForm, IJsonSchemasOptions } from './IJsonSchemas';
import { Overwrite, ModelAttributeColumnOptions } from '../../../core';
import { ModelOptions } from '../../../core';
export interface RawModelAttributeColumnOptions<M extends Model = Model> {
    type: [string, ...any[]];
}
export declare type RawModelAttributes<M extends Model = Model, TCreationAttributes = any> = {
    [name in keyof TCreationAttributes]: Overwrite<ModelAttributeColumnOptions<M>, RawModelAttributeColumnOptions<M>>;
};
export declare type RawSchema = {
    columns: RawModelAttributes;
    options?: ModelOptions;
};
export declare type RawSchemas = {
    models: {
        [s: string]: RawSchema;
    };
    associationModels?: {
        [s: string]: RawSchema;
    };
    options?: IJsonSchemasOptions;
};
export declare type RawSchemaType = 'model' | 'associationModel';
export declare type ParsedColumnInfo = JsonModelAttributeInOptionsForm & {
    columnNameInDb?: string;
    isForeignKey?: boolean;
};
export declare type ParsedTableInfo = {
    tableNameInDb?: string;
    isAssociationModel: boolean;
    primaryKey?: string;
    modelOptions: ModelOptions;
    columns: {
        [s: string]: ParsedColumnInfo;
    };
};
export declare type SchemasMetadata = {
    models: {
        [s: string]: ParsedTableInfo;
    };
    associationModels: {
        [s: string]: ParsedTableInfo;
    };
    allModels: {
        [s: string]: ParsedTableInfo;
    };
};
export declare type NormalizeJsonFuncArgs = {
    table: RawSchema;
    tableType: RawSchemaType;
    tableName: string;
    column: any;
    columnName: string;
};
export declare type ParseJsonFuncArgs = NormalizeJsonFuncArgs & {
    schemasMetadata: SchemasMetadata;
    schemas: RawSchemas;
};
