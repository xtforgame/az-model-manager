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

function toSeqPromise(inArray) {
  var toPrmiseFunc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultToPromiseFunc;
  return inArray.reduce(function (prev, curr, index, array) {
    return prev.then(function () {
      return toPrmiseFunc(prev, curr, index, array);
    });
  }, Promise.resolve());
}

function promiseWait(waitMillisec) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, waitMillisec);
  });
}

var defaultCallbackPromise = function defaultCallbackPromise(_ref) {
  var result = _ref.result,
      error = _ref.error;

  if (error) {
    return Promise.reject(error);
  }

  return Promise.resolve(result);
};

exports.defaultCallbackPromise = defaultCallbackPromise;
var getClass = {}.toString;

function isFunction(object) {
  return object && getClass.call(object) === '[object Function]';
}

var toCamel = function toCamel(str) {
  return str.replace(/_([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
};

exports.toCamel = toCamel;

var toUnderscore = function toUnderscore(str) {
  return str.replace(/([A-Z])/g, function (g) {
    return "_".concat(g.toLowerCase());
  });
};

exports.toUnderscore = toUnderscore;

var capitalizeFirstLetter = function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

exports.capitalizeFirstLetter = capitalizeFirstLetter;

function handleValueArrayForMethod(self, method, input) {
  var parent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  if (Array.isArray(input)) {
    return Promise.all(input.map(function (_input) {
      return method.call(self, _input, parent);
    }));
  }

  if (input.values) {
    var values = input.values;

    var newArgs = _objectSpread({}, input);

    delete newArgs.values;
    return Promise.all(values.map(function (_value) {
      newArgs.value = _value;
      return method.call(self, newArgs, parent);
    }));
  }

  return undefined;
}

function handlePromiseCallback(promise, parent, callbackPromise) {
  var result = null;
  return promise.then(function (_result) {
    result = _result;
    return Promise.resolve(callbackPromise({
      result: result,
      parent: parent,
      error: null
    })).then(function () {
      return result;
    })["catch"](function (error) {
      console.log('failureInCallback');
      error.failureInCallback = true;
      return Promise.reject(error);
    });
  })["catch"](function (error) {
    console.log('error :', error);
    return Promise.resolve(callbackPromise({
      result: result,
      parent: parent,
      error: error
    })).then(function () {
      return result;
    });
  });
}