import { createContext, connect } from './index.js';

const dataSource = {
    name: 'chengruixin.ray',
    age: 23
}
const context = createContext(dataSource);

const { value, disConnect } = connect(context, state => state.name, () => {
    console.log('name is changed');
});

console.log(value);
context.proxiedObj.name = "abc";
