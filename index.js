const calculate = require("./modules/calculate.js");
const finishEquation = require("./modules/finishEquation.js");
const readyEquation = require("./modules/readyEquation.js");

module.exports = function(equation) {
	equation = readyEquation(equation);

	const coefs = calculate(equation);
	if (typeof coefs != "object") return;
	else return finishEquation(equation, coefs);
};

module.exports.coefsOnly = function(equation) {
	equation = readyEquation(equation);

	const coefs = calculate(equation);
	if (typeof coefs != "object") return;
	else return coefs;
};
