const calculate = require("./modules/calculate.js");

module.exports = function(formulaStr) {
	const coefs = calculate(formulaStr);
	if (typeof coefs != "object") return;
	else return finishEquation(formulaStr, coefs);
}

// Prepare reaction for return to user.
function finishEquation(input, coefs) {
	let sides = input.split("=");
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

	let final = leftDiv.join(" + ") + " = " + rightDiv.join(" + ");
	return final;
}
