// script.js

function startGame() {
    const npcSelect = document.getElementById('npc-select');
    selectedNpc = npcSelect.value;
    document.getElementById('npc-selection').style.display = 'none';
    document.getElementById('game').style.display = 'block';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

document.addEventListener('DOMContentLoaded', () => {
    initTicTacToe();
});

const ticTacToeBoard = document.getElementById('tic-tac-toe-board');
const ticTacToeCells = [];
let currentPlayer = 'red';
let rpsResult = '';
let currentChoice = '';
let waitingForRps = true;

const npcs = {
    'slime': { strategy: ['random'] },
    'budi': { strategy: ['win', 'counter', 'beat', 'random'] },
    'cornelia': { strategy: ['win', 'counter', 'beat', 'corner', 'random'] },
    'edgar': { strategy: ['win', 'counter', 'beat', 'edge', 'random'] },
    'midi': { strategy: ['win', 'counter', 'beat', 'center', 'random'] },
    'scissor-lady': { strategy: ['win', 'counter', 'beat', 'random'], rpsProb: [0.5, 0.25, 0.25] },
    'paper-guy': { strategy: ['win', 'counter', 'beat', 'random'], rpsProb: [0.25, 0.5, 0.25] },
    'bob-rock': { strategy: ['win', 'counter', 'beat', 'random'], rpsProb: [0.25, 0.25, 0.5] },
};

let selectedNpc = 'slime';

document.getElementById('npc-select').addEventListener('change', (e) => {
    selectedNpc = e.target.value;
});

function initTicTacToe() {
    ticTacToeBoard.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', () => makeMove(i));
        ticTacToeBoard.appendChild(cell);
        ticTacToeCells.push(cell);
    }
}

function playerChoice(choice) {
    if (waitingForRps) {
        currentChoice = choice;
        const npcChoice = getNpcChoice();
        rpsResult = getRpsResult(choice, npcChoice);
        const resultElement = document.getElementById('rps-result');
        resultElement.innerHTML = `You chose ${choice}, NPC chose ${npcChoice}. ${rpsResult.message}`;

        if (rpsResult.winner === 'player') {
            currentPlayer = 'red';
            waitingForRps = false;
        } else if (rpsResult.winner === 'npc') {
            currentPlayer = 'blue';
            waitingForRps = false;
            npcMove();
        }
    }
}

function getNpcChoice() {
    const npc = npcs[selectedNpc];
    if (npc.rpsProb) {
        const random = Math.random();
        if (random < npc.rpsProb[0]) return 'scissors';
        if (random < npc.rpsProb[0] + npc.rpsProb[1]) return 'paper';
        return 'rock';
    }
    const choices = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * choices.length)];
}

youWinRPS = true;
function getRpsResult(playerChoice, npcChoice) {
	document.getElementById('command-action').innerHTML = '';
    if (playerChoice === npcChoice) {
		youWinRPS = false;
		document.getElementById('command-action').innerHTML = 'Choose Rock, Paper, or Scissors to continue.';
        return { winner: 'draw', message: 'It\'s a draw!', choice: playerChoice };	
    } else if (
        (playerChoice === 'rock' && npcChoice === 'scissors') ||
        (playerChoice === 'paper' && npcChoice === 'rock') ||
        (playerChoice === 'scissors' && npcChoice === 'paper')
    ) {
		youWinRPS = true;
		document.getElementById('command-action').innerHTML = 'Mark a box.';
        return { winner: 'player', message: 'You win!', choice: playerChoice };
    } else {
		youWinRPS = false;
		document.getElementById('command-action').innerHTML = 'Choose Rock, Paper, or Scissors to continue.';	
        return { winner: 'npc', message: 'You lose!', choice: npcChoice };
    }
}

function makeMove(index) {
	console.log(index);
	console.log(ticTacToeCells[index].textContent);
    if (!waitingForRps && (ticTacToeCells[index].textContent === '' || canOverwrite(ticTacToeCells[index].textContent,ticTacToeCells[index].classList))) {
        ticTacToeCells[index].textContent = rpsResult.choice.toUpperCase()[0];
        ticTacToeCells[index].classList.remove('red', 'blue');
        ticTacToeCells[index].classList.add(currentPlayer);
        if (checkWinner(currentPlayer)) {
			playerNow = '' + currentPlayer;
            setTimeout(() => alert(`${playerNow === 'red' ? 'Red' : 'Blue'} wins!`), 100);
        } else if (ticTacToeCells.every(cell => cell.textContent !== '')) {
            setTimeout(() => alert('Draw!'), 100);
        } else {
            waitingForRps = true;
            document.getElementById('command-action').innerHTML = 'Choose Rock, Paper, or Scissors to continue.';
        }
    }
}

function canOverwrite(currentMark,classList) {
    if (classList.contains(currentPlayer)){return false}
    return (currentMark === 'S' && rpsResult.choice === 'rock') ||
           (currentMark === 'R' && rpsResult.choice === 'paper') ||
           (currentMark === 'P' && rpsResult.choice === 'scissors');
}

function npcMove() {
    if (!waitingForRps) {
        playerChoice(getNpcChoice());
        const strategy = npcs[selectedNpc].strategy;
        for (let i = 0; i < strategy.length; i++) {
			console.log(strategy[i])
            if (executeNpcStrategy(strategy[i])) {
                break;
            }
        }
        waitingForRps = true;
        document.getElementById('command-action').innerHTML = 'Choose Rock, Paper, or Scissors to continue.';	
    }
}

function executeNpcStrategy(strategy) {
    let availableMoves = [];
    switch (strategy) {
        case 'win':
            if (executeWinStrategy()) return true;
            break;
        case 'counter':
            if (executeCounterStrategy()) return true;
            break;
        case 'beat':
            availableMoves = [0,1,2,3,4,5,6,7,8].filter(index => canOverwrite(ticTacToeCells[index].textContent,ticTacToeCells[index].classList));
            break;
        case 'corner':
            availableMoves = [0, 2, 6, 8].filter(index => ticTacToeCells[index].textContent === '');
            break;
        case 'edge':
            availableMoves = [1, 3, 5, 7].filter(index => ticTacToeCells[index].textContent === '');
            break;
        case 'center':
            if (ticTacToeCells[4].textContent === '') {
                makeMove(4);
                return true;
            }
            break;
        case 'random':
            availableMoves = [0,1,2,3,4,5,6,7,8].filter(index => ticTacToeCells[index].textContent === '');
            break;
    }
	console.log(availableMoves);
    if (availableMoves.length > 0) {
        const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        makeMove(randomMove);
        return true;
    }
    return false;
}

function executeWinStrategy() {
    const winningCombinations = shuffleArray([
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ]);
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if ((ticTacToeCells[c].textContent === '' || canOverwrite(ticTacToeCells[c].textContent,ticTacToeCells[c].classList)) &&
	    ticTacToeCells[a].classList.contains('blue') && ticTacToeCells[b].classList.contains('blue')) {
	    makeMove(c);
	    return true;
	} else if ((ticTacToeCells[b].textContent === '' || canOverwrite(ticTacToeCells[b].textContent,ticTacToeCells[b].classList)) &&
	   ticTacToeCells[a].classList.contains('blue') && ticTacToeCells[c].classList.contains('blue')) {
	   makeMove(b);
	   return true;
	} else if ((ticTacToeCells[a].textContent === '' || canOverwrite(ticTacToeCells[a].textContent,ticTacToeCells[a].classList)) &&
	   ticTacToeCells[b].classList.contains('blue') && ticTacToeCells[c].classList.contains('blue')) {
	   makeMove(a);
	   return true;
	}
    }
}

function executeCounterStrategy() {
    const winningCombinations = shuffleArray([
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ]);
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (ticTacToeCells[a].classList.contains('red') && ticTacToeCells[b].classList.contains('red')) {
		cekKounter = Math.floor(Math.random());
		if (canOverwrite(ticTacToeCells[[a,b][cekKounter]].textContent,ticTacToeCells[[a,b][cekKounter]].classList)){
	    makeMove([a,b][cekKounter])
		return true;
		}
		else if (canOverwrite(ticTacToeCells[[a,b][1-cekKounter]].textContent,ticTacToeCells[[a,b][1-cekKounter]].classList)){
		makeMove([a,b][1-cekKounter])
		return true;
		}
		else if (ticTacToeCells[c].textContent === ''){
		makeMove(c);
		return true;
		}  
	} else if (ticTacToeCells[a].classList.contains('red') && ticTacToeCells[c].classList.contains('red')) {
	   cekKounter = Math.floor(Math.random());
		if (canOverwrite(ticTacToeCells[[a,c][cekKounter]].textContent,ticTacToeCells[[a,c][cekKounter]].classList)){
	    makeMove([a,c][cekKounter])
		return true;
		}
		else if (canOverwrite(ticTacToeCells[[a,c][1-cekKounter]].textContent,ticTacToeCells[[a,c][1-cekKounter]].classList)){
		makeMove([a,c][1-cekKounter])
		return true;
		}
		else if(ticTacToeCells[b].textContent === ''){
		makeMove(b);
		return true;
		}
	} else if (ticTacToeCells[b].classList.contains('red') && ticTacToeCells[c].classList.contains('red')) {
	   cekKounter = Math.floor(Math.random());
		if (canOverwrite(ticTacToeCells[[b,c][cekKounter]].textContent,ticTacToeCells[[b,c][cekKounter]].classList)){
	    makeMove([b,c][cekKounter])
		return true;
		}
		else if (canOverwrite(ticTacToeCells[[b,c][1-cekKounter]].textContent,ticTacToeCells[[b,c][1-cekKounter]].classList)){
		makeMove([b,c][1-cekKounter])
		return true;
		}
		else if(ticTacToeCells[a].textContent === ''){
		makeMove(a);
		return true;
		}
	}
    }
return false;
}

function checkWinner(player) {
const winningCombinations = [
[0, 1, 2], [3, 4, 5], [6, 7, 8],
[0, 3, 6], [1, 4, 7], [2, 5, 8],
[0, 4, 8], [2, 4, 6]
];
return winningCombinations.some(combination => {
return combination.every(index => ticTacToeCells[index].classList.contains(player));
});
}

function resetGame() {
ticTacToeCells.forEach(cell => {
cell.textContent = '';
cell.classList.remove('red', 'blue');
});
currentPlayer = 'red';
rpsResult = '';
currentChoice = '';
waitingForRps = true;
}
