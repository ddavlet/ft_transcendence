import State from '../State.js';

export default class TwoD {
	constructor(game) {
		this.canvas = null;
		this.ctx = null;
		this.game = game;

		this.init();
		this.printGameStatus();
	}

	init() {
		this.canvas = document.getElementById('gameCanvas2D');
		this.ctx = this.canvas.getContext('2d');

		this.canvas.width = this.game.field.width;
		this.canvas.height = this.game.field.height;
		this.startGame();
	}

	printGameStatus() {
		setInterval(() => {
			console.log(State);
		}, 2000);
	}

	startGame() {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
		this.gameLoop();
	}

	gameLoop() {
		this.drawBackground();
		this.drawPaddles();
		this.drawBall();
		this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
	}

	drawPaddles() {
		const paddleHeight = 50;
		const paddleWidth = 10;
		const player1PosState = State.data.gameData.player1Pos;
		const player2PosState = State.data.gameData.player2Pos;
		const leftPaddleY = (player1PosState || this.canvas.height / 2);
		const rightPaddleY = (player2PosState || this.canvas.height / 2);
	
		this.ctx.fillStyle = 'white';
		this.ctx.fillRect(0, leftPaddleY, paddleWidth, paddleHeight);
		this.ctx.fillRect(this.canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);
	}

	drawBall() {
		const ball = State.get('gameData', 'ball');
		const ballRadius = 5;
		const countdown = State.get('gameData', 'countdown');
	
		if (ball && countdown <= 0) {
			this.ctx.beginPath();
			this.ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
			this.ctx.fillStyle = 'white';
			this.ctx.fill();
			this.ctx.closePath();
		}
	}

	drawBackground() {
		this.ctx.fillStyle = '#33CB99';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	show() {
		this.canvas.style.display = 'inline';
	}

	hide() {
		this.canvas.style.display = 'none';
	}
}