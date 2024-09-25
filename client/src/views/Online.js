import Router from '../router.js';
import OnlineInputHandler from '../conponents_online/OnlineInputHandler.js';
import Socket from '../services/Socket.js';
import { UIManager } from '../components/UIManager.js';
import { PongGame } from '../components/PongGame.js';

export class OnlineGameView {
	constructor() {
		this.matchMakingSocket = null;
		this.gameSocket = null;
		this.game = null
		this.UIManager = null;
	}

	async init() {
		const content = await Router.loadTemplate('game');
		document.getElementById('app').innerHTML = content;
		this.game = new PongGame();
		this.UIManager = new UIManager();
		this.matchMakingSocket = new Socket('matchmaking', {});
		this.matchMakingSocket.socket.addEventListener('message', (event) => {
			const data = JSON.parse(event.data);
			if (data.type === 'game_joined') {
				this.matchMakingSocket.socket.close();
				this.initGameSocket(data.game_id);
			}
		});
	}
	
	initGameSocket(gameId) {
		this.gameSocket = new Socket('live_game', { gameId });
		this.gameSocket.socket.addEventListener('message', (event) => {
			const data = JSON.parse(event.data);
			// if (data.type === 'game_update') {
				// 	this.game2d.update(data);
				// }
				console.log(data);
			});
		this.inputHandler = new OnlineInputHandler(this.gameSocket);
	}

	update() {
		this.UIManager.update();
		this.game.update();
	}
}

