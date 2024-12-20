import Router from '../Router.js';
import Socket from '../services/Socket.js';
import State from '../State.js';
import * as Cookies from '../services/cookies.js';

export class OnlineGameLoadingView {
	constructor() {
		this.matchMakingSocket = null;
		this.gameSocket = null;
	}

	async init() {
		const content = await Router.loadTemplate('online-game-loading');
		document.getElementById('app').innerHTML = content;

		this.createTournament();
		this.connectMatchmakingSocket()
	}

	connectMatchmakingSocket() {
		const socket = State.get('tournament', 'matches')[0];
		if (socket && socket.readyState === WebSocket.OPEN) { return; }

		this.matchMakingSocket = new Socket('matchmaking', {});
		this.matchMakingSocket.addEventListenersMatchmaking();
		this.matchMakingSocket.socket.addEventListener('message', async (event) => {
			const data = JSON.parse(event.data);
			if (data.type === 'game_joined') {
				this.matchMakingSocket.close();
				this.connectGameSocket(data);
			}
		});
	}

	async connectGameSocket(data) {
		Cookies.setCookie("gameId", data.game_id, 24);
		await this.initGameSocket(Cookies.getCookie("gameId"));
		window.history.pushState({}, "", "/online-game");
		Router.handleLocationChange();
	}

	createTournament() {
		const tournament = State.get('tournament');

		const players = [];
		players.push({
			name: "Player 1",
			rank: 0,
			wins: 0,
			losses: 0,
			points: 0
		});
		players.push({
			name: "Player 2",
			rank: 0,
			wins: 0,
			losses: 0,
			points: 0
		});
		State.set("tournament", "players", players);

		const matches = [];
		matches.push({
			players: [
				{ name: tournament.players[0].name, score: 0 },
				{ name: tournament.players[1].name, score: 0 }
			],
			completed: false,
			socket: null,
		});
		State.set('tournament', 'matches', matches);
	}
	
	async initGameSocket(gameId) {
		const matches = State.get('tournament', 'matches');

		if (matches[0].socket && matches[0].socket.readyState === WebSocket.OPEN) {
			currentMatch.socket.close();
		}
		matches[0].socket = new Socket('online_game', { gameId });
		matches[0].socket.addEventListenersGame();

		await new Promise(resolve => setTimeout(resolve, 200));
	}

	update() {

	}

	cleanup() {
		
	}
}

