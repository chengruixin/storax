# storax

## 1. Create Store
use `createStore` to create a store globally accessded
```js
const { dispatch, useConnector } = createStore({ count: 0 });
```

## 2. Read Operation
use `useConnector` to access properties in that store
```js
const count = useConnector((state) => state.count);
```

## 3. Write Operation
use `dispatch` to update properties
```js
dispatch((state) => (state.count = state.count + 1));
```

### Just keep in mind
both write and read operation interfaces only accept function. all you need to do is to play around with the 1st arg that the func passes to you.
```js
useConnector((beAnyNameOfTheArg) => beAnyNameOfTheArg.prop1.subProp2);

dispath((beAnyNameOfTheArg) => {
  beAnyNameOfTheArg.prop1 += 10;
  beAnyNameOfTheArg.prop2 += "any thing";
});
```

## 4. Full example
```js
import { createStore } from "respondx";

const { dispatch, useConnector } = createStore({ count: 0 });

function App() {
  const count = useConnector((state) => state.count);
  return (
    <div>
      {count}

      <button
        onClick={() => {
          dispatch((state) => (state.count = state.count + 1));
        }}
      >
        click
      </button>
    </div>
  );
}

export default App;
```

