import { HighScoreManager } from './highscores';

export class ScoreManager {
    private score: number = 0;
    private startTime: number = 0;
    private lastScoreUpdate: number = 0;
    private scoreElement: HTMLElement;
    private highScoreElement: HTMLElement;
    private scoreAnimationFrame: number = 0;
    private highScoreManager: HighScoreManager;

    constructor(scoreElement: HTMLElement, highScoreElement: HTMLElement) {
        this.scoreElement = scoreElement;
        this.highScoreElement = highScoreElement;
        this.highScoreManager = new HighScoreManager();
        this.updateDisplay();
    }

    public startGame(): void {
        this.score = 0;
        this.startTime = performance.now();
        this.lastScoreUpdate = this.startTime;
        this.updateDisplay();
    }

    public update(deltaTime: number): void {
        this.score += deltaTime;
        
        // Update display with animation
        if (performance.now() - this.lastScoreUpdate >= 100) { // Update every 100ms
            this.updateDisplay();
            this.lastScoreUpdate = performance.now();
        }
    }

    public getScore(): number {
        return this.score;
    }

    public getHighScore(): number {
        return this.highScoreManager.getHighScore();
    }

    public getAllHighScores(): { score: number; date: string; duration: number }[] {
        return this.highScoreManager.getAllScores();
    }

    public gameOver(): void {
        // Check if current score is a new high score
        if (this.highScoreManager.addScore(this.score)) {
            this.animateHighScore();
        }
    }

    private updateDisplay(): void {
        // Format score with one decimal place
        const formattedScore = this.highScoreManager.formatScore(this.score);
        const formattedHighScore = this.highScoreManager.formatScore(this.getHighScore());

        // Update DOM elements with smooth transition
        if (this.scoreElement.textContent !== formattedScore) {
            this.scoreElement.textContent = formattedScore;
            this.addScoreUpdateEffect(this.scoreElement);
        }
        
        if (this.highScoreElement.textContent !== formattedHighScore) {
            this.highScoreElement.textContent = formattedHighScore;
        }
    }

    private addScoreUpdateEffect(element: HTMLElement): void {
        // Add a subtle scale effect when score updates
        element.style.transform = 'scale(1.2)';
        element.style.transition = 'transform 0.1s ease-out';
        
        // Reset after animation
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 100);
    }

    private animateHighScore(): void {
        const element = this.highScoreElement;
        let phase = 0;
        const colors = ['#4CAF50', '#FFD700', '#FF4081'];
        
        const animate = () => {
            element.style.color = colors[phase % colors.length];
            phase++;
            
            if (phase < 6) { // 2 complete color cycles
                this.scoreAnimationFrame = requestAnimationFrame(animate);
            } else {
                element.style.color = ''; // Reset to default color
            }
        };

        if (this.scoreAnimationFrame) {
            cancelAnimationFrame(this.scoreAnimationFrame);
        }
        animate();
    }

    public getScoreRank(): number {
        return this.highScoreManager.getScoreRank(this.score);
    }
} 