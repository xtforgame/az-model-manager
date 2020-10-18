import sequelize, {
  AbstractDataTypeConstructor,
  AssociationOptions,
  Model,
  ModelAttributeColumnOptions,
  DataType,
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

export const basicParse : (dataType : DataType, extraNumber? : number) => (args : SchemaFuncArgs) => Error | ModelAttributeColumnOptions<Model> = (dataType : DataType, extraNumber : number = 0) => (args : SchemaFuncArgs) => {
  const { type, ...rest } = args.column;
  if (!type.length) {
    return new Error('no type attribute');
  }
  if (type.length === 1) {
    return {
      ...rest,
      type: dataType,
    };
  } else if (type.length === 1 + extraNumber) {
    return {
      ...rest,
      type: (<any>dataType)(...type.slice(1)),
    };
  }
  return new Error(`wrong type length(${type.length})`);
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

export let typeConfigs : TypeConfigs;

typeConfigs = {
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
        ...args.column,
        type: HAS_ONE(args.column.type[1], associationOptions),
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
        ...args.column,
        type: HAS_MANY(args.column.type[1], associationOptions),
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
        ...args.column,
        type: BELONGS_TO(args.column.type[1], associationOptions),
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
      if (options.otherKey) {
        associationOptions.otherKey = options.otherKey;
      }
      associationOptions.onDelete = 'SET NULL';
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
        ...args.column,
        type: BELONGS_TO_MANY(args.column.type[1], associationOptions),
      };
    },
  },

  integer: { // JsonModelTypeInteger
    sequleizeDataType: sequelize.INTEGER,
    parseColumnSchema: basicParse(sequelize.INTEGER),
  },
  bigint: { // JsonModelTypeBigint
    sequleizeDataType: sequelize.BIGINT,
    parseColumnSchema: basicParse(sequelize.BIGINT),
  },
  decimal: { // JsonModelTypeDecimal
    sequleizeDataType: sequelize.DECIMAL,
    parseColumnSchema: basicParse(sequelize.DECIMAL, 2),
  },
  real: { // JsonModelTypeReal
    sequleizeDataType: sequelize.REAL,
    parseColumnSchema: basicParse(sequelize.REAL),
  },
  float: { // JsonModelTypeFloat
    sequleizeDataType: sequelize.FLOAT,
    parseColumnSchema: basicParse(sequelize.FLOAT),
  },
  double: { // JsonModelTypeDouble
    sequleizeDataType: sequelize.DOUBLE,
    parseColumnSchema: basicParse(sequelize.DOUBLE),
  },
  boolean: { // JsonModelTypeBoolean
    sequleizeDataType: sequelize.BOOLEAN,
    parseColumnSchema: basicParse(sequelize.BOOLEAN),
  },
  string: { // JsonModelTypeString
    sequleizeDataType: sequelize.STRING,
    parseColumnSchema: basicParse(sequelize.STRING, 1),
  },
  binary: { // JsonModelTypeBinary
    sequleizeDataType: sequelize.BLOB,
    parseColumnSchema: basicParse(sequelize.BLOB),
  },
  text: { // JsonModelTypeText
    sequleizeDataType: sequelize.TEXT,
    parseColumnSchema: basicParse(sequelize.TEXT),
  },
  date: { // JsonModelTypeDate
    sequleizeDataType: sequelize.DATE,
    parseColumnSchema: basicParse(sequelize.DATE),
  },
  dateonly: { // JsonModelTypeDateOnly
    sequleizeDataType: sequelize.DATEONLY,
    parseColumnSchema: basicParse(sequelize.DATEONLY),
  },
  uuid: { // JsonModelTypeUuid
    sequleizeDataType: sequelize.UUID,
    parseColumnSchema: basicParse(sequelize.UUID),
  },
  range: { // JsonModelTypeRange
    sequleizeDataType: sequelize.RANGE,
    parseColumnSchema: (args : SchemaFuncArgs) => {
      const { type, ...rest } = args.column;
      if (type.length !== 2) {
        return new Error('type.length !== 2');
      }
      const rangeTypes : { [s : string] : AbstractDataTypeConstructor } = {
        integer: sequelize.INTEGER,
        bigint: sequelize.BIGINT,
        decimal: sequelize.DECIMAL,
        date: sequelize.DATE,
        dateonly: sequelize.DATEONLY,
      };
      if (!rangeTypes[type[1]]) {
        return new Error(`wrong range item type(${type[1]})`);
      }
      const itemColumn = typeConfigs[type[1]].parseColumnSchema({
        ...args,
        column: {
          ...args.column,
          type: args.column.type.slice(1),
        },
      });
      if (itemColumn instanceof Error) {
        return itemColumn;
      }
      return {
        ...args.column,
        type: sequelize.RANGE(<any>itemColumn.type),
      };
    },
  },
  json: { // JsonModelTypeJson
    sequleizeDataType: sequelize.JSON,
    parseColumnSchema: basicParse(sequelize.JSON),
  },
  jsonb: { // JsonModelTypeJsonb
    sequleizeDataType: sequelize.JSONB,
    parseColumnSchema: basicParse(sequelize.JSONB),
  },
};
