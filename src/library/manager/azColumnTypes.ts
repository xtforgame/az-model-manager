import {
  AssociationColumn,
  AssociationColumnOption,

  AssociationTypeHasOne,
  AssociationTypeHasMany,
  AssociationTypeBelongsTo,
  AssociationTypeBelongsToMany,

  HasOneOptions,
  HasManyOptions,
  BelongsToOptions,
  BelongsToManyOptions,

  AssociationColumnExtraOption,
} from '../core/columnTypes';

// ======== Associations ========

export type AzModelAttributeHasOne = [
  AssociationTypeHasOne,
  string,
  HasOneOptions,
  AssociationColumnExtraOption?,
];

export type AzModelAttributeHasMany = [
  AssociationTypeHasMany,
  string,
  HasManyOptions,
  AssociationColumnExtraOption?,
];

export type AzModelAttributeBelongsTo = [
  AssociationTypeBelongsTo,
  string,
  BelongsToOptions,
  AssociationColumnExtraOption?,
];

export type AzModelAttributeBelongsToMany = [
  AssociationTypeBelongsToMany,
  string,
  BelongsToManyOptions,
  AssociationColumnExtraOption?,
];

// ======== Numbers ========

export type AzModelTypeInteger = 'integer';
export type AzModelAttributeInteger = AzModelTypeInteger | [ // sequelize.INTEGER
  AzModelTypeInteger,
];

export type AzModelTypeBigint = 'bigint';
export type AzModelAttributeBigint = AzModelTypeBigint | [ // sequelize.BIGINT
  AzModelTypeBigint,
];

export type AzModelTypeDecimal = 'decimal';
export type AzModelAttributeDecimal = AzModelTypeDecimal | [ // sequelize.DECIMAL
  AzModelTypeDecimal,
  number?,
  number?,
];

export type AzModelTypeReal = 'real';
export type AzModelAttributeReal = AzModelTypeReal | [ // sequelize.REAL
  AzModelTypeReal,
];

export type AzModelTypeFloat = 'float';
export type AzModelAttributeFloat = AzModelTypeFloat | [ // sequelize.FLOAT
  AzModelTypeFloat,
];

export type AzModelTypeDouble = 'double';
export type AzModelAttributeDouble = AzModelTypeDouble | [ // sequelize.DOUBLE
  AzModelTypeDouble,
];

export type AzModelTypeBoolean = 'boolean';
export type AzModelAttributeBoolean = AzModelTypeBoolean | [ // sequelize.BOOLEAN
  AzModelTypeBoolean,
];

// ======== Strings ========

export type AzModelTypeString = 'string';
export type AzModelAttributeString = AzModelTypeString | [ // sequelize.STRING
  AzModelTypeString,
  number,
];

export type AzModelTypeBinary = 'binary';
export type AzModelAttributeBinary = AzModelTypeBinary | [ // sequelize.STRING(0, true), sequelize.BLOB
  AzModelTypeBinary,
];

export type AzModelTypeText = 'text';
export type AzModelAttributeText = AzModelTypeText | [ // sequelize.TEXT
  AzModelTypeText,
];

// ======== Dates ========

export type AzModelTypeDate = 'date';
export type AzModelAttributeDate = AzModelTypeDate | [ // sequelize.DATE
  AzModelTypeDate,
];

export type AzModelTypeDateOnly = 'dateonly';
export type AzModelAttributeDateOnly = AzModelTypeDateOnly | [ // sequelize.DATEONLY
  AzModelTypeDateOnly,
];

// ======== Uuids ========

export type AzModelTypeUuid = 'uuid';
export type AzModelAttributeUuid = AzModelTypeUuid | [ // sequelize.UUID
  AzModelTypeUuid,
];

// ======== Ranges ========
export type AzModelTypeRange = 'range';
export type AzModelAttributeRange = [ // sequelize.RANGE
  AzModelTypeRange,
  AzModelTypeInteger | AzModelTypeBigint | AzModelTypeDecimal | AzModelTypeDate | AzModelTypeDateOnly,
];

// ======== JSONs ========
export type AzModelTypeJson = 'json';
export type AzModelAttributeJson = AzModelTypeJson | [ // sequelize.JSON
  AzModelTypeJson,
];

export type AzModelTypeJsonb = 'jsonb';
export type AzModelAttributeJsonb = AzModelTypeJsonb | [ // sequelize.JSONB
  AzModelTypeJsonb,
];

export type AzModelAttributeColumn =
  AzModelAttributeHasOne
  | AzModelAttributeHasMany
  | AzModelAttributeBelongsTo
  | AzModelAttributeBelongsToMany

  | AzModelAttributeInteger
  | AzModelAttributeDecimal
  | AzModelAttributeReal
  | AzModelAttributeFloat
  | AzModelAttributeDouble
  | AzModelAttributeBigint
  | AzModelAttributeBoolean

  | AzModelAttributeString
  | AzModelAttributeBinary
  | AzModelAttributeText

  | AzModelTypeDate
  | AzModelTypeDateOnly

  | AzModelAttributeRange

  | AzModelTypeJson
  | AzModelTypeJsonb
;
