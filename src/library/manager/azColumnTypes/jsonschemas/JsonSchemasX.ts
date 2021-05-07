import path from 'path';
import fs from 'fs';
import {
  Model,
} from 'sequelize';
import { Liquid } from 'liquidjs';
import appRootPath from 'app-root-path';
import pgStructure, {
  Table,
  Column,
  Index,
  Db,
} from 'pg-structure';
import { capitalizeFirstLetter } from '../../../core/utils';
import {
  IJsonSchema,
  IJsonSchemas,
  JsonModelAllAttributeType,
  JsonModelAttributeInOptionsForm,
  NormalizedJsonModelAttributes,
  JsonModelAttributeColumn,
  IJsonSchemasOptions,
} from './IJsonSchemas';

import {
  typeConfigs,
} from './typeConfigs';

import {
  AmmSchema,
  AmmSchemas,
  Overwrite,
  ModelAttributeColumnOptions,
  getNormalizedModelOptions,
  BelongsToOptions,
} from '../../../core';

import {
  ModelOptions,
} from '../../../core';

// =======================

const appRoot = appRootPath.resolve('./');

export interface RawModelAttributeColumnOptions<M extends Model = Model> {
  type : [string, ...any[]];
}

export type RawModelAttributes<M extends Model = Model, TCreationAttributes = any> = {
  [name in keyof TCreationAttributes]: Overwrite<ModelAttributeColumnOptions<M>, RawModelAttributeColumnOptions<M>>;
};

export type RawSchema = {
  columns: RawModelAttributes;
  options?: ModelOptions;
};

export type RawSchemas = {
  models: { [s: string]: RawSchema; };
  associationModels?: { [s: string]: RawSchema; };
  options?: IJsonSchemasOptions;
};

export type RawSchemaType = 'model' | 'associationModel';

export type ParsedColumnInfo = {
};

export type ParsedTableInfo = {
  isAssociationModel: boolean;
  primaryKey?: string;
  modelOptions: ModelOptions;
  columns: ParsedColumnInfo[];
};

export type SchemasMetadata = {
  models: {
    [s : string]: ParsedTableInfo;
  };
  associationModels: {
    [s : string]: ParsedTableInfo;
  };
  allModels: {
    [s : string]: ParsedTableInfo;
  };
};

export type NormalizeJsonFuncArgs = {
  table : RawSchema;
  tableType : RawSchemaType;
  tableName : string;
  column : any;
  columnName : string;
};

export type ParseJsonFuncArgs = NormalizeJsonFuncArgs & {
  schemasMetadata: SchemasMetadata;

  schemas : RawSchemas;
};

// =======================

export class JsonSchemasX {
  rawSchemas : RawSchemas; // from input
  dbSchemaName : string; // from db

  parsed!: boolean;

  schemasMetadata!: SchemasMetadata;
  schemas!: IJsonSchemas;

  constructor(dbSchemaName : string, rawSchemas : RawSchemas) {
    this.dbSchemaName = dbSchemaName;
    this.rawSchemas = rawSchemas;
    this.clear();
  }

  clear() {
    this.parsed = false;
    this.schemasMetadata = { models: {}, associationModels: {}, allModels: {} };
    this.schemas = {
      models: {},
      associationModels: {},
    };
  }

  static forEachSchema<ColumnType = JsonModelAllAttributeType>(
    tableType : RawSchemaType,
    models : { [s: string]: IJsonSchema; },
    modelCb : ((tableName : string, tableType : RawSchemaType, jsonSchema : IJsonSchema) => Error | void) | null,
    columnCb : ((
      tableName : string, tableType : RawSchemaType, jsonSchema : IJsonSchema,
      columnName : string, column : ColumnType,
    ) => Error | void) | null,
  ) {
    const modelKeys = Object.keys(models);
    for (let i = 0; i < modelKeys.length; i++) {
      const tableName = modelKeys[i];
      const table = models[tableName];
      let err : void | Error;
      if (modelCb) {
        modelCb(tableName, tableType, table);
      }
      if (err) return err;
      if (!columnCb) {
        continue;
      }
      const rawColumns = table.columns;
      const rawColumnKeys = Object.keys(rawColumns);
      for (let j = 0; j < rawColumnKeys.length; j++) {
        const columnName = rawColumnKeys[j];
        const column = rawColumns[columnName];
        err = columnCb(tableName, tableType, table, columnName, <any>column)
        if (err) return err;
      }
    }
  }

  static beforeNormalizeRawSchemas(
    metadata: SchemasMetadata,
    schemas: IJsonSchemas,
    rawSchemas: RawSchemas,
  ) : Error | void {
    if (!rawSchemas.options) {
      rawSchemas.options = {};
    }
    if (!rawSchemas.options.model) {
      rawSchemas.options.model = {};
    }
    if (!rawSchemas.options.model.tablePrefix) {
      rawSchemas.options.model.tablePrefix = 'tbl_';
    }

    if (!rawSchemas.options.associationModel) {
      rawSchemas.options.associationModel = {};
    }
    if (!rawSchemas.options.associationModel.tablePrefix) {
      rawSchemas.options.associationModel.tablePrefix = 'mn_';
    }

    schemas.options = rawSchemas.options;
  }

  static normalizeRawSchemas(
    parsedTables : {
      [s : string]: ParsedTableInfo;
    },
    tableType : RawSchemaType,
    models : { [s: string]: IJsonSchema; },
    schemas: IJsonSchemas,
    rawSchemas: RawSchemas,
  ) : Error | void {
    JsonSchemasX.forEachSchema(
      tableType,
      models,
      (tableName, tableType, table) => {
        table.options = getNormalizedModelOptions(tableName, tableType === 'associationModel' ? (schemas.options?.associationModel?.tablePrefix!) : (schemas.options?.model?.tablePrefix!), table.options || {});
        parsedTables[tableName] = {
          isAssociationModel: tableType === 'associationModel',
          modelOptions: table.options!,
          columns: [],
        };
      },
      (tableName, tableType, table, columnName, column) => {
        if (typeof column === 'string' || Array.isArray(column)) {
          column = {
            type: <any>column,
          };
        }
        table.columns[columnName] = column;
        if (!column.type) {
          return Error(`no type name: table(${tableName}), column(${columnName})`);
        }
        if (typeof column.type === 'string') {
          column.type = <any>[column.type];
        }
        column.extraOptions = column.extraOptions || {};
        if (column.primaryKey) {
          parsedTables[tableName].primaryKey = columnName;
        }
        if (!Array.isArray(column.type) || !column.type.length || typeof column.type[0] !== 'string') {
          return Error(`bad type name: table(${tableName}), column(${columnName})`);
        }
        const typeName = column.type[0];
        const typeConfig = typeConfigs[typeName];
        if (!typeConfig) {
          return Error(`unknown type name: table(${tableName}), column(${columnName}), type(${typeName})`);
        }
      },
    );

    JsonSchemasX.forEachSchema<JsonModelAttributeInOptionsForm>(
      tableType,
      models,
      null,
      (tableName, tableType, table, columnName, column) => {
        const typeName = column.type[0];
        const typeConfig = typeConfigs[typeName];
        const err = typeConfig.normalize({
          table: <any>table,
          tableType,
          tableName,
          column,
          columnName,
        });
        if (err) {
          return err;
        }
      },
    );
  }

  static afterNormalizeRawSchemas(
    parsedTables : {
      [s : string]: ParsedTableInfo;
    },
    tableType : RawSchemaType,
    models : { [s: string]: IJsonSchema; },
    metadata: SchemasMetadata,
    schemas: IJsonSchemas,
  ) : Error | void {
    JsonSchemasX.forEachSchema(
      tableType,
      models,
      (tableName, tableType, table) => {
        console.log('tableName :', tableName);
      },
      (tableName, tableType, table, columnName, column) => {
        
      },
    );
  }

  static parseRawSchemas(
    schemasMetadata : SchemasMetadata,
    rawSchemas : IJsonSchemas,
    tableType : RawSchemaType,
    models : { [s: string]: IJsonSchema; },
  ) : Error | void {
    JsonSchemasX.forEachSchema<JsonModelAttributeInOptionsForm>(
      tableType,
      models,
      null,
      (tableName, tableType, table, columnName, column) => {
        const typeName = column.type[0];
        const typeConfig = typeConfigs[typeName];
        const result = typeConfig.parse({
          schemasMetadata,
          schemas: <any>rawSchemas,
          table: <any>table,
          tableType,
          tableName,
          column,
          columnName,
        });
        if (result instanceof Error) {
          return result;
        }
        table.columns[columnName] = result;
      },
    );
  }

  static toCoreModels(
    schemasMetadata : SchemasMetadata,
    rawSchemas : IJsonSchemas,
    tableType : RawSchemaType,
    models : { [s: string]: IJsonSchema; },
    resultModels: { [s: string]: AmmSchema; },
  ) : (Error | void) {

    JsonSchemasX.forEachSchema<JsonModelAttributeInOptionsForm>(
      tableType,
      models,
      (tableName, tableType, table) => {
        resultModels[tableName] = {
          columns: {},
          options: table.options,
        };
      },
      (tableName, tableType, table, columnName, column) => {
        const typeName = column.type[0];
        const typeConfig = typeConfigs[typeName];
        const parseResult = typeConfig.toCoreColumn({
          schemasMetadata,
          schemas: <any>rawSchemas,
          table: <any>table,
          tableType: 'associationModel',
          tableName,
          column,
          columnName,
        });
        if (parseResult instanceof Error) {
          return Error(`parse type error: table(${tableName}), column(${columnName}), type(${typeName}), error: ${parseResult.message}`);
        }
        resultModels[tableName].columns[columnName] = parseResult;
      },
    );
  }

  normalizeRawSchemas() : Error | void {
    this.clear();

    if (!this.rawSchemas.models) {
      return Error(`bad json data: no models provided`);
    }

    this.schemas.models = {
      ...<any>this.rawSchemas.models,
    };

    if (this.rawSchemas.associationModels) {
      this.schemas.associationModels = {
        ...<any>this.rawSchemas.associationModels,
      };
    }

    let err = JsonSchemasX.beforeNormalizeRawSchemas(
      this.schemasMetadata,
      this.schemas,
      this.rawSchemas,
    );
    if (err) return err;
    err = JsonSchemasX.normalizeRawSchemas(
      this.schemasMetadata.models,
      'model',
      this.schemas.models,
      this.schemas,
      this.rawSchemas,
    );
    if (err) return err;
    return JsonSchemasX.normalizeRawSchemas(
      this.schemasMetadata.associationModels,
      'associationModel',
      this.schemas.associationModels,
      this.schemas,
      this.rawSchemas,
    );
  }

  afterNormalizeRawSchemas() : Error | void {
    this.schemas.models = {
      ...<any>this.rawSchemas.models,
    };

    if (this.rawSchemas.associationModels) {
      this.schemas.associationModels = {
        ...<any>this.rawSchemas.associationModels,
      };
    }

    const err = JsonSchemasX.afterNormalizeRawSchemas(
      this.schemasMetadata.models,
      'model',
      this.schemas.models,
      this.schemasMetadata,
      this.schemas,
    );
    if (err) return err;
    return JsonSchemasX.afterNormalizeRawSchemas(
      this.schemasMetadata.associationModels,
      'associationModel',
      this.schemas.associationModels,
      this.schemasMetadata,
      this.schemas,
    );
  }

  parseRawSchemas() : Error | void {
    this.parsed = false;
    let err = this.normalizeRawSchemas();
    if (err) { return err; }
    err = this.afterNormalizeRawSchemas();
    if (err) { return err; }
    const { schemasMetadata, schemas } = this;
    err = JsonSchemasX.parseRawSchemas(schemasMetadata, schemas, 'model', this.schemas.models);
    if (err) return err;
    err = JsonSchemasX.parseRawSchemas(schemasMetadata, schemas, 'associationModel', this.schemas.associationModels);
    this.parsed = false;
    return err;
  }

  toCoreSchemas() : AmmSchemas | Error {
    const result : AmmSchemas = {
      models: {},
      associationModels: {},
    };

    if (!this.parsed) {
      const err = this.parseRawSchemas();
      if (err) return err;
    }

    const { schemasMetadata, schemas } = this;
    // if (schemas.associationModels['userUserGroup']) {
    //   fs.writeFileSync('xxx.json', JSON.stringify(schemas, null, 2), { encoding: 'utf-8' });
    // }

    this.rawSchemas.options

    result.options = this.schemas.options;

    let err = JsonSchemasX.toCoreModels(
      schemasMetadata,
      schemas,
      'model',
      schemas.models,
      result.models,
    );
    if (err) { return err; }

    err = JsonSchemasX.toCoreModels(
      schemasMetadata,
      schemas,
      'associationModel',
      schemas.associationModels,
      result.associationModels!,
    );
    if (err) { return err; }
    return result;
  }

  // ========================

  buildModelTsFile(args : {
    orders?: string[],
    liquidRoot?: string
  } = {}) : Promise<string> {
    const { schemasMetadata, schemas } = this;
    // console.log('schemasMetadata.associationModels :', schemasMetadata.associationModels);
    // console.log('schemas.associationModels :', schemas.associationModels);
    const engine = new Liquid({
      root: args.liquidRoot || path.join(appRoot, 'liquids'),
    });
    const getForeignKey = (column : JsonModelAttributeInOptionsForm) => {
      const {
        associationType,
      } = typeConfigs[column.type[0]];
      if (!associationType) {
        return null;
      }
      if (associationType === 'belongsTo') {
        // console.log('column.type[1] :', column.type[1]);
        const option = column.type[2] as BelongsToOptions;
        // console.log('option :', option);
        if (option.foreignKey) {
          if (typeof option.foreignKey === 'string') {
            return option.foreignKey;
          }
          return option.foreignKey.name!;
        }
      }
      return null;
    };
    const getTargetKey = (column : JsonModelAttributeInOptionsForm) => {
      const {
        associationType,
      } = typeConfigs[column.type[0]];
      if (!associationType) {
        return null;
      }
      if (associationType === 'belongsTo') {
        // console.log('column.type[1] :', column.type[1]);
        const option = column.type[2] as BelongsToOptions;
        // console.log('option :', option);
        if (option.targetKey) {
          return option.targetKey;
        }
      }
      return null;
    };
    engine.plugin(function (Liquid) {
      this.registerFilter('capitalizeFirstLetter', capitalizeFirstLetter);
      this.registerFilter('toTsTypeExpression', (column : JsonModelAttributeInOptionsForm) => {
        return typeConfigs[column.type[0]].getTsTypeExpression(column);
      });
      this.registerFilter('toTsTypeExpressionForCreation', (column : JsonModelAttributeInOptionsForm) => {
        return typeConfigs[column.type[0]].getTsTypeExpressionForCreation(column);
      });
      this.registerFilter('getForeignKey', (column : JsonModelAttributeInOptionsForm) => {
        return getForeignKey(column) as string;
      });
      this.registerFilter('getForeignKeyTsTypeExpression', (column : JsonModelAttributeInOptionsForm) => {
        const targetKey = getTargetKey(column)!;
        const c = schemas.models[column.type[1]!].columns[targetKey] as JsonModelAttributeInOptionsForm;
        return typeConfigs[c.type[0]].getTsTypeExpressionForCreation(column);
      });
      this.registerFilter('hasForeignKey', (column : JsonModelAttributeInOptionsForm) => {
        const foreignKey = getForeignKey(column);
        return !!foreignKey;
      });
      this.registerFilter('getOptionalMark', (column : JsonModelAttributeInOptionsForm, optionalMark = '?') => {
        return column.extraOptions!.requiredOnCreation ? '' : optionalMark;
      });
      this.registerFilter('debugPrint', (value : any) => {
        console.log('value :', value);
        return value;
      });
    });
    return engine.parseAndRender(`{% render 'main.liquid', schemasMetadata: schemasMetadata, schemas: schemas, orders: orders, models: models %}`, { schemasMetadata, schemas, orders: args.orders || [...Object.keys(schemas.models), ...Object.keys(schemas.associationModels)] });
  }

  // ========================

  parseSchemaFromDb(db : Db) {
    const dbSchema = db.schemas.get(this.dbSchemaName);
    const table = db.get('tbl_account_link') as Table;
    dbSchema.tables.forEach((table) => {
      this.parseTableFromDb(table);
    });
    // return this.parseTableFromDb(table);
    // console.log('db.schemas.get("public") :', db.schemas.get('public').sequences);
    // const table = db.get('tbl_account_link') as Table;
    // return this.reportTable(table);
  }

  parseTableFromDb(table : Table) {
    // console.log('table :', table);
    const columnNames = table.columns.map((c) => {
      this.reportColumn(c);
      return c.name;
    });
    console.log('columnNames :', columnNames);
    // const constraintNames = table.constraints.map((c) => {
    //   console.log('c :', c);
    //   return c.name;
    // });
    // console.log('constraintNames :', constraintNames);
    const indexNames = table.indexes.map((i) => {
      this.reportIndex(i);
      return i.name;
    });
    console.log('indexNames :', indexNames);
    // const columnTypeName = table.columns.get('owner_id').type.name;
    // const indexColumnNames = table.indexes.get('ix_mail').columns;
    const relatedTables = table.hasManyTables;
    // console.log('============ table.name ============ :', table.name);
    // table.m2mRelations.forEach((r) => {
    //   console.log('=================== r ===================');
    //   console.log('r.sourceTable.name :', r.sourceTable.name);
    //   console.log('r.joinTable.name :', r.joinTable.name);
    //   console.log('r.targetTable.name :', r.targetTable.name);
    //   console.log('r.foreignKey :', r.foreignKey.columns[0].name);
    //   console.log('=================== r ===================');
    // });
    // console.log('table.m2mRelations, table.m2oRelations :', table.m2mRelations, table.m2oRelations);
    console.log('relatedTables :', relatedTables);
  }

  reportColumn(column : Column) {
    // console.log('column.name :', column.name);
    // console.log('column.type.name :', column.type.name);
    // // // console.log('column.comment :', column.comment);
    // // console.log('column.notNull :', column.notNull);
    // console.log('column.length :', column.length);
    // console.log('column.precision :', column.precision);
    // // console.log('column.scale :', column.scale);
    // // console.log('column.arrayDimension :', column.arrayDimension);
    // // console.log('column.defaultWithTypeCast :', column.defaultWithTypeCast);
    // // console.log('column.attributeNumber :', column.attributeNumber);
  }

  reportIndex(index : Index) {
    // console.log('index.isPrimaryKey :', index.isPrimaryKey);
    if (index.isPrimaryKey) {
      // console.log('index.columnsAndExpressions :', index.columnsAndExpressions.map(col => typeof col === 'string' ? col : col.name).join(', '));
    } else if (index.isUnique) {
      // console.log('index.partialIndexExpression :', index.partialIndexExpression);
    }

    // if (index.columnsAndExpressions) {
    //   console.log('index.columnsAndExpressions :', index.columnsAndExpressions.map(col => typeof col === 'string' ? col : col.name).join(', '));
    // }
    // if (index.partialIndexExpression) {
    //   console.log('index.partialIndexExpression :', index.partialIndexExpression);
    // }
  }
}
