<h1 align="center">⚗️ chemybal</h1>
<p align="center">Simple Chemical Equation Balancer</p>

## 📝 Description
chemybal - Simple chemical equation balancer. Calculates and inserts coefficients in any valid equation.


## 🔧 Setup
chemybal is easy to setup, just do:
```sh
npm i chemybal
```

## 📕 Usage
To require chemybal in your program do:
```js
const chemybal = require("chemybal");
```
Ways to call chemybal from your program:

```js
const equation = "Mg + HCl = MgCl2 + H2";
console.log(chemybal(equation));

/* Output:
Mg + 2 HCl = MgCl2 + H2
*/
```


## 📰 Notes
* **(1.0.0 - 1.0.1)** Equations involving oxidation numbers and electrons result an incorrect result. Fixed in **(^1.0.2)**
* **(^1.0.2)** This module understands both normal numbers and subscripts. You don't have to specifically convert them.

## 👨‍⚖️ License
[chemybal](https://github.com/EEHoveckis/chemybal) by [EEHoveckis](https://github.com/EEHoveckis) is licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).\
Permissions beyond the scope of this license may be available on request.\
[![Creative Commons Attribution 4.0 International License](https://i.creativecommons.org/l/by/4.0/88x31.png)](https://creativecommons.org/licenses/by/4.0/)
