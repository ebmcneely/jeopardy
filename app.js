// empty array that will eventually hold the game board
let categoriesArray = [];

// This function returns an array of category ids from the jeopardy api
async function getCategoryIds() {
	let res = await axios.get('https://jservice.io/api/categories?count=100');
	let categoryIds = res.data.map((categories) => categories.id);
	return _.sampleSize(categoryIds, 6);
}

// This function returns information about the random categories and maps it into an object that includes the question, the answer and 5 random clues
async function getCategory (categoryId) {
	let res = await axios.get(`https://jservice.io/api/category?id=${categoryId}`);
	let shuffleClues = _.sampleSize(res.data.clues, 5);
	let clueObject = shuffleClues.map((title) => ({
		question : title.question,
		answer   : title.answer,
		showing  : null,
	}));
	return { title: res.data.title, clues: clueObject };
}

// This function fills the game board with category names in the top row and question  mark boxes for the answers.
function fillTable () {
	$('#game-board').empty();
	const board = document.getElementById('game-board');
	const tableHead = document.createElement('thead');
	const tableBody = document.createElement('tbody');
	const topRow = document.createElement('tr');

	for (let i = 0; i < 5; i++) {
		const headCell = document.createElement('th');
		topRow.append(headCell);
		headCell.innerText = `${categoriesArray[i].title}`;
	}

	board.append(tableHead);
	board.append(tableBody);
	tableHead.append(topRow);

	for (let i = 0; i < 6; i++) {
		const row = document.createElement('tr');

		for (let j = 0; j < 5; j++) {
			const cell = document.createElement('td');
			cell.setAttribute('id', `${j}-${i}`);
			row.append(cell);
			cell.innerText = '?';
		}

		board.append(row);
	}
}

// This function handles a click by either revealing the clue or the answer depending how many clicks have been executed
function handleClick(evt) {
	let id = evt.target.id;
	let [ categoryId, clueId ] = id.split('-');
	let clue = categoriesArray[categoryId].clues[clueId];
	let msg;

	if (!clue.showing) {
		msg = clue.question;
		clue.showing = 'question';
	}
	else if (clue.showing === 'question') {
		msg = clue.answer;
		clue.showing = 'answer';
	}
	else {
		return;
	}
	$(`#${categoryId}-${clueId}`).html(msg);
}

// this function gets executed if the restart button is clicked. if it is clicked then the function gets new category ids and populates the game board again
async function setupAndStart() {
	let categoryIds = await getCategoryIds();
	categoriesArray = [];

	for (let categoryId of categoryIds) {
		categoriesArray.push(await getCategory(categoryId));
	}

	fillTable();
}

$('#restart').on('click', setupAndStart);

$(function () {
	setupAndStart();
	$('#game-board').on('click', 'td', handleClick);
});
