"use strict";

module.exports = function(formulaStr) {
	let eqn;
	try {
		eqn = new Parser(formulaStr).parseEquation();
	} catch (e) {
		if (e instanceof ParseError) {
			throw "Syntax error: " + e.message;
		} else if (e instanceof Error) {
			throw "Syntax error: " + e.message;
		} else {
			throw "Assertion error!";
		}
		return;
	}
	try {
		let matrix = buildMatrix(eqn); // Set up matrix
		solve(matrix); // Solve linear system
		const coefs = extractCoefficients(matrix); // Get coefficients
		checkAnswer(eqn, coefs); // Self-test, should not fail
		return coefs;
	} catch (e) {
		console.log(e.message);
	}
};

class Parser {
	constructor(formulaStr) {
		this.tok = new Tokenizer(formulaStr);
	}
	// Parses and returns an equation.
	parseEquation() {
		let lhs = [this.parseTerm()];
		while (true) {
			const next = this.tok.peek();
			if (next == "+") {
				this.tok.consume(next);
				lhs.push(this.parseTerm());
			} else if (next == "=") {
				this.tok.consume(next);
				break;
			} else
				throw new ParseError("Plus or equal sign expected");
		}
		let rhs = [this.parseTerm()];
		while (true) {
			const next = this.tok.peek();
			if (next === null)
				break;
			else if (next == "+") {
				this.tok.consume(next);
				rhs.push(this.parseTerm());
			} else
				throw new ParseError("Plus or end expected");
		}
		return new Equation(lhs, rhs);
	}
	// Parses and returns a term.
	parseTerm() {
		const startPos = this.tok.pos;
		// Parse groups and elements
		let items = [];
		let electron = false;
		let next;
		while (true) {
			next = this.tok.peek();
			if (next == "(")
				items.push(this.parseGroup());
			else if (next == "e") {
				this.tok.consume(next);
				electron = true;
			} else if (next !== null && /^[A-Z][a-z]*$/.test(next))
				items.push(this.parseElement());
			else if (next !== null && /^[0-9]+$/.test(next))
				throw new ParseError("Invalid term - number not expected");
			else
				break;
		}
		// Parse optional charge
		let charge = null;
		if (next == "^") {
			this.tok.consume(next);
			next = this.tok.peek();
			if (next === null)
				throw new ParseError("Number or sign expected");
			else {
				charge = this.parseOptionalNumber();
				next = this.tok.peek();
			}
			if (next == "+")
				charge = +charge; // No-op
			else if (next == "-")
				charge = -charge;
			else
				throw new ParseError("Sign expected");
			this.tok.take(); // Consume the sign
		}
		// Check and postprocess term
		if (electron) {
			if (items.length > 0)
				throw new ParseError("Invalid term - electron needs to stand alone");
			if (charge === null) // Allow omitting the charge
				charge = -1;
			if (charge != -1)
				throw new ParseError("Invalid term - invalid charge for electron");
		} else {
			if (items.length == 0)
				throw new ParseError("Invalid term - empty");
			if (charge === null)
				charge = 0;
		}
		return new Term(items, charge);
	}
	// Parses and returns a group.
	parseGroup() {
		const startPos = this.tok.pos;
		this.tok.consume("(");
		let items = [];
		while (true) {
			const next = this.tok.peek();
			if (next == "(")
				items.push(this.parseGroup());
			else if (next !== null && /^[A-Z][a-z]*$/.test(next))
				items.push(this.parseElement());
			else if (next == ")") {
				this.tok.consume(next);
				if (items.length == 0)
					throw new ParseError("Empty group");
				break;
			} else
				throw new ParseError("Element, group, or closing parenthesis expected");
		}
		return new Group(items, this.parseOptionalNumber());
	}
	// Parses and returns an element.
	parseElement() {
		const name = this.tok.take();
		if (!/^[A-Z][a-z]*$/.test(name))
			throw new Error("Assertion error");
		return new ChemElem(name, this.parseOptionalNumber());
	}
	// Parses a number if it's the next token, returning a non-negative integer, with a default of 1.
	parseOptionalNumber() {
		const next = this.tok.peek();
		if (next !== null && /^[0-9]+$/.test(next))
			return checkedParseInt(this.tok.take());
		else
			return 1;
	}
}

class Tokenizer {
	constructor(str) {
		this.str = str.replace(/\u2212/g, "-");
		this.pos = 0;
		this.skipSpaces();
	}
	// Returns the next token as a string, or null if the end of the token stream is reached.
	peek() {
		if (this.pos == this.str.length) // End of stream
			return null;
		const match = /^([A-Za-z][a-z]*|[0-9]+|[+\-^=()])/.exec(this.str.substring(this.pos));
		if (match === null)
			throw new ParseError("Invalid symbol");
		return match[0];
	}
	// Returns the next token as a string and advances this tokenizer past the token.
	take() {
		const result = this.peek();
		if (result === null)
			throw new Error("Advancing beyond last token");
		this.pos += result.length;
		this.skipSpaces();
		return result;
	}
	// Takes the next token and checks that it matches the given string, or throws an exception.
	consume(s) {
		if (this.take() != s)
			throw new Error("Token mismatch");
	}
	skipSpaces() {
		const match = /^[ \t]*/.exec(this.str.substring(this.pos));
		if (match === null)
			throw new Error("Assertion error");
		this.pos += match[0].length;
	}
}

class ParseError extends Error {
	constructor(message) {
		super(message);
		Object.setPrototypeOf(this, ParseError.prototype); // ECMAScript 5 compatibility
	}
}

/*---- Chemical equation data types ----*/
// A complete chemical equation. It has a left-hand side list of terms and a right-hand side list of terms.
// For example: H2 + O2 -> H2O.
class Equation {
	constructor(lhs, rhs) {
		// Make defensive copies
		this.leftSide = lhs.slice();
		this.rightSide = rhs.slice();
	}
	// Returns an array of the names all of the elements used in this equation.
	// The array represents a set, so the items are in an arbitrary order and no item is repeated.
	getElements() {
		const result = new Set();
		for (const item of this.leftSide.concat(this.rightSide))
			item.getElements(result);
		return Array.from(result);
	}
}

// A term in a chemical equation. It has a list of groups or elements, and a charge.
// For example: H3O^+, or e^-.
class Term {
	constructor(items, charge) {
		if (items.length == 0 && charge != -1)
			throw new RangeError("Invalid term"); // Electron case
		this.items = items.slice();
		this.charge = charge;
	}
	getElements(resultSet) {
		resultSet.add("e");
		for (const item of this.items)
			item.getElements(resultSet);
	}
	// Counts the number of times the given element (specified as a string) occurs in this term, taking groups and counts into account, returning an integer.
	countElement(name) {
		if (name == "e") {
			return -this.charge;
		} else {
			let sum = 0;
			for (const item of this.items)
				sum = checkedAdd(sum, item.countElement(name));
			return sum;
		}
	}
}

// A group in a term. It has a list of groups or elements.
// For example: (OH)3
class Group {
	constructor(items, count) {
		if (count < 1)
			throw new RangeError("Assertion error: Count must be a positive integer");
		this.items = items.slice();
		this.count = count;
	}
	getElements(resultSet) {
		for (const item of this.items)
			item.getElements(resultSet);
	}
	countElement(name) {
		let sum = 0;
		for (const item of this.items)
			sum = checkedAdd(sum, checkedMultiply(item.countElement(name), this.count));
		return sum;
	}
}

// A chemical element.
// For example: Na, F2, Ace, Uuq6
class ChemElem {
	constructor(name, count) {
		this.name = name;
		this.count = count;
		if (count < 1)
			throw new RangeError("Assertion error: Count must be a positive integer");
	}
	getElements(resultSet) {
		resultSet.add(this.name);
	}
	countElement(n) {
		return n == this.name ? this.count : 0;
	}
}

/*---- Core number-processing fuctions ----*/
// A matrix of integers.
class Matrix {
	constructor(numRows, numCols) {
		this.numRows = numRows;
		this.numCols = numCols;
		if (numRows < 0 || numCols < 0)
			throw new RangeError("Illegal argument");
		// Initialize with zeros
		let row = [];
		for (let j = 0; j < numCols; j++)
			row.push(0);
		this.cells = []; // Main data (the matrix)
		for (let i = 0; i < numRows; i++)
			this.cells.push(row.slice());
	}
	/* Accessor functions */
	// Returns the value of the given cell in the matrix, where r is the row and c is the column.
	get(r, c) {
		if (r < 0 || r >= this.numRows || c < 0 || c >= this.numCols)
			throw new RangeError("Index out of bounds");
		return this.cells[r][c];
	}
	// Sets the given cell in the matrix to the given value, where r is the row and c is the column.
	set(r, c, val) {
		if (r < 0 || r >= this.numRows || c < 0 || c >= this.numCols)
			throw new RangeError("Index out of bounds");
		this.cells[r][c] = val;
	}
	/* Private helper functions for gaussJordanEliminate() */
	// Swaps the two rows of the given indices in this matrix. The degenerate case of i == j is allowed.
	swapRows(i, j) {
		if (i < 0 || i >= this.numRows || j < 0 || j >= this.numRows)
			throw new RangeError("Index out of bounds");
		const temp = this.cells[i];
		this.cells[i] = this.cells[j];
		this.cells[j] = temp;
	}
	// Returns a new row that is the sum of the two given rows. The rows are not indices.
	// For example, addRow([3, 1, 4], [1, 5, 6]) = [4, 6, 10].
	static addRows(x, y) {
		let z = [];
		for (let i = 0; i < x.length; i++)
			z.push(checkedAdd(x[i], y[i]));
		return z;
	}
	// Returns a new row that is the product of the given row with the given scalar. The row is is not an index.
	// For example, multiplyRow([0, 1, 3], 4) = [0, 4, 12].
	static multiplyRow(x, c) {
		return x.map(val => checkedMultiply(val, c));
	}
	// Returns the GCD of all the numbers in the given row. The row is is not an index.
	// For example, gcdRow([3, 6, 9, 12]) = 3.
	static gcdRow(x) {
		let result = 0;
		for (const val of x)
			result = gcd(val, result);
		return result;
	}
	// Returns a new row where the leading non-zero number (if any) is positive, and the GCD of the row is 0 or 1.
	// For example, simplifyRow([0, -2, 2, 4]) = [0, 1, -1, -2].
	static simplifyRow(x) {
		let sign = 0;
		for (const val of x) {
			if (val != 0) {
				sign = Math.sign(val);
				break;
			}
		}
		if (sign == 0)
			return x.slice();
		const g = Matrix.gcdRow(x) * sign;
		return x.map(val => val / g);
	}
	// Changes this matrix to reduced row echelon form (RREF), except that each leading coefficient is not necessarily 1. Each row is simplified.
	gaussJordanEliminate() {
		// Simplify all rows
		let cells = this.cells = this.cells.map(Matrix.simplifyRow);
		// Compute row echelon form (REF)
		let numPivots = 0;
		for (let i = 0; i < this.numCols; i++) {
			// Find pivot
			let pivotRow = numPivots;
			while (pivotRow < this.numRows && cells[pivotRow][i] == 0)
				pivotRow++;
			if (pivotRow == this.numRows)
				continue;
			const pivot = cells[pivotRow][i];
			this.swapRows(numPivots, pivotRow);
			numPivots++;
			// Eliminate below
			for (let j = numPivots; j < this.numRows; j++) {
				const g = gcd(pivot, cells[j][i]);
				cells[j] = Matrix.simplifyRow(Matrix.addRows(Matrix.multiplyRow(cells[j], pivot / g), Matrix.multiplyRow(cells[i], -cells[j][i] / g)));
			}
		}
		// Compute reduced row echelon form (RREF), but the leading coefficient need not be 1
		for (let i = this.numRows - 1; i >= 0; i--) {
			// Find pivot
			let pivotCol = 0;
			while (pivotCol < this.numCols && cells[i][pivotCol] == 0)
				pivotCol++;
			if (pivotCol == this.numCols)
				continue;
			const pivot = cells[i][pivotCol];
			// Eliminate above
			for (let j = i - 1; j >= 0; j--) {
				const g = gcd(pivot, cells[j][pivotCol]);
				cells[j] = Matrix.simplifyRow(Matrix.addRows(Matrix.multiplyRow(cells[j], pivot / g), Matrix.multiplyRow(cells[i], -cells[j][pivotCol] / g)));
			}
		}
	}
}

// Returns a matrix based on the given equation object.
function buildMatrix(eqn) {
	let elems = eqn.getElements();
	let lhs = eqn.leftSide;
	let rhs = eqn.rightSide;
	let matrix = new Matrix(elems.length + 1, lhs.length + rhs.length + 1);
	elems.forEach((elem, i) => {
		let j = 0;
		for (const term of lhs) {
			matrix.set(i, j, term.countElement(elem));
			j++;
		}
		for (const term of rhs) {
			matrix.set(i, j, -term.countElement(elem));
			j++;
		}
	});
	return matrix;
}

function solve(matrix) {
	matrix.gaussJordanEliminate();

	function countNonzeroCoeffs(row) {
		let count = 0;
		for (let i = 0; i < matrix.numCols; i++) {
			if (matrix.get(row, i) != 0)
				count++;
		}
		return count;
	}
	// Find row with more than one non-zero coefficient
	let i;
	for (i = 0; i < matrix.numRows - 1; i++) {
		if (countNonzeroCoeffs(i) > 1)
			break;
	}
	if (i == matrix.numRows - 1)
		throw new RangeError("All-zero solution"); // Unique solution with all coefficients zero
	// Add an inhomogeneous equation
	matrix.set(matrix.numRows - 1, i, 1);
	matrix.set(matrix.numRows - 1, matrix.numCols - 1, 1);
	matrix.gaussJordanEliminate();
}

function extractCoefficients(matrix) {
	const rows = matrix.numRows;
	const cols = matrix.numCols;
	if (cols - 1 > rows || matrix.get(cols - 2, cols - 2) == 0)
		throw new RangeError("Multiple independent solutions");
	let lcm = 1;
	for (let i = 0; i < cols - 1; i++)
		lcm = checkedMultiply(lcm / gcd(lcm, matrix.get(i, i)), matrix.get(i, i));
	let coefs = [];
	for (let i = 0; i < cols - 1; i++)
		coefs.push(checkedMultiply(lcm / matrix.get(i, i), matrix.get(i, cols - 1)));
	if (coefs.every(x => x == 0))
		throw new RangeError("Assertion error: All-zero solution");
	return coefs;
}

// Throws an exception if there's a problem, otherwise returns silently.
function checkAnswer(eqn, coefs) {
	if (coefs.length != eqn.leftSide.length + eqn.rightSide.length)
		throw new Error("Assertion error: Mismatched length");

	function isZero(x) {
		if (typeof x != "number" || isNaN(x) || Math.floor(x) != x)
			throw new Error("Assertion error: Not an integer");
		return x == 0;
	}
	if (coefs.every(isZero))
		throw new Error("Assertion error: All-zero solution");
	for (const elem of eqn.getElements()) {
		let sum = 0;
		let j = 0;
		for (const term of eqn.leftSide) {
			sum = checkedAdd(sum, checkedMultiply(term.countElement(elem), coefs[j]));
			j++;
		}
		for (const term of eqn.rightSide) {
			sum = checkedAdd(sum, checkedMultiply(term.countElement(elem), -coefs[j]));
			j++;
		}
		if (sum != 0)
			throw new Error("Assertion error: Incorrect balance");
	}
}

/*---- Simple math functions ----*/
const INT_MAX = 9007199254740992; // 2^53

// Returns the given string parsed into a number, or throws an exception if the result is too large.
function checkedParseInt(str) {
	const result = parseInt(str, 10);
	if (isNaN(result))
		throw new RangeError("Not a number");
	return checkOverflow(result);
}

// Returns the sum of the given integers, or throws an exception if the result is too large.
function checkedAdd(x, y) {
	return checkOverflow(x + y);
}
// Returns the product of the given integers, or throws an exception if the result is too large.
function checkedMultiply(x, y) {
	return checkOverflow(x * y);
}
// Throws an exception if the given integer is too large, otherwise returns it.
function checkOverflow(x) {
	if (Math.abs(x) >= INT_MAX)
		throw new RangeError("Arithmetic overflow");
	return x;
}
// Returns the greatest common divisor of the given integers.
function gcd(x, y) {
	if (typeof x != "number" || typeof y != "number" || isNaN(x) || isNaN(y))
		throw new Error("Invalid argument");
	x = Math.abs(x);
	y = Math.abs(y);
	while (y != 0) {
		const z = x % y;
		x = y;
		y = z;
	}
	return x;
}
