const EventEmitter = require('node:events');
const eventEmitter = new EventEmitter();

// Prepare reaction for return to user.
module.exports = function finishEquation(equation, coefs) {
	equation = equation.replace(/\^2\+/g, "²⁺");
	equation = equation.replace(/\^3\+/g, "³⁺");
	equation = equation.replace(/\^4\+/g, "⁴⁺");
	equation = equation.replace(/\^5\+/g, "⁵⁺");
	equation = equation.replace(/\^6\+/g, "⁶⁺");
	equation = equation.replace(/\^7\+/g, "⁷⁺");
	equation = equation.replace(/\^8\+/g, "⁸⁺");
	equation = equation.replace(/\^9\+/g, "⁹⁺");
	equation = equation.replace(/\^2-/g, "²⁻");
	equation = equation.replace(/\^3-/g, "³⁻");
	equation = equation.replace(/\^4-/g, "⁴⁻");
	equation = equation.replace(/\^5-/g, "⁵⁻");
	equation = equation.replace(/\^6-/g, "⁶⁻");
	equation = equation.replace(/\^7-/g, "⁷⁻");
	equation = equation.replace(/\^8-/g, "⁸⁻");
	equation = equation.replace(/\^9-/g, "⁹⁻");
	equation = equation.replace(/\^\+/g, "⁺");
	equation = equation.replace(/\^-/g, "⁻");

	equation = equation.replace(/1/g, "₁");
	equation = equation.replace(/2/g, "₂");
	equation = equation.replace(/3/g, "₃");
	equation = equation.replace(/4/g, "₄");
	equation = equation.replace(/5/g, "₅");
	equation = equation.replace(/6/g, "₆");
	equation = equation.replace(/7/g, "₇");
	equation = equation.replace(/8/g, "₈");
	equation = equation.replace(/9/g, "₉");
	equation = equation.replace(/0/g, "₀");


	let sides = equation.split("=");
	let left = sides[0];
	let right = sides[1];

	let leftDiv = left.split("+");
	let rightDiv = right.split("+");

	let coefsLeft = coefs.slice(0, leftDiv.length);
	let coefsRight = coefs.slice(leftDiv.length);

	for (var i = 0; i < leftDiv.length; i++) {
		if (coefsLeft[i] == 1) continue;
		else leftDiv[i] = coefsLeft[i] + leftDiv[i];
	}

	for (var i = 0; i < rightDiv.length; i++) {
		if (coefsRight[i] == 1) continue;
		else rightDiv[i] = coefsRight[i] + rightDiv[i];
	}

	let final = leftDiv.join(" + ") + " → " + rightDiv.join(" + ");
	return final;
};
