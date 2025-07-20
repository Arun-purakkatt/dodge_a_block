import '../styles/main.css';
import { Game, GameState, HighScoreEntry } from './game';

// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// Canvas setup
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

// UI elements
const gameOverlay = document.getElementById('game-overlay')!;
const startScreen = document.getElementById('start-screen')!;
const gameOverScreen = document.getElementById('game-over-screen')!;
const startButton = document.getElementById('start-button')!;
const restartButton = document.getElementById('restart-button')!;
const scoreDisplay = document.getElementById('score')!;
const highScoreDisplay = document.getElementById('high-score')!;
const finalScoreDisplay = document.getElementById('final-score')!;
const finalHighScoreDisplay = document.getElementById('final-high-score')!;
const rankInfo = document.getElementById('rank-info')!;
const startHighScores = document.getElementById('start-high-scores')!;
const gameOverHighScores = document.getElementById('game-over-high-scores')!;

// Set canvas size maintaining aspect ratio
function resizeCanvas() {
    const container = canvas.parentElement as HTMLElement;
    const containerWidth = container.clientWidth;
    const scale = containerWidth / GAME_WIDTH;
    
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${GAME_HEIGHT * scale}px`;
}

// Initialize game
let game: Game;

function initGame() {
    resizeCanvas();
    game = new Game(canvas, scoreDisplay, highScoreDisplay);
    updateHighScoresDisplay();
    showStartScreen();
}

// Game state management
function showStartScreen() {
    gameOverlay.classList.remove('hidden');
    startScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    updateHighScoresDisplay();
}

function startGame() {
    gameOverlay.classList.add('hidden');
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    game.start();
}

function updateUI(state: GameState) {
    switch (state) {
        case 'start':
            showStartScreen();
            break;
        case 'playing':
            gameOverlay.classList.add('hidden');
            break;
        case 'ending':
            // Keep the game visible while ending animation plays
            break;
        case 'gameover':
            showGameOverScreen();
            break;
    }
}

function showGameOverScreen() {
    gameOverlay.classList.remove('hidden');
    startScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    
    const score = game.getScore();
    const highScore = game.getHighScore();
    
    finalScoreDisplay.textContent = score.toFixed(1);
    finalHighScoreDisplay.textContent = highScore.toFixed(1);

    // Show rank info with animation
    const rank = game.getScoreRank();
    let rankText = '';
    if (rank === 1) {
        rankText = '🏆 New High Score!';
    } else if (rank <= 5) {
        rankText = `🎉 Top ${rank} Score!`;
    } else {
        rankText = 'Keep practicing!';
    }
    rankInfo.textContent = rankText;
    
    updateHighScoresDisplay();
}

function updateHighScoresDisplay() {
    const scores = game.getAllHighScores();
    const highScoresList = scores.map((entry: HighScoreEntry, index: number) => {
        const formattedScore = entry.score.toFixed(1);
        const date = new Date(entry.date).toLocaleDateString();
        return `<li><span>#${index + 1}: ${formattedScore}s</span><span>${date}</span></li>`;
    }).join('');

    startHighScores.innerHTML = highScoresList;
    gameOverHighScores.innerHTML = highScoresList;
}

// Set up game state observer
function observeGameState() {
    let lastState = game.getState();

    function checkState() {
        const currentState = game.getState();

        if (currentState !== lastState) {
            updateUI(currentState);
            lastState = currentState;
        }

        requestAnimationFrame(checkState);
    }

    checkState();
}

// Event listeners
window.addEventListener('resize', resizeCanvas);

window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && game.getState() === 'gameover') {
        startGame();
    } else {
        game.handleInput('keydown', event.code);
    }
});

window.addEventListener('keyup', (event) => {
    game.handleInput('keyup', event.code);
});

startButton.addEventListener('click', () => {
    startGame();
});

restartButton.addEventListener('click', () => {
    startGame();
});

// Initialize the game
initGame();
observeGameState(); 