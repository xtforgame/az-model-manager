import { BelongsToManyOptions as BTMO, HasOneOptions, BelongsToOptions, HasManyOptions, ThroughOptions as TO, Model, ModelDefined } from 'sequelize';
export declare type AssociationType = 'hasOne' | 'hasMany' | 'belongsTo' | 'belongsToMany';
export declare const associations: AssociationType[];
declare type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
export declare type ThroughOptions = Overwrite<TO, {
    asuThroughAs?: string;
    asuModelName?: string;
    model?: {
        name: string;
    };
}>;
export declare type BelongsToManyOptions = Overwrite<BTMO, {
    through: string | ThroughOptions;
}>;
export declare type AssociationColumnOption = BelongsToManyOptions | HasOneOptions | BelongsToOptions | HasManyOptions;
export interface AssociationColumnExtraOption {
    asuThroughAs?: string;
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
        (targetModel: string, o: BelongsToManyOptions): AssociationColumn;
        type: AssociationType;
    };
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
    (targetModel: string, o: BelongsToManyOptions): AssociationColumn;
    type: AssociationType;
};
export declare const isAssociationColumn: (columnType: any) => boolean;
export {};
