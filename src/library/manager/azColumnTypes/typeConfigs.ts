import sequelize, {
  AbstractDataTypeConstructor,
  AssociationOptions,
  Model,
  ModelAttributeColumnOptions,
} from 'sequelize';

import {
  AssociationType,
  HAS_ONE,
  HasOneOptions,
  HAS_MANY,
  HasManyOptions,
  BELONGS_TO,
  BelongsToOptions,
  BELONGS_TO_MANY,
  BelongsToManyOptions,
} from '../../core/columnTypes';

import {
  SchemaFuncArgs,
} from './interfaces';

// =========================================
export type TypeConfig = {
  sequleizeDataType?: AbstractDataTypeConstructor,
  associationType?: AssociationType,
  parseColumnSchema(args : SchemaFuncArgs) : Error | ModelAttributeColumnOptions<Model>;
};

export type TypeConfigs = {
  [s: string]: TypeConfig;
};

export const parseAssociationOptions : (a : SchemaFuncArgs) => AssociationOptions | Error = (args : SchemaFuncArgs) => {
  const targetTable = args.parsedInfo.tables[args.column.type[1]];
  if (!targetTable) {
    return new Error(`target table(${args.column.type[1]}) not found < 3`);
  }
  if (args.column.type.length < 3) {
    return new Error('type.length < 3');
  }
  const options = args.column.type[2];

  const result : AssociationOptions = {};
  if (!options) {
    return new Error('wrong association options');
  }

  // if (options.as != null) { // ignored, will be releaced by orm
  // }

  // if (options.constraints != null) { // ignored
  // }

  if (options.foreignKey) {
    if (typeof options.foreignKey !== 'string') {
      return new Error(`wrong association options: foreignKey(${options.foreignKey})`);
    }
    result.foreignKey = options.foreignKey;
  }

  // if (options.foreignKeyConstraint != null) { // ignored
  // }

  // if (options.hooks != null) { // ignored
  // }

  if (options.onDelete) {
    if (options.onDelete !== 'SET NULL' && options.onDelete !== 'CASCADE') {
      return new Error(`wrong association options: onDelete(${options.onDelete})`);
    }
    result.onDelete = options.onDelete;
  } else {
    result.onDelete = 'CASCADE';
  }
  if (options.onUpdate) {
    if (options.onUpdate !== 'CASCADE') {
      return new Error(`wrong association options: onUpdate(${options.onUpdate})`);
    }
    result.onUpdate = options.onUpdate;
  } else {
    result.onUpdate = 'CASCADE';
  }

  // if (result.scope != null) { currently not supported
  // }
  return result;
};

export const typeConfigs : TypeConfigs = {
  hasOne: {
    associationType: 'hasOne',
    parseColumnSchema: (args : SchemaFuncArgs) => {
      const associationOptions : HasOneOptions | Error = parseAssociationOptions(args);
      if (associationOptions instanceof Error) {
        return associationOptions;
      }
      const options = args.column.type[2];
      if (options.sourceKey) {
        associationOptions.sourceKey = options.sourceKey;
      } else {
        const primaryKey = args.parsedInfo.tables[args.tableName].primaryKey;
        if (!primaryKey || !args.table.columns[primaryKey]) {
          return new Error('no primaryKey or sourceKey provided');
        }
        associationOptions.sourceKey = args.parsedInfo.tables[args.tableName].primaryKey;
      }
      return {
        type: HAS_ONE(args.column.type, associationOptions),
        ...args.column,
      };
    },
  },
  hasMany: {
    associationType: 'hasMany',
    parseColumnSchema: (args : SchemaFuncArgs) => {
      const associationOptions : HasManyOptions | Error = parseAssociationOptions(args);
      if (associationOptions instanceof Error) {
        return associationOptions;
      }
      const options = args.column.type[2];
      if (options.sourceKey) {
        associationOptions.sourceKey = options.sourceKey;
      } else {
        const primaryKey = args.parsedInfo.tables[args.tableName].primaryKey;
        if (!primaryKey || !args.table.columns[primaryKey]) {
          return new Error('no primaryKey or sourceKey provided');
        }
        associationOptions.sourceKey = args.parsedInfo.tables[args.tableName].primaryKey;
      }
      return {
        type: HAS_MANY(args.column.type, associationOptions),
        ...args.column,
      };
    },
  },
  belongsTo: {
    associationType: 'belongsTo',
    parseColumnSchema: (args : SchemaFuncArgs) => {
      const associationOptions : BelongsToOptions | Error = parseAssociationOptions(args);
      if (associationOptions instanceof Error) {
        return associationOptions;
      }
      const options = args.column.type[2];
      if (options.targetKey) {
        associationOptions.targetKey = options.targetKey;
      } else {
        const targetTable = args.parsedInfo.tables[args.column.type[1]];
        const primaryKey = targetTable && targetTable.primaryKey;
        if (!primaryKey || !args.table.columns[primaryKey]) {
          return new Error('no primaryKey or targetKey provided');
        }
        associationOptions.targetKey = targetTable.primaryKey;
      }
      return {
        type: BELONGS_TO(args.column.type, associationOptions),
        ...args.column,
      };
    },
  },
  belongsToMany: {
    associationType: 'belongsToMany',
    parseColumnSchema: (args : SchemaFuncArgs) => {
      const associationOptions : BelongsToManyOptions | Error = <any>parseAssociationOptions(args);
      if (associationOptions instanceof Error) {
        return associationOptions;
      }
      const options = args.column.type[2];
      if (!options.through) {
        return new Error('no through provided');
      }
      associationOptions.through = options.through;
      let throughTableName = '';
      if (typeof associationOptions.through !== 'string') {
        throughTableName = associationOptions.through.ammModelName;
      } else {
        associationOptions.through = { ammModelName: associationOptions.through };
        throughTableName = associationOptions.through.ammModelName;
      }
      if (!args.schemas.associationModels || !args.schemas.associationModels[throughTableName]) {
        return new Error(`associationModels not found(${throughTableName})`);
      }
      const ammThroughAs = associationOptions.through.ammThroughAs;
      if (ammThroughAs && args.table.columns[ammThroughAs]) {
        return new Error(`ammThroughAs name already taken(${ammThroughAs})`);
      }
      return {
        type: BELONGS_TO_MANY(args.column.type, associationOptions),
        ...args.column,
      };
    },
  },

  integer: { // AzModelTypeInteger
    sequleizeDataType: sequelize.INTEGER,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  bigint: { // AzModelTypeBigint
    sequleizeDataType: sequelize.BIGINT,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  decimal: { // AzModelTypeDecimal
    sequleizeDataType: sequelize.DECIMAL,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  real: { // AzModelTypeReal
    sequleizeDataType: sequelize.REAL,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  float: { // AzModelTypeFloat
    sequleizeDataType: sequelize.FLOAT,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  double: { // AzModelTypeDouble
    sequleizeDataType: sequelize.DOUBLE,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  boolean: { // AzModelTypeBoolean
    sequleizeDataType: sequelize.BOOLEAN,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  string: { // AzModelTypeString
    sequleizeDataType: sequelize.STRING,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  binary: { // AzModelTypeBinary
    sequleizeDataType: sequelize.BLOB,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  text: { // AzModelTypeText
    sequleizeDataType: sequelize.TEXT,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  date: { // AzModelTypeDate
    sequleizeDataType: sequelize.DATE,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  dateonly: { // AzModelTypeDateOnly
    sequleizeDataType: sequelize.DATEONLY,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  uuid: { // AzModelTypeUuid
    sequleizeDataType: sequelize.UUID,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  range: { // AzModelTypeRange
    sequleizeDataType: sequelize.RANGE,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  json: { // AzModelTypeJson
    sequleizeDataType: sequelize.JSON,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  jsonb: { // AzModelTypeJsonb
    sequleizeDataType: sequelize.JSONB,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
};
