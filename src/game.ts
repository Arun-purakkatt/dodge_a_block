/**
 * Main game module that orchestrates all game components and manages the game loop.
 * @module Game
 */

import { Player } from './player';
import { BlockManager } from './block';
import { CollisionSystem } from './collision';
import { ScoreManager } from './score';
import { GameStats } from './stats';

/** Represents the possible states of the game */
export type GameState = 'start' | 'playing' | 'gameover' | 'ending';

/** Interface for tracking performance metrics */
interface PerformanceStats {
    fps: number;          // Current frames per second
    frameTime: number;    // Total time to process a frame
    updateTime: number;   // Time spent in update logic
    renderTime: number;   // Time spent in rendering
}

/** Interface for high score entries */
export interface HighScoreEntry {
    score: number;        // Player's score
    date: string;         // Date when score was achieved
    duration: number;     // Duration of the game session
}

/**
 * Main game class that manages the game loop, state, and all game components.
 * Handles rendering, updates, and coordinates between different systems.
 */
export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private state: GameState = 'start';
    private player: Player;
    private blockManager: BlockManager;
    private collisionSystem: CollisionSystem;
    private scoreManager: ScoreManager;
    private gameStats: GameStats;
    private lastTime: number = 0;
    private frameCount: number = 0;
    private lastFpsUpdate: number = 0;
    private performanceStats: PerformanceStats = {
        fps: 0,
        frameTime: 0,
        updateTime: 0,
        renderTime: 0
    };

    // Frame timing constants
    private readonly TARGET_FPS = 60;
    private readonly FRAME_TIME = 1000 / this.TARGET_FPS;
    private readonly MAX_FRAME_TIME = this.FRAME_TIME * 2; // Cap at 2x frame time to prevent spiral of death
    private readonly CLOSE_CALL_THRESHOLD = 30; // pixels

    /**
     * Creates a new Game instance.
     * @param canvas - The canvas element where the game will be rendered
     * @param scoreElement - DOM element for displaying the current score
     * @param highScoreElement - DOM element for displaying the high score
     */
    constructor(
        canvas: HTMLCanvasElement,
        scoreElement: HTMLElement,
        highScoreElement: HTMLElement
    ) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.player = new Player(canvas.width, canvas.height);
        this.blockManager = new BlockManager(1000);
        this.collisionSystem = new CollisionSystem();
        this.scoreManager = new ScoreManager(scoreElement, highScoreElement);
        this.gameStats = new GameStats();
    }

    /**
     * Gets the current game state.
     * @returns The current state of the game
     */
    public getState(): GameState {
        return this.state;
    }

    /**
     * Gets the current score.
     * @returns The player's current score
     */
    public getScore(): number {
        return this.scoreManager.getScore();
    }

    /**
     * Gets the current high score.
     * @returns The highest score achieved
     */
    public getHighScore(): number {
        return this.scoreManager.getHighScore();
    }

    /**
     * Gets all recorded high scores.
     * @returns Array of high score entries
     */
    public getAllHighScores(): HighScoreEntry[] {
        return this.scoreManager.getAllHighScores();
    }

    /**
     * Gets the rank of the current score.
     * @returns The rank position of the current score
     */
    public getScoreRank(): number {
        return this.scoreManager.getScoreRank();
    }

    /**
     * Gets the current performance statistics.
     * @returns Object containing performance metrics
     */
    public getStats(): PerformanceStats {
        return this.performanceStats;
    }

    /**
     * Starts a new game session.
     * Resets all game components and begins the game loop.
     */
    public start(): void {
        this.state = 'playing';
        this.blockManager.startGame();
        this.scoreManager.startGame();
        this.gameStats.resetStats();
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.lastFpsUpdate = this.lastTime;
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * Handles player input events.
     * @param type - Type of input event ('keydown' or 'keyup')
     * @param code - Key code of the input
     */
    public handleInput(type: 'keydown' | 'keyup', code: string): void {
        if (this.state !== 'playing') return;

        const prevX = this.player.getPosition().x;
        
        switch (code) {
            case 'ArrowLeft':
            case 'KeyA':
                type === 'keydown' ? this.player.startMoving('left') : this.player.stopMoving('left');
                break;
            case 'ArrowRight':
            case 'KeyD':
                type === 'keydown' ? this.player.startMoving('right') : this.player.stopMoving('right');
                break;
        }

        // Track distance moved for statistics
        const newX = this.player.getPosition().x;
        this.gameStats.addDistanceMoved(newX - prevX);
    }

    /**
     * Main game loop that handles timing, updates, and rendering.
     * Uses requestAnimationFrame for optimal performance.
     * @param timestamp - Current timestamp from requestAnimationFrame
     */
    private gameLoop(timestamp: number): void {
        // Calculate frame timing
        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, this.MAX_FRAME_TIME / 1000);
        this.lastTime = timestamp;

        // Update FPS counter
        this.frameCount++;
        if (timestamp - this.lastFpsUpdate >= 1000) {
            this.performanceStats.fps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = timestamp;
        }

        // Start performance measurement
        const updateStart = performance.now();

        // Update game state
        this.update(deltaTime, timestamp);

        // Measure update time
        const renderStart = performance.now();
        this.performanceStats.updateTime = renderStart - updateStart;

        // Render frame
        this.render();

        // Measure render time
        const frameEnd = performance.now();
        this.performanceStats.renderTime = frameEnd - renderStart;
        this.performanceStats.frameTime = frameEnd - updateStart;

        // Schedule next frame if game is active
        if (this.state === 'playing' || this.state === 'ending') {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    /**
     * Updates game logic for a single frame.
     * Handles score, player movement, block updates, and collision detection.
     * @param deltaTime - Time elapsed since last frame in seconds
     * @param timestamp - Current game timestamp
     */
    private update(deltaTime: number, timestamp: number): void {
        // Update score during gameplay
        if (this.state === 'playing') {
            this.scoreManager.update(deltaTime);
        }

        // Update player
        if (this.state === 'playing') {
            this.player.update(deltaTime, this.canvas.width);
        }

        // Update blocks
        if (this.state === 'playing') {
            const prevSpeed = this.blockManager.getCurrentSpeed();
            this.blockManager.update(deltaTime, timestamp, this.canvas.width, this.canvas.height);
            const newSpeed = this.blockManager.getCurrentSpeed();
            
            // Track max speed for statistics
            this.gameStats.updateMaxSpeed(newSpeed);
            
            // Track blocks dodged
            if (this.blockManager.getBlocksDodged() > 0) {
                this.gameStats.incrementBlocksDodged();
            }
        }

        // Update collision effects
        this.collisionSystem.update(deltaTime);

        // Check for collisions during gameplay
        if (this.state === 'playing') {
            const playerPos = this.player.getPosition();
            const blocks = this.blockManager.getBlocks();
            
            for (const block of blocks) {
                const blockPos = block.getPosition();
                
                // Check for close calls
                const verticalDistance = blockPos.y - (playerPos.y + playerPos.height);
                const horizontalOverlap = !(playerPos.x + playerPos.width < blockPos.x || 
                                         playerPos.x > blockPos.x + blockPos.width);
                
                if (verticalDistance > 0 && verticalDistance < this.CLOSE_CALL_THRESHOLD && horizontalOverlap) {
                    this.gameStats.incrementCloseCalls();
                }
                
                if (this.collisionSystem.checkCollision(playerPos, blockPos)) {
                    // Calculate collision point for visual effects
                    const collisionPoint = {
                        x: (Math.max(playerPos.x, blockPos.x) + Math.min(playerPos.x + playerPos.width, blockPos.x + blockPos.width)) / 2,
                        y: (Math.max(playerPos.y, blockPos.y) + Math.min(playerPos.y + playerPos.height, blockPos.y + blockPos.height)) / 2
                    };
                    this.triggerGameOver(collisionPoint);
                    break;
                }
            }
        }

        // Check if ending state should transition to game over
        if (this.state === 'ending' && !this.collisionSystem.hasActiveEffects()) {
            this.state = 'gameover';
            this.scoreManager.gameOver();
            this.gameStats.displayStats();
        }
    }

    /**
     * Renders a single frame of the game.
     * Clears the canvas and draws all game objects.
     */
    private render(): void {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw border
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw game objects
        this.player.draw(this.ctx);
        this.blockManager.draw(this.ctx);
        this.collisionSystem.draw(this.ctx);

        // Draw performance stats in debug mode
        if (process.env.NODE_ENV === 'development') {
            this.drawDebugInfo();
        }
    }

    /**
     * Draws debug information when in development mode.
     * Shows FPS, frame timing, and other performance metrics.
     */
    private drawDebugInfo(): void {
        if (!this.ctx) return;

        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`FPS: ${this.performanceStats.fps}`, 10, 20);
        this.ctx.fillText(`Frame Time: ${this.performanceStats.frameTime.toFixed(2)}ms`, 10, 35);
        this.ctx.fillText(`Update Time: ${this.performanceStats.updateTime.toFixed(2)}ms`, 10, 50);
        this.ctx.fillText(`Render Time: ${this.performanceStats.renderTime.toFixed(2)}ms`, 10, 65);
    }

    /**
     * Triggers the game over sequence.
     * Creates collision effects and transitions game state.
     * @param collisionPoint - Point where the collision occurred
     */
    private triggerGameOver(collisionPoint: { x: number; y: number }): void {
        this.state = 'ending';
        this.collisionSystem.createCollisionEffect(collisionPoint.x, collisionPoint.y);
    }
} 