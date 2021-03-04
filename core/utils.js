"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultToPromiseFunc = defaultToPromiseFunc;
exports.toSeqPromise = toSeqPromise;
exports.promiseWait = promiseWait;
exports.isFunction = isFunction;
exports.handleValueArrayForMethod = handleValueArrayForMethod;
exports.handlePromiseCallback = handlePromiseCallback;
exports.defaultCallbackPromise = exports.capitalizeFirstLetter = exports.toUnderscore = exports.toCamel = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function defaultToPromiseFunc(_, value, index, array) {
  return Promise.resolve(value);
}

function toSeqPromise(inArray, toPrmiseFunc = defaultToPromiseFunc) {
  return inArray.reduce((prev, curr, index, array) => prev.then(() => toPrmiseFunc(prev, curr, index, array)), Promise.resolve());
}

function promiseWait(waitMillisec) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, waitMillisec);
  });
}

const defaultCallbackPromise = ({
  result,
  error
}) => {
  if (error) {
    return Promise.reject(error);
  }

  return Promise.resolve(result);
};

exports.defaultCallbackPromise = defaultCallbackPromise;
const getClass = {}.toString;

function isFunction(object) {
  return object && getClass.call(object) === '[object Function]';
}

const toCamel = str => str.replace(/_([a-z])/g, g => g[1].toUpperCase());

exports.toCamel = toCamel;

const toUnderscore = str => str.replace(/([A-Z])/g, g => `_${g.toLowerCase()}`);

exports.toUnderscore = toUnderscore;

const capitalizeFirstLetter = str => str.charAt(0).toUpperCase() + str.slice(1);

exports.capitalizeFirstLetter = capitalizeFirstLetter;

function handleValueArrayForMethod(self, method, input, parent = null) {
  if (Array.isArray(input)) {
    return Promise.all(input.map(_input => method.call(self, _input, parent)));
  }

  if (input.values) {
    const {
      values
    } = input;

    const newArgs = _objectSpread({}, input);

    delete newArgs.values;
    return Promise.all(values.map(_value => {
      newArgs.value = _value;
      return method.call(self, newArgs, parent);
    }));
  }

  return undefined;
}

function handlePromiseCallback(promise, parent, callbackPromise) {
  let result = null;
  return promise.then(_result => {
    result = _result;
    return Promise.resolve(callbackPromise({
      result,
      parent,
      error: null
    })).then(() => result).catch(error => {
      console.log('failureInCallback');
      error.failureInCallback = true;
      return Promise.reject(error);
    });
  }).catch(error => {
    console.log('error :', error);
    return Promise.resolve(callbackPromise({
      result,
      parent,
      error
    })).then(() => result);
  });
}