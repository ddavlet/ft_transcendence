import { GameModes } from '../constants.js';
import { loadTemplate } from '../router.js';
import state from '../state/stateManager.js';
import * as Cookies from '../services/cookies.js';

export async function initGameSetupView() {
	const content = await loadTemplate('game-setup');
	document.getElementById('app').innerHTML = content;

	const gameModeButtons = document.querySelectorAll('.btn-game-mode');
	const addPlayerButton = document.getElementById('addPlayer');
	const playerInputsContainer = document.getElementById('playerInputs');

	gameModeButtons.forEach(button => {
		button.addEventListener('click', () => updateUIForGameMode(button));
	});

	if (addPlayerButton) {
		addPlayerButton.addEventListener('click', addPlayer);
	}

	if (playerInputsContainer) {
		playerInputsContainer.addEventListener('click', (e) => {
			if (e.target.classList.contains('btn-danger')) {
				deletePlayer(e.target);
			}
		});
	}

	const settingsButtons = document.querySelectorAll('[data-setting]');
	settingsButtons.forEach(button => {
		button.addEventListener('click', (e) => {
			const setting = button.dataset.setting;
			const value = parseInt(button.dataset.value);
			updateValue(setting, value);
		});
	});

	const playerInput = document.getElementById('playerForm');
	playerInput.addEventListener('input', function() {
		updatePlayers();
	});


	initSettingsUI();
	updateUIForGameMode(document.querySelector('.btn-game-mode.active') || document.getElementById('btn_singleplayer'));
	updatePlayers();
}

function updateUIForGameMode(selectedButton) {
	if (!selectedButton) return;

	const singlePlayerBtn = document.getElementById('btn_singleplayer');
	const multiPlayerBtn = document.getElementById('btn_multiplayer');
	const onlineBtn = document.getElementById('btn_online');
	const addPlayerButton = document.getElementById('addPlayer');
	const startGameButton = document.getElementById('startGameButton');
	const playerInputs = document.getElementById('playerInputs');
	const settingsView = document.getElementById('settingsView');

	[singlePlayerBtn, multiPlayerBtn, onlineBtn].forEach(btn => {
		if (btn) btn.classList.remove('active');
	});
	selectedButton.classList.add('active');
	deleteAllPlayersButOne();

	if (selectedButton === singlePlayerBtn) {
		if (addPlayerButton) addPlayerButton.style.display = 'none';
		state.set('matchSettings.mode', GameModes.SINGLE);
		if (startGameButton) startGameButton.href = '/game';
		if (playerInputs) playerInputs.style.display = 'block';
		if (settingsView) settingsView.style.display = 'block';
	} else if (selectedButton === multiPlayerBtn) {
		addPlayer();
		if (addPlayerButton) addPlayerButton.style.display = 'block';
		state.set('matchSettings.mode', GameModes.MULTI);
		if (startGameButton) startGameButton.href = '/game';
		if (playerInputs) playerInputs.style.display = 'block';
		if (settingsView) settingsView.style.display = 'block';
	} else if (selectedButton === onlineBtn) {
		state.set('matchSettings.mode', GameModes.ONLINE);
		if (addPlayerButton) addPlayerButton.style.display = 'none';
		if (startGameButton) startGameButton.href = '/online-game';
		if (playerInputs) playerInputs.style.display = 'block';
		if (settingsView) settingsView.style.display = 'none';
	}

	updatePlayers();
}

function initSettingsUI() {
	const settingsToUpdate = ['pointsToWin', 'numberOfGames'];
	
	settingsToUpdate.forEach(setting => {
		const buttons = document.querySelectorAll(`[data-setting="${setting}"]`);
		buttons.forEach(button => {
			const value = parseInt(button.dataset.value);
			if (settings[setting] === value) {
				button.classList.add('active');
			} else {
				button.classList.remove('active');
			}
		});
	});

	const username = Cookies.getCookie("username");
	const player1Input = document.getElementById('player1');
	if (player1Input && username) {
		player1Input.value = username;
	}
}


function updateValue(setting, newValue) {
	if (settings.hasOwnProperty(setting)) {
		settings[setting] = newValue;
		
		const buttons = document.querySelectorAll(`[data-setting="${setting}"]`);
		buttons.forEach(button => {
			const value = parseInt(button.dataset.value);
			if (value === newValue) {
				button.classList.add('active');
			} else {
				button.classList.remove('active');
			}
		});
	}
}

export function addPlayer() {
	const playerInputs = document.getElementById('playerInputs');
	if (!playerInputs) {
		console.error('Player inputs container not found');
		return;
	}
	const playerCount = playerInputs.children.length + 1;
	const newPlayerDiv = document.createElement('div');
	newPlayerDiv.className = 'player-input-group mb-3';
	newPlayerDiv.innerHTML = `
		<div class="input-group">
			<input type="text" class="form-control form-input" id="player${playerCount}" placeholder="Player ${playerCount}" autocomplete=off>
			<button type="button" class="btn btn-danger fw-bold">X</button>
		</div>
	`;
	playerInputs.appendChild(newPlayerDiv);
	updatePlayers();
}

export function deletePlayer(button) {
	const playerInputGroup = button.closest('.player-input-group');
	if (playerInputGroup) {
		const playerInputs = document.getElementById('playerInputs');
		if (playerInputs && playerInputs.children.length > 1) {
			playerInputGroup.remove();
			renumberPlayers();
			updatePlayers();
		}
	} else {
		console.error('Could not find parent .player-input-group');
	}
}

function renumberPlayers() {
	const playerInputs = document.getElementById('playerInputs');
	if (playerInputs) {
		const inputGroups = playerInputs.querySelectorAll('.player-input-group');
		inputGroups.forEach((group, index) => {
			const input = group.querySelector('input');
			if (input) {
				input.id = `player${index + 1}`;
				input.placeholder = `Player ${index + 1}`;
			}
		});
	}
}

export function updatePlayers() {
	players.length = 0;
	const playerInputs = document.querySelectorAll('#playerInputs input');
	playerInputs.forEach((input, index) => {
		const playerName = input.value.trim() || `Player ${index + 1}`;
		players.push({
			name: playerName,
			score: 0
		});
	});
	if (settings.mode === GameModes.SINGLE && players.length === 1) {
		players.push({
			name: "AI Player",
			score: 0
		});
	}
}

function deleteAllPlayersButOne() {
	const playerInputs = document.getElementById('playerInputs');
	if (playerInputs) {
		while (playerInputs.children.length > 1) {
			playerInputs.removeChild(playerInputs.lastChild);
		}
	}
}
