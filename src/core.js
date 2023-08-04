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
      return reflectedSetter(dependencyBucket, target, property, handler, val);
    },
  };

  return handler;
};

const reflectedSetter = (depBucket, target, property, handler, val) => {
  clearAndRunAllDeps(depBucket, target, property);

  if (typeof target[property] === "object") {
    return Reflect.set(target, property, proxify(val, handler));
  } else {
    return Reflect.set(target, property, val);
  }
};

export function connect(context, selector, callback) {
  const value = selector(context.proxiedObj);
  // side effect: lastVisitedTarget and lastVisitedProperty are changed on the run of selector.
  const { dependencyBucket, lastVisitedTarget, lastVisitedProperty, handler } =
    context;

  const setValue = (val) => {
    reflectedSetter(dependencyBucket, lastVisitedTarget, lastVisitedProperty, handler, val);
  };

  addDep(dependencyBucket, lastVisitedTarget, lastVisitedProperty, callback);

  return {
    value,
    setValue,
    disConnect: () => {
      dependencyBucket
        .get(lastVisitedTarget)
        .get(lastVisitedProperty)
        .delete(callback);
    },
  };
}

export function createContext(dataSource) {
  const context = {
    lastVisitedTarget: null,
    lastVisitedProperty: null,
    dependencyBucket: new Map(), // Map<Object, Map<string | symbol, () => void[]>>
    proxiedObj: null,
    handler: null,
  };

  const handler = createHandler(context);
  const proxiedObj = proxify(dataSource, handler);

  context.proxiedObj = proxiedObj;
  context.handler = handler;

  return context;
}
