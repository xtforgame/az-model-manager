/* eslint-disable no-param-reassign, import/no-named-as-default-member */
import { Sequelize, IncludeOptions } from 'sequelize';
import { AmmOrmI, AmmModelI, AmmSchemas } from '../interfaces';
import AmmModel from '../AmmModel';
import AssociationModel from '../AssociationModel';
import { Overwrite, ExtendedModelDefined as EMD } from '../utils';
import OriginalAmmOrm from './OriginalAmmOrm';
import { isAssociationColumn, AssociationColumn } from '../columnTypes';

export type AssociationModelNameAsStringToInclude = string;
export type AssociationModelNameAsDataToInclude = Overwrite<IncludeOptions, {
  as: string;
}>;

export type AssociationModelNameAsToInclude = AssociationModelNameAsStringToInclude | AssociationModelNameAsDataToInclude;

type ExtendedModelDefined<X, S = any, T = any> = EMD<X, S, T> & {
  orm: OriginalAmmOrm;
  ammIncloud: (associationModelNameAsArray : AssociationModelNameAsToInclude[]) => IncludeOptions[];
};

export default class AmmOrm extends OriginalAmmOrm {
  constructor(sequelizeDb : Sequelize, ammSchemas : AmmSchemas) {
    super(sequelizeDb, ammSchemas);
  }

  addSqlzModelMethod(sqlzModel : EMD<any, any>) {
    (<any>sqlzModel).amm = this;
    (<any>sqlzModel).ammIncloud = (associationModelNameAsArray : AssociationModelNameAsToInclude[] = []) => this.getAssociationIncludes(sqlzModel.name, associationModelNameAsArray);
  }

  getAmmModel<Extended = {}, S = any, T = any>(name) : AmmModelI<Extended & { _orm: AmmOrm }, S, T> | undefined {
    return <any>this.tableInfo[name];
  }

  getSqlzModel<Extended = {}, S = any, T = any>(name) : ExtendedModelDefined<Extended & { _orm: AmmOrm }, S, T> | undefined {
    const model = this.getAmmModel<Extended & { _orm: AmmOrm }, S, T>(name);
    return model && <any>model.sqlzModel;
  }

  getAmmAssociationModel<Extended = {}, S = any, T = any>(name) : AmmModelI<Extended> | undefined {
    return <any>this.associationModelInfo[name];
  }

  getSqlzAssociationModel<Extended = {}, S = any, T = any>(name) : ExtendedModelDefined<Extended & { _orm: AmmOrm }, S, T> | undefined {
    const model = this.getAmmAssociationModel<Extended & { _orm: AmmOrm }, S, T>(name);
    return model && <any>model.sqlzModel;
  }

  // ======================

  isAssociation = (baseModelName : string, associationModelNameAs : string) => {
    if (!this.ammSchemas.models[baseModelName]) {
      // throw new Error(`Base Model not found: ${baseModelName}`);
      return false;
    }
    if (!this.ammSchemas.models[baseModelName].columns[associationModelNameAs]) {
      // throw new Error(`Association Model not found: ${associationModelNameAs}`);
      return false;
    }
    const coType = (<any>this.ammSchemas.models[baseModelName].columns[associationModelNameAs]).type as AssociationColumn;
    return isAssociationColumn(coType);
  }

  getAssociationIncludeData = (baseModelName : string, associationModelNameAs : string) => {
    if (!this.ammSchemas.models[baseModelName]) {
      console.log('baseModelName, this.ammSchemas.models :', baseModelName, this.ammSchemas.models);
      throw new Error(`Base Model not found: ${baseModelName}`);
      return null;
    }
    if (!this.ammSchemas.models[baseModelName].columns[associationModelNameAs]) {
      throw new Error(`Association Model not found: ${associationModelNameAs}`);
      return null;
    }
    const coType = (<any>this.ammSchemas.models[baseModelName].columns[associationModelNameAs]).type as AssociationColumn;
    if (!isAssociationColumn(coType)) {
      return null;
    }
    const { targetModel } = coType;
    let targetModelName = '';
    if (typeof targetModel !== 'string') {
      targetModelName = targetModel.name;
    } else {
      targetModelName = targetModel;
    }
    const AssociationModel = this.getSqlzModel(targetModelName);
    return {
      targetModelName: targetModel,
      model: AssociationModel,
      as: associationModelNameAs,
      include: [],
    };
  }

  getAssociationIncludeMap = (baseModelName : string, associationModelNameAsArray : AssociationModelNameAsToInclude[] = []) => {
    const includeMap = {};
    associationModelNameAsArray.forEach((item) => {
      let nameAs = '';
      let options = {};
      if (typeof item !== 'string') {
        ({ as: nameAs, ...options } = item);
        console.log('nameAs :', nameAs);
      } else {
        nameAs = item;
      }
      const [associationModelNameAs, ...rest] = nameAs.split('.'); // might like 'accountLinks.user'
      if (!includeMap[associationModelNameAs]) {
        includeMap[associationModelNameAs] = this.getAssociationIncludeData(
          baseModelName,
          associationModelNameAs,
        );
        if (rest.length === 0) {
          includeMap[associationModelNameAs] = {
            ...includeMap[associationModelNameAs],
            ...options,
          };
        }
      }
      if (rest.length > 0) {
        let tmn = '';
        const { targetModelName } = includeMap[associationModelNameAs];
        if (typeof targetModelName === 'string') {
          tmn = targetModelName;
        } else {
          tmn = targetModelName.name;
        }
        includeMap[associationModelNameAs].includeMap = {
          ...includeMap[associationModelNameAs].includeMap,
          ...this.getAssociationIncludeMap(tmn, [{
            as: rest.join('.'),
            ...options,
          }]),
        };
      }
    });
    return includeMap;
  }

  associationIncludeMapToArray = (includeMap) => {
    const result : any[] = Object.values(includeMap);
    result.forEach((include) => {
      if (include.includeMap) {
        include.include = this.associationIncludeMapToArray(include.includeMap);
        delete include.includeMap;
      }
    });
    return result;
  }

  getAssociationIncludes = (baseModelName : string, associationModelNameAsArray : AssociationModelNameAsToInclude[] = []) => {
    const includeMap = this.getAssociationIncludeMap(baseModelName, associationModelNameAsArray);
    return this.associationIncludeMapToArray(includeMap);
  }
}

Object.keys(AmmModel.columnTypes).forEach((name) => {
  AmmOrm[name] = AmmModel.columnTypes[name];
});
