import React, { useEffect, useState } from 'react';

console.info('Respondx react version', React.version);

function proxify(obj, handler) {
  const plainObj = {};
  const referenceObj = {};

  for (const key of Object.keys(obj)) {
    if (typeof obj[key] !== 'object') {
      plainObj[key] = obj[key];
    } else {
      referenceObj[key] = obj[key];
    }
  }
  const plainProxied = new Proxy(plainObj, handler);

  for (const key of Object.keys(referenceObj)) {
    referenceObj[key] = proxify(referenceObj[key], handler);
  }

  const res = new Proxy({
    ...plainProxied,
    ...referenceObj
  }, handler);

  return res;
}

const createHandler = (context) => {
  const res = {
    get(target, property) {
      context.lastTarget = target;
      context.lastProperty = property;
      return Reflect.get(...arguments);
    },
    set(target, property, val) {
      const { varReference } = context;

      if (varReference.has(target) && varReference.get(target).has(property)) {
        const callbackArr = varReference.get(target).get(property);
        while (callbackArr.length) {
          callbackArr.shift()();
        }
      } 
  
      if (typeof target[property] === 'object') {
        const proxied = proxify(val, res);
        return Reflect.set(target, property, proxied);
      }

      return Reflect.set(...arguments);
    }
  }

  return res;
}

function connect(context, selector, callback) {
  const value = selector(context.proxiedObj);
  const {
    varReference,
    lastTarget,
    lastProperty
  } = context;

  if (!varReference.has(lastTarget)) {
    varReference.set(context.lastTarget, new Map());
  }

  if (!varReference.get(lastTarget).has(lastProperty)) {
    varReference.get(lastTarget).set(lastProperty, []);
  }
  
  varReference.get(lastTarget).get(lastProperty).push(() => {
    callback();
  });

  return {
    value,
    disConnect: () => {
      const toDeleteIndex = varReference.get(lastTarget).get(lastProperty).indexOf(callback);
      varReference.get(lastTarget).get(lastProperty).splice(toDeleteIndex, 1);
    }
  };
}

function createContext(dataSource) {
  const context = {
    lastTarget: null,
    lastProperty: null,
    varReference: new Map(),
    proxiedObj: null
  };

  const handler = createHandler(context);
  const proxiedObj = proxify(dataSource, handler);

  context.proxiedObj = proxiedObj;

  return context;
}

export function createStore(dataSource, reducer) {
  const context = createContext(dataSource);

  function dispatch(request) {
    const reducerAction = typeof request !== 'function' ? reducer(request) : request;
    reducerAction(context.proxiedObj);
  }

  function useConnector(selector) {
    const [, forceUpdate] = useState({});
    const { value, disConnect } = connect(context, selector, () => {
      forceUpdate({});
    });
    useEffect(() => disConnect, []);
    return value;
  }

  return {
    useConnector,
    dispatch
  }
}

export function combineAllReducers(...reducers) {
  return chunkData => {
    for (let i = 0; i < reducers.length; i++) {
      const reducerAction = reducers[i](chunkData)
      if (reducerAction) {
        return reducerAction;
      }
    }
    return null;
  }
}