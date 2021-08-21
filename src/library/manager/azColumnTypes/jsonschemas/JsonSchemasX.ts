import path from 'path';
import fs from 'fs';
import {
  Model,
  Sequelize,
  DataTypes,
} from 'sequelize';
import PostgresQueryGenerator from 'sequelize/lib/dialects/postgres/query-generator';
import { Liquid } from 'liquidjs';
import appRootPath from 'app-root-path';
import pgStructure, {
  Table,
  Column,
  Index,
  Db,
} from 'pg-structure';
import { capitalizeFirstLetter, toMap } from '../../../core/utils';
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
  RawModelAttributeColumnOptions,
  RawModelAttributes,
  RawSchema,
  RawSchemas,
  RawSchemaType,
  ParsedColumnInfo,
  ParsedTableInfo,
  SchemasMetadata,
  NormalizeJsonFuncArgs,
  ParseJsonFuncArgs,
} from './interfaces';

import {
  AmmSchema,
  AmmSchemas,
  Overwrite,
  ModelAttributeColumnOptions,
  getNormalizedModelOptions,
  BelongsToOptions,
  ColumnExtraOptions,
} from '../../../core';

import {
  ModelOptions,
} from '../../../core';

import {
  getForeignKey,
  getTargetKey,

  beforeNormalizeRawSchemas,
  normalizeRawSchemas,
  afterNormalizeRawSchemas,
  afterParseRawSchemas,
  preParseRawSchemas,
  parseRawSchemas,
  toCoreModels,
} from './JsonSchemasXHelpers';

// =======================

const appRoot = appRootPath.resolve('./');

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

    let err = beforeNormalizeRawSchemas(
      this.schemasMetadata,
      this.schemas,
      this.rawSchemas,
    );
    if (err) return err;
    err = normalizeRawSchemas(
      this.schemasMetadata.models,
      'model',
      this.schemas.models,
      this.schemas,
      this.rawSchemas,
    );
    if (err) return err;
    return normalizeRawSchemas(
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

    this.schemasMetadata.allModels = {
      ...this.schemasMetadata.models,
      ...this.schemasMetadata.associationModels,
    };

    let err = afterNormalizeRawSchemas(
      this.schemasMetadata.models,
      'model',
      this.schemas.models,
      this.schemasMetadata,
      this.schemas,
    );
    if (err) return err;
    err = afterNormalizeRawSchemas(
      this.schemasMetadata.associationModels,
      'associationModel',
      this.schemas.associationModels,
      this.schemasMetadata,
      this.schemas,
    );

    if (err) return err;
  }

  afterParseRawSchemas() : Error | void {
    let err = afterParseRawSchemas(
      this.schemasMetadata.models,
      'model',
      this.schemas.models,
      this.schemasMetadata,
      this.schemas,
    );
    if (err) return err;
    err = afterParseRawSchemas(
      this.schemasMetadata.associationModels,
      'associationModel',
      this.schemas.associationModels,
      this.schemasMetadata,
      this.schemas,
    );

    if (err) return err;
  }

  parseRawSchemas() : Error | void {
    this.parsed = false;
    let err = this.normalizeRawSchemas();
    if (err) { return err; }
    err = this.afterNormalizeRawSchemas();
    if (err) { return err; }
    const { schemasMetadata, schemas } = this;
    err = preParseRawSchemas(schemasMetadata, schemas, 'model', this.schemas.models);
    if (err) return err;
    err = preParseRawSchemas(schemasMetadata, schemas, 'associationModel', this.schemas.associationModels);
    if (err) return err;
    err = parseRawSchemas(schemasMetadata, schemas, 'model', this.schemas.models);
    if (err) return err;
    err = parseRawSchemas(schemasMetadata, schemas, 'associationModel', this.schemas.associationModels);
    if (err) return err;
    this.parsed = false;

    err = this.afterParseRawSchemas();
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

    let err = toCoreModels(
      schemasMetadata,
      schemas,
      'model',
      schemas.models,
      result.models,
    );
    if (err) { return err; }

    err = toCoreModels(
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
      this.registerFilter('hasForeignKey', (column : JsonModelAttributeInOptionsForm, model : IJsonSchema) => {
        const foreignKey = getForeignKey(column);
        if (foreignKey && model.columns[foreignKey]) {
          return false;
        }
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

  getAddColumnQuery (
    ammSchema : AmmSchema,
    modelMetadata: ParsedTableInfo,
    columnName: string,
  ) {
    const sequelizeDb = new Sequelize('postgres://fakeurl/fakedb', {
      dialect: 'postgres',
      minifyAliases: true,
    });
    const tableNameInDb = modelMetadata.tableNameInDb;
    const columnNameInDb = modelMetadata.columns[columnName].columnNameInDb;
    const queryInterface = sequelizeDb.getQueryInterface();
    const queryGenerator : PostgresQueryGenerator = (<any>queryInterface).queryGenerator;
    const attr = ammSchema.columns[columnName];
    const a = (<any>queryInterface.sequelize).normalizeAttribute(attr);
    const aSql = queryGenerator.attributeToSQL(a, { key: columnNameInDb, table: tableNameInDb, context: 'addColumn' });
    // console.log('aSql :', aSql);
    const q = queryGenerator.addColumnQuery(tableNameInDb, columnNameInDb, aSql);
    // console.log('q :', q);
    return q;
  }

  getAddIndexQuery (
    ammSchema : AmmSchema,
    modelMetadata: ParsedTableInfo,
    indexName: string,
  ) {
    const sequelizeDb = new Sequelize('postgres://fakeurl/fakedb', {
      dialect: 'postgres',
      minifyAliases: true,
    });
    const tableNameInDb = modelMetadata.tableNameInDb;
    const indexNameInDb = modelMetadata.indexes[indexName].name!;
    const queryInterface = sequelizeDb.getQueryInterface();
    const queryGenerator : PostgresQueryGenerator = (<any>queryInterface).queryGenerator;
    const q = queryGenerator.addIndexQuery(tableNameInDb, modelMetadata.indexes[indexName].fields!, {
      name: indexNameInDb,
    } , tableNameInDb);
    // console.log('q :', q);
    return q;
  }

  compareDb(db : Db) {
    const dbSchema = db.schemas.get(this.dbSchemaName);
    const allModelMetadatas = Object.values(this.schemasMetadata.allModels);
    const missedTables : string[] = [];
    const missedColumns : string[] = [];
    let missedColumnsQuery : string = '';
    const missedIndexes : string[] = [];
    let missedIndexesQuery : string = '';
    
    const schemas = this.toCoreSchemas();
    if (schemas instanceof Error) {
      return;
    }
    Object.keys(this.schemasMetadata.allModels).forEach((modelMetadataName) => {
      const modelMetadata = this.schemasMetadata.allModels[modelMetadataName];
      const table = dbSchema.tables.find(t => t.name === modelMetadata.modelOptions.tableName!);
      if (!table) {
        missedTables.push(modelMetadata.modelOptions.tableName!);
        return ;
      }
      Object.keys(modelMetadata.columns).forEach((columnName) => {
        const c = modelMetadata.columns[columnName];
        if (!c.columnNameInDb!) {
          return;
        }
        // if (table.name === 'tbl_organization') {
        //   console.log('c.columnNameInDb! :', c.columnNameInDb!);
        // }
        const column = table.columns.find(col => col.name === c.columnNameInDb!);
        if (!column && !c.isAssociationColumn) {
          const model = modelMetadata.isAssociationModel ?
            schemas.associationModels![modelMetadataName]
            : schemas.models[modelMetadataName];
          const query = this.getAddColumnQuery(
            model,
            modelMetadata,
            columnName,
          );
          missedColumnsQuery += `
-- ${modelMetadataName} => ${columnName}
${query};
`;
          missedColumns.push(`${table.name}.${c.columnNameInDb!}`);
        }
      });

      Object.keys(modelMetadata.indexes).forEach((indexName) => {
        const indexFromSchema = modelMetadata.indexes[indexName];
        const index = table.indexes.find((ind) => {
          if (ind.isUnique !== !!indexFromSchema.unique) {
            return false;
          }
          const columns = ind.columns.map(c => c.name);
          if (columns.length !== indexFromSchema.fields?.length) {
            return false;
          }
          for (let i = 0; i < columns.length; i++) {
            if (indexFromSchema.fields![i] !== columns[i]) {
              return false;
            }
          }
          return true;
        });
        if (!index) {
          const model = modelMetadata.isAssociationModel ?
            schemas.associationModels![modelMetadataName]
            : schemas.models[modelMetadataName];
          console.log('indexName :', indexName);
          const query = this.getAddIndexQuery(
            model,
            modelMetadata,
            indexName,
          );
          missedIndexesQuery += `
-- ${modelMetadataName} => ${indexName}
${query};
`;
          missedIndexes.push(`${table.name}.${indexName}`);
        }
      });
    });
    // dbSchema.tables.forEach((table) => {
    //   // console.log('table, columns :', table, columns);
    //   const model = allModelMetadatas.find(m => m.modelOptions.tableName! === table.name);
    //   if (!model) {
    //     missedTables.push(table.name);
    //     return ;
    //   }
    //   for (let index = 0; index < table.columns.length; index++) {
    //     const column = table.columns[index];
    //     const modelColumns = Object.values(model.columns);
    //     const modelColumn = modelColumns.find(c => c.columnNameInDb! === column.name);
    //     if (!modelColumn && column.name !== 'created_at' && column.name !== 'updated_at' && column.name !== 'deleted_at' ) {
    //       missedColumns.push(`${table.name}.${column.name}`);
    //     }
    //   }
    //   // console.log('allModelMetadatas :', allModelMetadatas);
    // });
    return {
      missedTables,
      missedColumns,
      missedColumnsQuery,
      missedIndexes,
      missedIndexesQuery,
    };
  }

  // ========================

  compareDb2(db : Db) {
    const dbSchema = db.schemas.get(this.dbSchemaName);
    const allModelMetadatas = Object.values(this.schemasMetadata.allModels);
    const missedTables : string[] = [];
    const missedColumns : string[] = [];
    dbSchema.tables.forEach((table) => {
      // console.log('table, columns :', table, columns);
      const model = allModelMetadatas.find(m => m.modelOptions.tableName! === table.name);
      if (!model) {
        missedTables.push(table.name);
        return ;
      }
      for (let index = 0; index < table.columns.length; index++) {
        const column = table.columns[index];
        const modelColumns = Object.values(model.columns);
        const modelColumn = modelColumns.find(c => c.columnNameInDb! === column.name);
        if (!modelColumn && column.name !== 'created_at' && column.name !== 'updated_at' && column.name !== 'deleted_at' ) {
          missedColumns.push(`${table.name}.${column.name}`);
        }
      }
      // console.log('allModelMetadatas :', allModelMetadatas);
    });
    return {
      missedTables,
      missedColumns,
    };
  }

  // ========================

  parseSchemaFromDb(db : Db) {
    const dbSchema = db.schemas.get(this.dbSchemaName);
    // const table = db.get('tbl_account_link') as Table;
    return {
      dbSchema,
      tables: toMap(dbSchema.tables.map(table => this.parseTableFromDb(table)), ({ table }) => table.name),
    };
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
    // console.log('columnNames :', columnNames);
    // const constraintNames = table.constraints.map((c) => {
    //   console.log('c :', c);
    //   return c.name;
    // });
    // console.log('constraintNames :', constraintNames);
    const indexNames = table.indexes.map((i) => {
      this.reportIndex(i);
      return i.name;
    });
    // console.log('indexNames :', indexNames);
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
    // console.log('relatedTables :', relatedTables);
    return {
      table,
      columns: toMap(table.columns, column => column.name),
      indexes: toMap(table.indexes, index => index.name),
    };
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
