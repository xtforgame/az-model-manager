import { Model, ModelOptions, ModelAttributeColumnOptions } from 'sequelize';
import { AssociationTypeHasOne, AssociationTypeHasMany, AssociationTypeBelongsTo, AssociationTypeBelongsToMany, HasOneOptions, HasManyOptions, BelongsToOptions, BelongsToManyOptions, AssociationColumnExtraOption } from '../../../core/columnTypes';
import { Overwrite } from '../../../core';
export declare type JsonModelAttributeHasOne = [AssociationTypeHasOne, string, HasOneOptions, AssociationColumnExtraOption?];
export declare type JsonModelAttributeHasMany = [AssociationTypeHasMany, string, HasManyOptions, AssociationColumnExtraOption?];
export declare type JsonModelAttributeBelongsTo = [AssociationTypeBelongsTo, string, BelongsToOptions, AssociationColumnExtraOption?];
export declare type JsonModelAttributeBelongsToMany = [AssociationTypeBelongsToMany, string, BelongsToManyOptions, AssociationColumnExtraOption?];
export declare type JsonModelTypeInteger = 'integer';
export declare type JsonModelAttributeInteger = JsonModelTypeInteger | [JsonModelTypeInteger];
export declare type JsonModelTypeBigint = 'bigint';
export declare type JsonModelAttributeBigint = JsonModelTypeBigint | [JsonModelTypeBigint];
export declare type JsonModelTypeDecimal = 'decimal';
export declare type JsonModelAttributeDecimal = JsonModelTypeDecimal | [JsonModelTypeDecimal, number?, number?];
export declare type JsonModelTypeReal = 'real';
export declare type JsonModelAttributeReal = JsonModelTypeReal | [JsonModelTypeReal];
export declare type JsonModelTypeFloat = 'float';
export declare type JsonModelAttributeFloat = JsonModelTypeFloat | [JsonModelTypeFloat];
export declare type JsonModelTypeDouble = 'double';
export declare type JsonModelAttributeDouble = JsonModelTypeDouble | [JsonModelTypeDouble];
export declare type JsonModelTypeBoolean = 'boolean';
export declare type JsonModelAttributeBoolean = JsonModelTypeBoolean | [JsonModelTypeBoolean];
export declare type JsonModelTypeString = 'string';
export declare type JsonModelAttributeString = JsonModelTypeString | [JsonModelTypeString, number];
export declare type JsonModelTypeBinary = 'binary';
export declare type JsonModelAttributeBinary = JsonModelTypeBinary | [JsonModelTypeBinary];
export declare type JsonModelTypeText = 'text';
export declare type JsonModelAttributeText = JsonModelTypeText | [JsonModelTypeText];
export declare type JsonModelTypeDate = 'date';
export declare type JsonModelAttributeDate = JsonModelTypeDate | [JsonModelTypeDate];
export declare type JsonModelTypeDateOnly = 'dateonly';
export declare type JsonModelAttributeDateOnly = JsonModelTypeDateOnly | [JsonModelTypeDateOnly];
export declare type JsonModelTypeUuid = 'uuid';
export declare type JsonModelAttributeUuid = JsonModelTypeUuid | [JsonModelTypeUuid];
export declare type JsonModelTypeRange = 'range';
export declare type JsonModelAttributeRange = [JsonModelTypeRange, JsonModelTypeInteger | JsonModelTypeBigint | JsonModelTypeDecimal | JsonModelTypeDate | JsonModelTypeDateOnly];
export declare type JsonModelTypeJson = 'json';
export declare type JsonModelAttributeJson = JsonModelTypeJson | [JsonModelTypeJson];
export declare type JsonModelTypeJsonb = 'jsonb';
export declare type JsonModelAttributeJsonb = JsonModelTypeJsonb | [JsonModelTypeJsonb];
export declare type JsonModelAttributeColumn = JsonModelAttributeHasOne | JsonModelAttributeHasMany | JsonModelAttributeBelongsTo | JsonModelAttributeBelongsToMany | JsonModelAttributeInteger | JsonModelAttributeDecimal | JsonModelAttributeReal | JsonModelAttributeFloat | JsonModelAttributeDouble | JsonModelAttributeBigint | JsonModelAttributeBoolean | JsonModelAttributeString | JsonModelAttributeBinary | JsonModelAttributeText | JsonModelTypeDate | JsonModelTypeDateOnly | JsonModelAttributeUuid | JsonModelAttributeRange | JsonModelTypeJson | JsonModelTypeJsonb;
export interface JsonModelAttributeColumnOptions<M extends Model = Model> {
    type: JsonModelAttributeColumn;
}
export declare type JsonModelAttribute<M extends Model = Model, TCreationAttributes = any> = Overwrite<ModelAttributeColumnOptions<M>, JsonModelAttributeColumnOptions<M>>;
export declare type JsonModelAttributes<M extends Model = Model, TCreationAttributes = any> = {
    [name in keyof TCreationAttributes]: JsonModelAttribute<M, TCreationAttributes>;
};
export declare type IJsonSchema = {
    columns: JsonModelAttributes;
    options?: ModelOptions;
};
export declare type IJsonSchemas = {
    models: {
        [s: string]: IJsonSchema;
    };
    associationModels: {
        [s: string]: IJsonSchema;
    };
};
