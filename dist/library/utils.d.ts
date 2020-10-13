export declare type ToPromiseFunction<T> = (_: any, value: T, index: number, array: T[]) => any;
export declare function defaultToPromiseFunc<T>(_: any, value: T, index: number, array: T[]): Promise<T>;
export declare function toSeqPromise<T>(inArray: T[], toPrmiseFunc?: ToPromiseFunction<T>): Promise<void>;
export declare function promiseWait(waitMillisec: any): Promise<unknown>;
declare const defaultCallbackPromise: ({ result, error }: {
    result: any;
    error: any;
}) => Promise<any>;
declare function isFunction(object: any): boolean;
declare const toCamel: (str: any) => any;
declare const toUnderscore: (str: any) => any;
declare const capitalizeFirstLetter: (str: any) => any;
export { toCamel, toUnderscore, capitalizeFirstLetter, defaultCallbackPromise, isFunction, };
export declare function handleValueArrayForMethod(self: any, method: any, input: any, parent?: null): Promise<any[]> | undefined;
export declare function handlePromiseCallback(promise: any, parent: any, callbackPromise: any): any;
