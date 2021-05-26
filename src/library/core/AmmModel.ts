/* eslint-disable no-param-reassign, no-underscore-dangle, no-multi-assign, no-unused-expressions */
import sequelize, {
  Model,
  ModelDefined,
  ModelNameOptions,
  Sequelize,
} from 'sequelize';
import * as columnTypes from './columnTypes';
import { AmmOrmI, AmmSchema } from './interfaces';
import {
  ModelAttributes,
  ModelOptions,
} from './utils';
// import {
//   defaultCallbackPromise,
//   isFunction,
//   handleValueArrayForMethod,
//   handlePromiseCallback,
// } from '../utils';

export const ThroughValues = Symbol('through-values');

// import genClassMethods from './class-methods';
// import genInstanceMethods from './instance-methods';

// function addMethodsForV4(table, azuModel) {
//   const classMethods = genClassMethods(azuModel);
//   Object.assign(table, classMethods);

//   const instanceMethods = genInstanceMethods(azuModel);
//   if (table.prototype) {
//     Object.assign(table.prototype, instanceMethods);
//   }
// }

const autoInclude = (ammOrm : AmmOrmI, modelName : string, values, inputInclude : any[] | undefined = undefined) => {
  const ammModel = ammOrm.getAmmModel(modelName);

  const includeMap = {};
  let include = inputInclude;
  (include || []).map(incl => incl.as && (includeMap[incl.as] = incl));


  if (ammModel && values) {
    Object.keys(ammModel.associations).forEach((associationName) => {
      if (values[associationName] !== undefined) {
        const association = ammModel.associations[associationName];
        if (!includeMap[associationName]) {
          include = include || [];
          const childValue = Array.isArray(values[associationName]) ? values[associationName][0] : values[associationName];
          const childInclude = autoInclude(ammOrm, (association.targetModel as ModelDefined<Model, any>).name, childValue);
          const includeToAdd : {
            model: any,
            as: any,
            include?: any,
          } = {
            model: association.targetModel,
            as: associationName,
          };
          if (childInclude) {
            includeToAdd.include = childInclude;
          }
          includeMap[associationName] = includeToAdd;
          include.push(includeToAdd);
        }
        // console.log('association :', association.type === 'belongsToMany');
      }
    });
  } else {
    // console.log('include :', include.map(i => i));
  }

  return include;
};

export const getNormalizedModelOptions = (modelName : string, tablePrefix: string, options : ModelOptions) => sequelize.Utils.mergeDefaults(<any>{
  timestamps: true,
  paranoid: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  name: {
    plural: sequelize.Utils.pluralize(modelName),
    singular: sequelize.Utils.singularize(modelName),
  },
  tableName: options.tableName || `${tablePrefix}${(<any>sequelize.Utils).underscore(sequelize.Utils.singularize(modelName))}`
}, options);

export default class AmmModel {
  static columnTypes = columnTypes;

  static ThroughValues = ThroughValues;

  ammOrm : AmmOrmI;
  db : Sequelize;
  tableDefine : AmmSchema;
  tablePrefix : string;
  sqlzModel : ModelDefined<any, any>;
  sqlzOptions : ModelOptions;
  modelName : string;

  columns : ModelAttributes;
  name : ModelNameOptions;
  tableName : string;

  associations : { [s : string] : columnTypes.AssociationColumn };

  constructor(ammOrm : AmmOrmI, modelName : string, tableDefine : AmmSchema, tablePrefix : string = 'tbl_') {
    this.ammOrm = ammOrm;
    this.db = this.ammOrm.db;
    this.tableDefine = tableDefine;
    this.tablePrefix = tablePrefix;
    this.modelName = modelName;

    const {
      columns, sqlzOptions, associations,
    } : { columns : ModelAttributes, sqlzOptions : ModelOptions, associations : any } = this.getNormalizedSettings(this.modelName);
    const {
      name,
      tableName,
    } = sqlzOptions;

    if (!name || !tableName) {
      throw new Error('no name');
    }

    this.sqlzOptions = sqlzOptions;
    const sqlzModel = this.db.define(modelName, columns, sqlzOptions);
    this.columns = columns;

    this.name = name;
    this.tableName = tableName;
    this.associations = associations;
    this.sqlzModel = sqlzModel;
    this.addModelMethods();
  }

  get primaryKey() {
    return this.sqlzModel.primaryKeyAttribute;
  }

  separateNxNAssociations(instance : any) {
    const result : any = {
      nxNAssociations: [],
      originalInclude: [],
    };
    if (!instance._options.include) {
      return result;
    }
    result.originalInclude = instance._options.include;
    instance._options.include = [];
    result.originalInclude.forEach((i : any) => {
      if (!i || !this.associations[i.as]) {
        instance._options.include.push(i);
      } else if (this.associations[i.as].type !== 'belongsToMany') {
        instance._options.include.push(i);
      } else {
        result.nxNAssociations.push(i);
      }
    });
    return result;
  }

  addModelMethods() {
    const originalBuild = this.sqlzModel.build.bind(this.sqlzModel);
    (<any>this.sqlzModel).build = (values, options : any = {}) => {
      let { include } = options;
      if (options.isNewRecord) {
        include = autoInclude(this.ammOrm, this.modelName, values, options.include);
      }

      const result = originalBuild(values, {
        ...options,
        include,
      });
      values && values[ThroughValues] && ((<any>result)._options[ThroughValues] = values[ThroughValues]);
      return result;
    };

    const This = this;
    const originalSave = this.sqlzModel.prototype.save;
    this.sqlzModel.prototype.save = function (options : any = {}) {
      const {
        originalInclude,
        nxNAssociations,
      } = This.separateNxNAssociations(this);
      if (!originalInclude || !nxNAssociations.length) {
        return originalSave.call(this, options);
      }

      return originalSave.call(this, options)
      .then((me) => {
        me._options.include = originalInclude;

        return Promise.all(nxNAssociations.map((include) => {
          const includeOptions = {
            transaction: options.transaction,
            logging: options.logging,
            parentRecord: this,
            ...<any>sequelize.Utils.cloneDeep(include),
          };
          delete includeOptions.association;

          const instances = this.get((<any>include).as);

          return Promise.all(instances.map((instance) => {
            let throughValues = {};
            if (instance._options[ThroughValues]) {
              throughValues = instance._options[ThroughValues];
              delete instance._options[ThroughValues];
            }

            return instance.save(includeOptions).then(() => {
              const values = {
                ...throughValues,
              };
              values[(<any>include).association.foreignKey] = this.get(this.constructor.primaryKeyAttribute, { raw: true });
              values[(<any>include).association.otherKey] = instance.get(instance.constructor.primaryKeyAttribute, { raw: true });
              // Include values defined in the scope of the association
              Object.assign(values, (<any>include).association.through.scope);
              return (<any>include).association.throughModel.create(values, includeOptions);
            })
            .then((throughInstance) => {
              const throughAs = This.associations[(<any>include).as].extraOptions.ammThroughAs!;
              instance.dataValues[throughAs] = throughInstance;
              // console.log('instance :', JSON.stringify(instance));
            });
          }));
        }))
        .then(() => me);
      });
    };

    this.ammOrm.addSqlzModelMethod(this.sqlzModel);
  }

  getNormalizedSettings(modelName) {
    const {
      columns: inputColumns,
      options = {},
    } = this.tableDefine;

    const associations = {};

    const columns = {};
    Object.keys(inputColumns).forEach((columnName) => {
      const column = inputColumns[columnName];
      if ((<any>column).type && columnTypes.isAssociationColumn((<any>column).type)) {
        associations[columnName] = (<any>column).type;
        associations[columnName].setAs(columnName);
      } else {
        columns[columnName] = column;
      }
    });

    const sqlzOptions : ModelOptions = getNormalizedModelOptions(modelName, this.tablePrefix, options)

    sqlzOptions.tableName = sqlzOptions.tableName || `${this.tablePrefix}${(<any>sequelize.Utils).underscore(sqlzOptions.name!.singular)}`;

    return { columns, sqlzOptions, associations };
  }

  // ==============================================

  setupAssociations() {
    Object.keys(this.associations).forEach((associationName) => {
      const association = this.associations[associationName];
      let TargetModel = association.targetModel;
      if (typeof TargetModel === 'string') {
        TargetModel = association.targetModel = this.ammOrm.getSqlzModel(TargetModel)!;
      }

      let throughModel;
      let options;
      if (association.type === 'belongsToMany') {
        const o = <columnTypes.BelongsToManyOptions>association.options;
        throughModel = this.ammOrm.getSqlzAssociationModel((<columnTypes.ThroughOptions><any>o.through).ammModelName!);
        options = sequelize.Utils.mergeDefaults({
          through: {
            model: throughModel,
          },
          as: associationName,
          ammAs: associationName,
        }, <any>association.options);
      } else {
        options = sequelize.Utils.mergeDefaults({
          as: associationName,
          ammAs: associationName,
        }, <any>association.options);
      }

      if (association.type === 'hasMany' || association.type === 'belongsToMany') {
        options.as = {
          plural: sequelize.Utils.pluralize(associationName),
          singular: sequelize.Utils.singularize(associationName),
        };
      }

      if (options.ammAs && options.ammAs !== associationName) {
        throw new Error(`Association.as (${options.ammAs}) should be the same as column name (${associationName}) in model (${this.modelName})`);
      }
      (<any>this.sqlzModel)[association.type](TargetModel, options);
    });
  }
}
