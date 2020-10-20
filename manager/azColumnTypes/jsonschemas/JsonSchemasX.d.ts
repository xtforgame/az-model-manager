import { Model, ModelOptions, ModelAttributeColumnOptions } from 'sequelize';
import { Table, Column, Index, Db } from 'pg-structure';
import { IJsonSchema, IJsonSchemas, JsonModelAttribute } from './IJsonSchemas';
import { AmmSchema, AmmSchemas, Overwrite } from '../../../core';
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
};
export declare type RawSchemaType = 'model' | 'associationModel';
export declare type ParsedTableInfo = {
    primaryKey?: string;
};
export declare type SchemasMetadata = {
    models: {
        [s: string]: ParsedTableInfo;
    };
    associationModels: {
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
export declare class JsonSchemasX {
    rawSchemas: RawSchemas;
    dbSchemaName: string;
    parsed: boolean;
    schemasMetadata: SchemasMetadata;
    schema: IJsonSchemas;
    constructor(dbSchemaName: string, rawSchemas: RawSchemas);
    clear(): void;
    static forEachSchema(tableType: RawSchemaType, models: {
        [s: string]: IJsonSchema;
    }, modelCb: ((tableName: string, tableType: RawSchemaType, jsonSchema: IJsonSchema) => Error | void) | null, columnCb: ((tableName: string, tableType: RawSchemaType, jsonSchema: IJsonSchema, columnName: string, column: JsonModelAttribute) => Error | void) | null): Error | undefined;
    static normalizeRawSchemas(parsedTables: {
        [s: string]: ParsedTableInfo;
    }, tableType: RawSchemaType, models: {
        [s: string]: IJsonSchema;
    }): Error | void;
    static parseRawSchemas(schemasMetadata: SchemasMetadata, rawSchemas: IJsonSchemas, tableType: RawSchemaType, models: {
        [s: string]: IJsonSchema;
    }): Error | void;
    static toCoreModels(schemasMetadata: SchemasMetadata, rawSchemas: IJsonSchemas, tableType: RawSchemaType, models: {
        [s: string]: IJsonSchema;
    }, resultModels: {
        [s: string]: AmmSchema;
    }): (Error | void);
    normalizeRawSchemas(): Error | void;
    parseRawSchemas(): Error | void;
    toCoreSchemas(): AmmSchemas | Error;
    parseSchemaFromDb(db: Db): void;
    parseTableFromDb(table: Table): void;
    reportColumn(column: Column): void;
    reportIndex(index: Index): void;
}
