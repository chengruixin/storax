import { createContext, connect } from "./index.js";

const dataSource = {
  name: "hello there",
  age: 55,
};
const context = createContext(dataSource);

const { value: name, disConnect: disName } = connect(
  context,
  (state) => state.name,
  () => {
    console.log("name is changed");
  }
);

const { value: age, disConnect: diaAge } = connect(
    context,
    (state) => state.age,
    () => {
      console.log("age is changed");
    }
  );

console.log(name);
context.proxiedObj.name = "abc1";

console.log(age);
context.proxiedObj.age = 10;