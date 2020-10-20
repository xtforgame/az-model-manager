import { BelongsToManyOptions as BTMO, HasOneOptions, BelongsToOptions, HasManyOptions, ThroughOptions as TO, Model, ModelDefined } from 'sequelize';
export { HasOneOptions, BelongsToOptions, HasManyOptions, } from 'sequelize';
import { Overwrite } from './utils';
export declare type AssociationTypeHasOne = 'hasOne';
export declare type AssociationTypeHasMany = 'hasMany';
export declare type AssociationTypeBelongsTo = 'belongsTo';
export declare type AssociationTypeBelongsToMany = 'belongsToMany';
export declare type AssociationType = AssociationTypeHasOne | AssociationTypeHasMany | AssociationTypeBelongsTo | AssociationTypeBelongsToMany;
export declare const associations: AssociationType[];
export declare type ThroughOptions = Overwrite<TO, {
    ammModelName: string;
    ammThroughAs?: string;
    model?: {
        name: string;
    };
}>;
export declare type BelongsToManyOptions = Overwrite<BTMO, {
    through: string | ThroughOptions;
}>;
export declare type AssociationColumnOption = BelongsToManyOptions | HasOneOptions | BelongsToOptions | HasManyOptions;
export interface AssociationColumnExtraOption {
    ammThroughAs?: string;
}
export declare class AssociationColumn {
    key: string;
    type: AssociationType;
    targetModel: string | ModelDefined<Model, any>;
    options: AssociationColumnOption;
    extraOptions: AssociationColumnExtraOption;
    as: string;
    constructor(type: AssociationType, targetModel: string, options?: AssociationColumnOption, extraOptions?: AssociationColumnExtraOption);
    setAs(as: string): void;
    warn(link: string, text: string): void;
}
export declare const ASSOCIATION: {
    (type: AssociationType, targetModel: string, options: AssociationColumnOption, extraOptions?: AssociationColumnExtraOption): AssociationColumn;
    HAS_ONE: {
        (targetModel: string, options: HasOneOptions): AssociationColumn;
        type: AssociationType;
    };
    HAS_MANY: {
        (targetModel: string, options: HasManyOptions): AssociationColumn;
        type: AssociationType;
    };
    BELONGS_TO: {
        (targetModel: string, options: BelongsToOptions): AssociationColumn;
        type: AssociationType;
    };
    BELONGS_TO_MANY: {
        (targetModel: string, o: Overwrite<BTMO, {
            through: string | Overwrite<TO, {
                ammModelName: string;
                ammThroughAs?: string | undefined;
                model?: {
                    name: string;
                } | undefined;
            }>;
        }>): AssociationColumn;
        type: AssociationType;
    };
};
export declare type AssociationCreator = {
    type: AssociationType;
};
export declare const HAS_ONE: {
    (targetModel: string, options: HasOneOptions): AssociationColumn;
    type: AssociationType;
};
export declare const HAS_MANY: {
    (targetModel: string, options: HasManyOptions): AssociationColumn;
    type: AssociationType;
};
export declare const BELONGS_TO: {
    (targetModel: string, options: BelongsToOptions): AssociationColumn;
    type: AssociationType;
};
export declare const BELONGS_TO_MANY: {
    (targetModel: string, o: Overwrite<BTMO, {
        through: string | Overwrite<TO, {
            ammModelName: string;
            ammThroughAs?: string | undefined;
            model?: {
                name: string;
            } | undefined;
        }>;
    }>): AssociationColumn;
    type: AssociationType;
};
export declare const isAssociationColumn: (columnType: any) => boolean;
