export * from './IJsonSchemas';
import { Model, IndexesOptions } from 'sequelize';
import { JsonModelAttributeInOptionsForm, IJsonSchemasOptions, AmmModelAttributeColumnReferencesOptions } from './IJsonSchemas';
import { Overwrite, ModelAttributeColumnOptions } from '../../../core';
import { ModelOptions } from '../../../core';
export interface RawModelAttributeColumnOptions<M extends Model = Model> {
    type: [string, ...any[]];
    ammReferences?: AmmModelAttributeColumnReferencesOptions;
}
export declare type RawModelAttributes<M extends Model = Model, TCreationAttributes = any, CEO = any> = {
    [name in keyof TCreationAttributes]: Overwrite<ModelAttributeColumnOptions<M, CEO>, RawModelAttributeColumnOptions<M>>;
};
export declare type RawSchema<M extends Model = Model, TCreationAttributes = any, CEO = any> = {
    columns: RawModelAttributes<M, TCreationAttributes, CEO>;
    options?: ModelOptions;
};
export declare type RawSchemas<M extends Model = Model, TCreationAttributes = any, CEO = any> = {
    models: {
        [s: string]: RawSchema<M, TCreationAttributes, CEO>;
    };
    associationModels?: {
        [s: string]: RawSchema<M, TCreationAttributes, CEO>;
    };
    options?: IJsonSchemasOptions;
};
export declare type RawSchemaType = 'model' | 'associationModel';
export declare type ParsedColumnInfo = JsonModelAttributeInOptionsForm & {
    columnNameInDb?: string;
    isForeignKey?: boolean;
    isAssociationColumn?: boolean;
};
export declare type ParsedIndexInfo = IndexesOptions & {
    columns: string[];
};
export declare type ParsedTableInfo = {
    tableNameInDb?: string;
    isAssociationModel: boolean;
    primaryKey?: string;
    modelOptions: ModelOptions;
    columns: {
        [s: string]: ParsedColumnInfo;
    };
    indexes: {
        [s: string]: ParsedIndexInfo;
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
export declare type NormalizeJsonFuncArgs<M extends Model = Model, TCreationAttributes = any, CEO = any> = {
    table: RawSchema<M, TCreationAttributes, CEO>;
    tableType: RawSchemaType;
    tableName: string;
    column: any;
    columnName: string;
};
export declare type ParseJsonFuncArgs<M extends Model = Model, TCreationAttributes = any, CEO = any> = NormalizeJsonFuncArgs<M, TCreationAttributes, CEO> & {
    schemasMetadata: SchemasMetadata;
    schemas: RawSchemas<M, TCreationAttributes, CEO>;
};
