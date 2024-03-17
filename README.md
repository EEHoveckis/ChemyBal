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
// Standard mode
const equation = "Mg + HCl → MgCl₂ + H₂";
console.log(chemybal(equation));

/* Output:
Mg + 2HCl → MgCl₂ + H₂
*/
```
```js
// Coefficients Only - ^1.0.3
const equation = "H₂SO₄ + Cu → CuSO₄ + H₂O + SO₂"
console.log(chemybal.coefsOnly(equation));

/*
Output:
[ 2, 1, 1, 2, 1 ]
*/
```

## 📰 Notes
* **(1.0.0 - 1.0.1)** Equations with oxidation numbers result an incorrect result. Fixed in **(^1.0.2)**
* **(^1.0.2)** This module understands super/subscript numbers. No need to convert to normal numbers.
* **(^1.0.2)** In equations you can use both `"="` and `"→"`. Module understands both.

## 👨‍⚖️ License
[chemybal](https://github.com/EEHoveckis/chemybal) by [EEHoveckis](https://github.com/EEHoveckis) is licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).\
Permissions beyond the scope of this license may be available on request.\
[![Creative Commons Attribution 4.0 International License](https://i.creativecommons.org/l/by/4.0/88x31.png)](https://creativecommons.org/licenses/by/4.0/)
