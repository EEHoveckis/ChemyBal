// Ready the reaction for balancing
module.exports = function(equation) {
	// Spaces
	equation = equation.replace(/ /g, "");

	// Superscript Numbers
	equation = equation.replace(/²⁺/g, "^2+");
	equation = equation.replace(/³⁺/g, "^3+");
	equation = equation.replace(/⁴⁺/g, "^4+");
	equation = equation.replace(/⁵⁺/g, "^5+");
	equation = equation.replace(/⁶⁺/g, "^6+");
	equation = equation.replace(/⁷⁺/g, "^7+");
	equation = equation.replace(/⁸⁺/g, "^8+");
	equation = equation.replace(/⁹⁺/g, "^9+");
	equation = equation.replace(/²⁻/g, "^2-");
	equation = equation.replace(/³⁻/g, "^3-");
	equation = equation.replace(/⁴⁻/g, "^4-");
	equation = equation.replace(/⁵⁻/g, "^5-");
	equation = equation.replace(/⁶⁻/g, "^6-");
	equation = equation.replace(/⁷⁻/g, "^7-");
	equation = equation.replace(/⁸⁻/g, "^8-");
	equation = equation.replace(/⁹⁻/g, "^9-");
	equation = equation.replace(/⁺/g, "^+");
	equation = equation.replace(/⁻/g, "^-");

	// Subscript Numbers
	equation = equation.replace(/₁/g, "1");
	equation = equation.replace(/₂/g, "2");
	equation = equation.replace(/₃/g, "3");
	equation = equation.replace(/₄/g, "4");
	equation = equation.replace(/₅/g, "5");
	equation = equation.replace(/₆/g, "6");
	equation = equation.replace(/₇/g, "7");
	equation = equation.replace(/₈/g, "8");
	equation = equation.replace(/₉/g, "9");
	equation = equation.replace(/₀/g, "0");

	// Arrow symbol
	equation = equation.replace(/→/g, "=")

	return equation;
}
