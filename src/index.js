const clearAndRunAllDeps = (dependencyBucket, target, property) => {
  if (
    dependencyBucket.has(target) &&
    dependencyBucket.get(target).has(property)
  ) {
    const callbackSet = dependencyBucket.get(target).get(property);
    const callbackArr = Array.from(callbackSet);
    for (const callback of callbackArr) {
      callback({});
    }
    callbackSet.clear();
  }
};

const addDep = (dependencyBucket, target, property, dep) => {
  // prepare for non target
  if (!dependencyBucket.has(target)) {
    dependencyBucket.set(target, new Map());
  }

  // prepare for non property on target
  if (!dependencyBucket.get(target).has(property)) {
    dependencyBucket.get(target).set(property, new Set());
  }

  // real add dep operation
  dependencyBucket.get(target).get(property).add(dep);
};

function proxify(obj, handler) {
  const plainObj = {};
  const referenceObj = {};

  for (const key of Object.keys(obj)) {
    if (typeof obj[key] !== "object") {
      plainObj[key] = obj[key];
    } else {
      referenceObj[key] = obj[key];
    }
  }
  const plainProxied = new Proxy(plainObj, handler);

  for (const key of Object.keys(referenceObj)) {
    referenceObj[key] = proxify(referenceObj[key], handler);
  }

  const res = new Proxy(
    {
      ...plainProxied,
      ...referenceObj,
    },
    handler
  );

  return res;
}

const createHandler = (context) => {
  const handler = {
    get(target, property) {
      context.lastVisitedTarget = target;
      context.lastVisitedProperty = property;

      return Reflect.get(...arguments);
    },
    set(target, property, val) {
      const { dependencyBucket } = context;

      clearAndRunAllDeps(dependencyBucket, target, property);

      // only handle with object is not enough, may be array's handler is not in such an operation
      if (typeof target[property] === "object") {
        const proxied = proxify(val, handler);
        return Reflect.set(target, property, proxied);
      }

      return Reflect.set(...arguments);
    },
  };

  return handler;
};

export function connect(context, selector, callback) {
  const value = selector(context.proxiedObj);
  // side effect: lastVisitedTarget and lastVisitedProperty are changed on the run of selector.
  const { dependencyBucket, lastVisitedTarget, lastVisitedProperty } = context;

  addDep(dependencyBucket, lastVisitedTarget, lastVisitedProperty, callback);

  return {
    value,
    disConnect: () => {
      dependencyBucket.get(lastVisitedTarget).get(lastVisitedProperty).delete(callback);
    },
  };
}

export function createContext(dataSource) {
  const context = {
    lastVisitedTarget: null,
    lastVisitedProperty: null,
    dependencyBucket: new Map(), // Map<Object, Map<string | symbol, () => void[]>>
    proxiedObj: null,
  };

  const handler = createHandler(context);
  const proxiedObj = proxify(dataSource, handler);

  context.proxiedObj = proxiedObj;

  return context;
}
