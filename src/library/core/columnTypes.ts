import {
  BelongsToManyOptions as BTMO,
  HasOneOptions,
  BelongsToOptions,
  HasManyOptions,

  ThroughOptions as TO,

  Model,
  ModelDefined,
} from 'sequelize';

export {
  HasOneOptions,
  BelongsToOptions,
  HasManyOptions,
} from 'sequelize';

import {
  Overwrite,
} from './utils';

export type AssociationTypeHasOne = 'hasOne';
export type AssociationTypeHasMany = 'hasMany';
export type AssociationTypeBelongsTo = 'belongsTo';
export type AssociationTypeBelongsToMany = 'belongsToMany';

export type AssociationType = AssociationTypeHasOne | AssociationTypeHasMany | AssociationTypeBelongsTo | AssociationTypeBelongsToMany;

export const associations : AssociationType[] = [
  'hasOne',
  'hasMany',
  'belongsTo',
  'belongsToMany',
];

export type ThroughOptions = Overwrite<TO, {
  ammModelName: string;
  ammThroughAs?: string;
  model?: {
    name : string;
  };
}>;

export type BelongsToManyOptions = Overwrite<BTMO, {
  through: string | ThroughOptions;
}>;

export type AssociationColumnOption = BelongsToManyOptions | HasOneOptions | BelongsToOptions | HasManyOptions;

export interface AssociationColumnExtraOption {
  ammThroughAs? : string;
}

export class AssociationColumn {
  key: string;

  type : AssociationType;
  targetModel : string | ModelDefined<Model, any>;
  options : AssociationColumnOption;
  extraOptions : AssociationColumnExtraOption;
  as : string;

  constructor(type : AssociationType, targetModel : string, options : AssociationColumnOption = {}, extraOptions : AssociationColumnExtraOption = {}) {
    if (!type) {
      throw new Error('ASSOCIATION must has a type argument');
    }
    this.key = type;
    this.type = type;
    this.targetModel = targetModel;
    this.options = options;
    this.extraOptions = extraOptions;
    this.as = '';
  }

  setAs(as : string) {
    this.as = as;
  }

  warn(link: string, text: string) {}
}

export const ASSOCIATION = (type : AssociationType, targetModel : string, options : AssociationColumnOption, extraOptions : AssociationColumnExtraOption = {}) => {
  if (!type) {
    throw new Error('ASSOCIATION must has a type argument');
  }
  return new AssociationColumn(type, targetModel, options, extraOptions);
};

export const HAS_ONE = (targetModel : string, options : HasOneOptions) => ASSOCIATION(HAS_ONE.type, targetModel, options);
HAS_ONE.type = <AssociationType>'hasOne';

export const HAS_MANY = (targetModel : string, options : HasManyOptions) => ASSOCIATION(HAS_MANY.type, targetModel, options);
HAS_MANY.type = <AssociationType>'hasMany';

export const BELONGS_TO = (targetModel : string, options : BelongsToOptions) => ASSOCIATION(BELONGS_TO.type, targetModel, options);
BELONGS_TO.type = <AssociationType>'belongsTo';

export const BELONGS_TO_MANY = (targetModel : string, o : BelongsToManyOptions) => {
  const options = { ...o };

  const extraOptions : AssociationColumnExtraOption = {};
  if (typeof options.through === 'string') {
    extraOptions.ammThroughAs = options.through;
  } else if ((options.through as ThroughOptions).ammThroughAs) {
    extraOptions.ammThroughAs = (options.through as ThroughOptions).ammThroughAs;
    delete (options.through as ThroughOptions).ammThroughAs;
  } else if ((options.through as ThroughOptions).ammModelName) {
    extraOptions.ammThroughAs = (options.through as ThroughOptions).ammModelName;
  } else {
    extraOptions.ammThroughAs = (options.through as ThroughOptions).model!.name;
  }
  return ASSOCIATION(BELONGS_TO_MANY.type, targetModel, options, extraOptions);
};
BELONGS_TO_MANY.type = <AssociationType>'belongsToMany';

ASSOCIATION.HAS_ONE = HAS_ONE;
ASSOCIATION.HAS_MANY = HAS_MANY;
ASSOCIATION.BELONGS_TO = BELONGS_TO;
ASSOCIATION.BELONGS_TO_MANY = BELONGS_TO_MANY;

export const isAssociationColumn = columnType => columnType instanceof AssociationColumn;
