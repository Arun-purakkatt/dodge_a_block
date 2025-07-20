import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { Game } from '../game';

describe('Game', () => {
    let game: Game;
    let canvas: HTMLCanvasElement;
    let scoreElement: HTMLElement;
    let highScoreElement: HTMLElement;

    beforeEach(() => {
        // Set up DOM elements
        canvas = document.createElement('canvas');
        scoreElement = document.createElement('div');
        highScoreElement = document.createElement('div');
        document.body.appendChild(canvas);
        document.body.appendChild(scoreElement);
        document.body.appendChild(highScoreElement);

        // Create game instance
        game = new Game(canvas, scoreElement, highScoreElement);
    });

    afterEach(() => {
        // Clean up DOM elements
        document.body.removeChild(canvas);
        document.body.removeChild(scoreElement);
        document.body.removeChild(highScoreElement);
    });

    describe('Game State', () => {
        it('should start in "start" state', () => {
            expect(game.getState()).toBe('start');
        });

        it('should transition to "playing" state when started', () => {
            game.start();
            expect(game.getState()).toBe('playing');
        });
    });

    describe('Score Management', () => {
        it('should start with zero score', () => {
            expect(game.getScore()).toBe(0);
        });

        it('should track high score', () => {
            // Mock localStorage to return a high score
            jest.spyOn(localStorage, 'getItem').mockReturnValue('100');
            expect(game.getHighScore()).toBe(100);
        });

        it('should return all high scores', () => {
            const mockScores = [
                { score: 100, date: '2024-01-01', duration: 100 },
                { score: 90, date: '2024-01-02', duration: 90 }
            ];
            jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(mockScores));
            expect(game.getAllHighScores()).toEqual(mockScores);
        });
    });

    describe('Input Handling', () => {
        beforeEach(() => {
            game.start(); // Put game in playing state
        });

        it('should handle left movement', () => {
            game.handleInput('keydown', 'ArrowLeft');
            game.handleInput('keyup', 'ArrowLeft');
            expect(game.getState()).toBe('playing');
        });

        it('should handle right movement', () => {
            game.handleInput('keydown', 'ArrowRight');
            game.handleInput('keyup', 'ArrowRight');
            expect(game.getState()).toBe('playing');
        });

        it('should handle WASD keys', () => {
            game.handleInput('keydown', 'KeyA');
            game.handleInput('keyup', 'KeyA');
            game.handleInput('keydown', 'KeyD');
            game.handleInput('keyup', 'KeyD');
            expect(game.getState()).toBe('playing');
        });

        it('should ignore input when not playing', () => {
            game = new Game(canvas, scoreElement, highScoreElement); // Reset to start state
            game.handleInput('keydown', 'ArrowLeft');
            expect(game.getState()).toBe('start');
        });
    });

    describe('Performance Tracking', () => {
        it('should track performance metrics', () => {
            const stats = game.getStats();
            expect(stats).toHaveProperty('fps');
            expect(stats).toHaveProperty('frameTime');
            expect(stats).toHaveProperty('updateTime');
            expect(stats).toHaveProperty('renderTime');
        });
    });

    describe('Game Loop', () => {
        it('should maintain target frame rate', (done) => {
            game.start();
            
            // Wait for a few frames
            setTimeout(() => {
                const stats = game.getStats();
                expect(stats.fps).toBeGreaterThan(0);
                done();
            }, 100);
        });
    });

    describe('Score Ranking', () => {
        it('should calculate score rank correctly', () => {
            const mockScores = [
                { score: 100, date: '2024-01-01', duration: 100 },
                { score: 90, date: '2024-01-02', duration: 90 },
                { score: 80, date: '2024-01-03', duration: 80 }
            ];
            jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(mockScores));
            
            // Current score would be 0, should be rank 4
            expect(game.getScoreRank()).toBe(4);
        });
    });
}); 