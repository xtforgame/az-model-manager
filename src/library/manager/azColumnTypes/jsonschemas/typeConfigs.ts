import sequelize, {
  AbstractDataTypeConstructor,
  AssociationOptions,
  Model,
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
} from '../../../core/columnTypes';

import {
  JsonModelAttributeInOptionsForm,
} from './IJsonSchemas';

import {
  NormalizeJsonFuncArgs,
  ParseJsonFuncArgs,
} from './interfaces';

import {
  ModelAttributeColumnOptions,
  toUnderscore,
} from '../../../core/utils';

let xid = 0;

// =========================================
export type TypeConfig = {
  sequleizeDataType?: AbstractDataTypeConstructor,
  associationType?: AssociationType,
  normalize(args : NormalizeJsonFuncArgs) : Error | void;
  parse(args : ParseJsonFuncArgs) : Error | JsonModelAttributeInOptionsForm;
  toCoreColumn(args : ParseJsonFuncArgs) : Error | ModelAttributeColumnOptions<Model>;
  getTsTypeExpression(column : JsonModelAttributeInOptionsForm) : string;
  getTsTypeExpressionForCreation(column : JsonModelAttributeInOptionsForm) : string;
};

export type TypeConfigs = {
  [s: string]: TypeConfig;
};

export const basicParse : (extraNumber? : number) => (args : ParseJsonFuncArgs) => Error | JsonModelAttributeInOptionsForm = (extraNumber : number = 0) => (args : ParseJsonFuncArgs) => {
  const { type, ...rest } = args.column;
  if (!type.length) {
    return new Error('no type attribute');
  }
  if (type.length === 1 || type.length === 1 + extraNumber) {
    return {
      ...rest,
      type,
    };
  }
  return new Error(`wrong type length(${type.length})`);
};

export const basicToCoreColumn : (dataType : DataType, extraNumber? : number) => (args : ParseJsonFuncArgs) => Error | ModelAttributeColumnOptions<Model> = (dataType : DataType, extraNumber : number = 0) => (args : ParseJsonFuncArgs) => {
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

export const parseAssociationOptions : (a : ParseJsonFuncArgs) => AssociationOptions | Error = (args : ParseJsonFuncArgs) => {
  const targetTableMetadata = args.schemasMetadata.models[args.column.type[1]];
  if (!targetTableMetadata) {
    return new Error(`target table(${args.column.type[1]}) not found`);
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

export const basicGetTsTypeExpression: (tsType : string) => (column : JsonModelAttributeInOptionsForm) => string = (tsType : string) => () => tsType;
export const capitalize = str => (str.charAt(0).toUpperCase() + str.slice(1));
export const toInterfaceType = str => `${capitalize(str)}I`;
export const toTypeForCreation = str => `${capitalize(str)}CreationAttributes`;

export let typeConfigs : TypeConfigs;

const getPrimaryKeyFromModel = (args : ParseJsonFuncArgs, tableName : string) : string => {
  const table = args.schemas.models[tableName];
  const tableMetadata = args.schemasMetadata.models[tableName];
  const primaryKey = tableMetadata && tableMetadata.primaryKey;
  if (!primaryKey || !table.columns[primaryKey]) {
    return '';
  }
  return primaryKey;
}

const normalizeForeignKey = (args : ParseJsonFuncArgs, tableName : string, associationOptions : HasOneOptions | HasManyOptions | BelongsToOptions) => {
  const options = args.column.type[2];
  if (options.foreignKey) {
    associationOptions.foreignKey = options.foreignKey;
  } else {
    const primaryKey = getPrimaryKeyFromModel(args, tableName);
    if (!primaryKey) {
      return new Error('no primaryKey or foreignKey provided');
    }
    associationOptions.foreignKey = toUnderscore(`${tableName}_${primaryKey}`);
    options.foreignKey = associationOptions.foreignKey;
  }
}

const normalizeSourceKey = (args : ParseJsonFuncArgs, associationOptions : HasOneOptions | HasManyOptions | BelongsToManyOptions) => {
  const tableName = args.tableName;
  const options = args.column.type[2];
  if (options.sourceKey) {
    associationOptions.sourceKey = options.sourceKey;
  } else {
    const primaryKey = getPrimaryKeyFromModel(args, tableName);
    if (!primaryKey) {
      return new Error('no primaryKey or sourceKey provided');
    }
    associationOptions.sourceKey = toUnderscore(primaryKey);
    options.sourceKey = associationOptions.sourceKey;
  }
}

const normalizeTargetKey = (args : ParseJsonFuncArgs, associationOptions : BelongsToOptions) => {
  const tableName = args.column.type[1];
  const options = args.column.type[2];
  if (options.targetKey) {
    associationOptions.targetKey = options.targetKey;
  } else {
    const primaryKey = getPrimaryKeyFromModel(args, tableName);
    if (!primaryKey) {
      return new Error('no primaryKey or targetKey provided');
    }
    associationOptions.targetKey = toUnderscore(primaryKey);
    options.targetKey = associationOptions.targetKey;
  }
}

const normalizeOtherKey = (args : ParseJsonFuncArgs, associationOptions : BelongsToManyOptions) => {
  const tableName = args.column.type[1];
  const options = args.column.type[2];
  if (options.otherKey) {
    associationOptions.otherKey = options.otherKey;
  } else {
    const primaryKey = getPrimaryKeyFromModel(args, tableName);
    if (!primaryKey) {
      return new Error('no primaryKey or otherKey provided');
    }
    associationOptions.otherKey = toUnderscore(`${tableName}_${primaryKey}`);
    options.otherKey = associationOptions.otherKey;
  }
}

typeConfigs = {
  hasOne: {
    associationType: 'hasOne',
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: (args : ParseJsonFuncArgs) => {
      const associationOptions : HasOneOptions | Error = parseAssociationOptions(args);
      if (associationOptions instanceof Error) {
        return associationOptions;
      }
      const options = args.column.type[2];
      normalizeForeignKey(args, args.tableName, associationOptions);
      normalizeSourceKey(args, associationOptions);
      associationOptions.ammAs = args.columnName;
      associationOptions.as = args.columnName;
      return {
        ...args.column,
        type: [args.column.type[0], args.column.type[1], associationOptions],
      };
    },
    toCoreColumn: (args : ParseJsonFuncArgs) => {
      return {
        ...args.column,
        type: HAS_ONE(args.column.type[1], args.column.type[2]),
      };
    },
    getTsTypeExpression: (column : JsonModelAttributeInOptionsForm) => {
      return `ExtendedModel<${toInterfaceType(column.type[1])}>`;
    },
    getTsTypeExpressionForCreation: (column : JsonModelAttributeInOptionsForm) => {
      return toTypeForCreation(column.type[1]);
    },
  },
  hasMany: {
    associationType: 'hasMany',
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: (args : ParseJsonFuncArgs) => {
      const associationOptions : HasManyOptions | Error = parseAssociationOptions(args);
      if (associationOptions instanceof Error) {
        return associationOptions;
      }
      const options = args.column.type[2];
      normalizeForeignKey(args, args.tableName, associationOptions);
      normalizeSourceKey(args, associationOptions);
      associationOptions.ammAs = args.columnName;
      associationOptions.as = {
        plural: sequelize.Utils.pluralize(associationOptions.ammAs),
        singular: sequelize.Utils.singularize(associationOptions.ammAs),
      };
      return {
        ...args.column,
        type: [args.column.type[0], args.column.type[1], associationOptions],
      };
    },
    toCoreColumn: (args : ParseJsonFuncArgs) => {
      return {
        ...args.column,
        type: HAS_MANY(args.column.type[1], args.column.type[2]),
      };
    },
    getTsTypeExpression: (column : JsonModelAttributeInOptionsForm) => {
      return `ExtendedModel<${toInterfaceType(column.type[1])}>[]`;
    },
    getTsTypeExpressionForCreation: (column : JsonModelAttributeInOptionsForm) => {
      return `${toTypeForCreation(column.type[1])}[]`;
    },
  },
  belongsTo: {
    associationType: 'belongsTo',
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: (args : ParseJsonFuncArgs) => {
      const associationOptions : BelongsToOptions | Error = parseAssociationOptions(args);
      if (associationOptions instanceof Error) {
        return associationOptions;
      }
      const options = args.column.type[2];
      normalizeForeignKey(args, args.column.type[1], associationOptions);
      normalizeTargetKey(args, associationOptions);
      associationOptions.ammAs = args.columnName;
      associationOptions.as = args.columnName;
      return {
        ...args.column,
        type: [args.column.type[0], args.column.type[1], associationOptions],
      };
    },
    toCoreColumn: (args : ParseJsonFuncArgs) => {
      return {
        ...args.column,
        type: BELONGS_TO(args.column.type[1], args.column.type[2]),
      };
    },
    getTsTypeExpression: (column : JsonModelAttributeInOptionsForm) => {
      return `ExtendedModel<${toInterfaceType(column.type[1])}>`;
    },
    getTsTypeExpressionForCreation: (column : JsonModelAttributeInOptionsForm) => {
      return toTypeForCreation(column.type[1]);
    },
  },
  belongsToMany: {
    associationType: 'belongsToMany',
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: (args : ParseJsonFuncArgs) => {
      const associationOptions : BelongsToManyOptions | Error = <any>parseAssociationOptions(args);
      if (associationOptions instanceof Error) {
        return associationOptions;
      }
      const options = args.column.type[2];
      normalizeSourceKey(args, associationOptions);
      normalizeForeignKey(args, args.tableName, associationOptions);
      normalizeOtherKey(args, associationOptions);
      associationOptions.onDelete = 'SET NULL';
      if (!options.through) {
        return new Error('no through provided');
      }
      associationOptions.through = options.through;
      let throughTableName = '';
      if (typeof associationOptions.through !== 'string') {
        throughTableName = associationOptions.through.ammModelName;
      } else {
        associationOptions.through = { ammModelName: associationOptions.through, ammThroughTableColumnAs: args.tableName };
        throughTableName = associationOptions.through.ammModelName;
      }
      if (!args.schemas.associationModels || !args.schemas.associationModels[throughTableName]) {
        return new Error(`associationModels not found(${throughTableName})`);
      }
      const ammThroughAs = associationOptions.through.ammThroughAs;
      if (ammThroughAs && args.table.columns[ammThroughAs]) {
        return new Error(`ammThroughAs name already taken(${ammThroughAs})`);
      }
      associationOptions.ammAs = args.columnName;
      associationOptions.as = {
        plural: sequelize.Utils.pluralize(associationOptions.ammAs),
        singular: sequelize.Utils.singularize(associationOptions.ammAs),
      };
      const associationModel = args.schemas.associationModels[throughTableName];
      const { ammThroughTableColumnAs } = associationOptions.through;
      associationModel.columns[ammThroughTableColumnAs] = {
        type: [
          'belongsTo',
          args.tableName,
          {
            foreignKey: associationOptions.foreignKey as string,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            targetKey: 'id',
            ammAs: ammThroughTableColumnAs,
            as: ammThroughTableColumnAs,
          },
        ],
        extraOptions: {},
      };
      // console.log('associationModel :', associationModel.columns.id.type);
      // console.log('otherKey :', associationOptions.otherKey);
      // associationOptions.foreignKey = `ssss:${xid++}`;
      return {
        ...args.column,
        type: [args.column.type[0], args.column.type[1], associationOptions],
      };
    },
    toCoreColumn: (args : ParseJsonFuncArgs) => {
      return {
        ...args.column,
        type: BELONGS_TO_MANY(args.column.type[1], args.column.type[2]),
      };
    },
    getTsTypeExpression: (column : JsonModelAttributeInOptionsForm) => {
      return `ExtendedModel<${toInterfaceType(column.type[1])}>[]`;
    },
    getTsTypeExpressionForCreation: (column : JsonModelAttributeInOptionsForm) => {
      return `${toTypeForCreation(column.type[1])}[]`;
    },
  },

  integer: { // JsonModelTypeInteger
    sequleizeDataType: sequelize.INTEGER,
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(sequelize.INTEGER),
    getTsTypeExpression: basicGetTsTypeExpression('number'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('number'),
  },
  bigint: { // JsonModelTypeBigint
    sequleizeDataType: sequelize.BIGINT,
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(sequelize.BIGINT),
    getTsTypeExpression: basicGetTsTypeExpression('string'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('string'),
  },
  decimal: { // JsonModelTypeDecimal
    sequleizeDataType: sequelize.DECIMAL,
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: basicParse(2),
    toCoreColumn: basicToCoreColumn(sequelize.DECIMAL, 2),
    getTsTypeExpression: basicGetTsTypeExpression('number'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('number'),
  },
  real: { // JsonModelTypeReal
    sequleizeDataType: sequelize.REAL,
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(sequelize.REAL),
    getTsTypeExpression: basicGetTsTypeExpression('number'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('number'),
  },
  float: { // JsonModelTypeFloat
    sequleizeDataType: sequelize.FLOAT,
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(sequelize.FLOAT),
    getTsTypeExpression: basicGetTsTypeExpression('number'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('number'),
  },
  double: { // JsonModelTypeDouble
    sequleizeDataType: sequelize.DOUBLE,
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(sequelize.DOUBLE),
    getTsTypeExpression: basicGetTsTypeExpression('number'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('number'),
  },
  boolean: { // JsonModelTypeBoolean
    sequleizeDataType: sequelize.BOOLEAN,
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(sequelize.BOOLEAN),
    getTsTypeExpression: basicGetTsTypeExpression('boolean'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('boolean'),
  },
  string: { // JsonModelTypeString
    sequleizeDataType: sequelize.STRING,
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: basicParse(1),
    toCoreColumn: basicToCoreColumn(sequelize.STRING, 1),
    getTsTypeExpression: basicGetTsTypeExpression('string'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('string'),
  },
  binary: { // JsonModelTypeBinary
    sequleizeDataType: sequelize.BLOB,
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(sequelize.BLOB),
    getTsTypeExpression: basicGetTsTypeExpression('Buffer'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('Buffer'),
  },
  text: { // JsonModelTypeText
    sequleizeDataType: sequelize.TEXT,
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(sequelize.TEXT),
    getTsTypeExpression: basicGetTsTypeExpression('string'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('string'),
  },
  date: { // JsonModelTypeDate
    sequleizeDataType: sequelize.DATE,
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(sequelize.DATE),
    getTsTypeExpression: basicGetTsTypeExpression('Date'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('Date'),
  },
  dateonly: { // JsonModelTypeDateOnly
    sequleizeDataType: sequelize.DATEONLY,
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(sequelize.DATEONLY),
    getTsTypeExpression: basicGetTsTypeExpression('Date'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('Date'),
  },
  uuid: { // JsonModelTypeUuid
    sequleizeDataType: sequelize.UUID,
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(sequelize.UUID),
    getTsTypeExpression: basicGetTsTypeExpression('string'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('string'),
  },
  range: { // JsonModelTypeRange
    sequleizeDataType: sequelize.RANGE,
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: basicParse(1),
    toCoreColumn: (args : ParseJsonFuncArgs) => {
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
      const itemColumn = typeConfigs[type[1]].toCoreColumn({
        ...args,
        column: {
          ...args.column,
          type: [type[1]],
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
    getTsTypeExpression: (column : JsonModelAttributeInOptionsForm) => {
      const rangeTypes : { [s : string] : string } = {
        integer: '[number, number]',
        bigint: '[string, string]',
        decimal: '[number, number]',
        date: '[Date, Date]',
        dateonly: '[Date, Date]',
      };
      return rangeTypes[<any>column.type[1]];
    },
    getTsTypeExpressionForCreation: (column : JsonModelAttributeInOptionsForm) => {
      const rangeTypes : { [s : string] : string } = {
        integer: '[number, number]',
        bigint: '[string, string]',
        decimal: '[number, number]',
        date: '[Date, Date]',
        dateonly: '[Date, Date]',
      };
      return rangeTypes[<any>column.type[1]];
    },
  },
  json: { // JsonModelTypeJson
    sequleizeDataType: sequelize.JSON,
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(sequelize.JSON),
    getTsTypeExpression: basicGetTsTypeExpression('any'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('any'),
  },
  jsonb: { // JsonModelTypeJsonb
    sequleizeDataType: sequelize.JSONB,
    normalize: (args : NormalizeJsonFuncArgs) => undefined,
    parse: basicParse(),
    toCoreColumn: basicToCoreColumn(sequelize.JSONB),
    getTsTypeExpression: basicGetTsTypeExpression('any'),
    getTsTypeExpressionForCreation: basicGetTsTypeExpression('any'),
  },
};
