import { useEffect, useState } from "react";
import { createContext, connect } from './index';

export function createStore(dataSource, reducer) {
  const context = createContext(dataSource);

  function dispatch(request) {
    const reducerAction =
      typeof request !== "function" ? reducer(request) : request;
    reducerAction(context.proxiedObj);
  }

  function useConnector(selector) {
    const [, forceUpdate] = useState({});
    const { value, disConnect } = connect(context, selector, forceUpdate);
    useEffect(() => disConnect, []);
    return value;
  }

  return {
    useConnector,
    dispatch,
  };
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

