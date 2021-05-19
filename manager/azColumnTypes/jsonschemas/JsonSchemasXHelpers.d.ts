import { IJsonSchema, IJsonSchemas, JsonModelAllAttributeType, JsonModelAttributeInOptionsForm } from './IJsonSchemas';
import { AmmSchema } from '../../../core';
import { RawSchemas, RawSchemaType, ParsedTableInfo, SchemasMetadata } from './interfaces';
export declare const getRealColumnName: (columnName: string, column: JsonModelAttributeInOptionsForm) => any;
export declare const getForeignKey: (column: JsonModelAttributeInOptionsForm) => string | null;
export declare const getTargetKey: (column: JsonModelAttributeInOptionsForm) => string | null;
export declare function forEachSchema<ColumnType = JsonModelAllAttributeType>(tableType: RawSchemaType, models: {
    [s: string]: IJsonSchema;
}, modelCb: ((tableName: string, tableType: RawSchemaType, jsonSchema: IJsonSchema) => Error | void) | null, columnCb: ((tableName: string, tableType: RawSchemaType, jsonSchema: IJsonSchema, columnName: string, column: ColumnType) => Error | void) | null): Error | undefined;
export declare function beforeNormalizeRawSchemas(metadata: SchemasMetadata, schemas: IJsonSchemas, rawSchemas: RawSchemas): Error | void;
export declare function normalizeRawSchemas(parsedTables: {
    [s: string]: ParsedTableInfo;
}, tableType: RawSchemaType, models: {
    [s: string]: IJsonSchema;
}, schemas: IJsonSchemas, rawSchemas: RawSchemas): Error | void;
export declare function afterNormalizeRawSchemas(parsedTables: {
    [s: string]: ParsedTableInfo;
}, tableType: RawSchemaType, models: {
    [s: string]: IJsonSchema;
}, metadata: SchemasMetadata, schemas: IJsonSchemas): Error | void;
export declare function parseRawSchemas(schemasMetadata: SchemasMetadata, rawSchemas: IJsonSchemas, tableType: RawSchemaType, models: {
    [s: string]: IJsonSchema;
}): Error | void;
export declare function afterParseRawSchemas(parsedTables: {
    [s: string]: ParsedTableInfo;
}, tableType: RawSchemaType, models: {
    [s: string]: IJsonSchema;
}, metadata: SchemasMetadata, schemas: IJsonSchemas): Error | void;
export declare function toCoreModels(schemasMetadata: SchemasMetadata, rawSchemas: IJsonSchemas, tableType: RawSchemaType, models: {
    [s: string]: IJsonSchema;
}, resultModels: {
    [s: string]: AmmSchema;
}): (Error | void);
