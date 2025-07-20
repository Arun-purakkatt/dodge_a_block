interface HighScoreEntry {
    score: number;
    date: string;
    duration: number;
}

export class HighScoreManager {
    private static readonly STORAGE_KEY = 'dodgeABlock_highScores';
    private static readonly MAX_SCORES = 5;
    private scores: HighScoreEntry[] = [];

    constructor() {
        this.loadScores();
    }

    public addScore(score: number): boolean {
        const isHighScore = this.isNewHighScore(score);
        
        if (isHighScore) {
            const newEntry: HighScoreEntry = {
                score,
                date: new Date().toISOString(),
                duration: score
            };

            this.scores.push(newEntry);
            this.scores.sort((a, b) => b.score - a.score);
            
            if (this.scores.length > HighScoreManager.MAX_SCORES) {
                this.scores.pop();
            }

            this.saveScores();
        }

        return isHighScore;
    }

    public getHighScore(): number {
        return this.scores.length > 0 ? this.scores[0].score : 0;
    }

    public getAllScores(): HighScoreEntry[] {
        return [...this.scores];
    }

    public isNewHighScore(score: number): boolean {
        return (
            this.scores.length < HighScoreManager.MAX_SCORES ||
            score > this.scores[this.scores.length - 1].score
        );
    }

    public clearScores(): void {
        this.scores = [];
        this.saveScores();
    }

    private loadScores(): void {
        try {
            const savedScores = localStorage.getItem(HighScoreManager.STORAGE_KEY);
            if (savedScores) {
                this.scores = JSON.parse(savedScores);
                // Ensure scores are sorted
                this.scores.sort((a, b) => b.score - a.score);
                // Ensure we don't exceed MAX_SCORES
                if (this.scores.length > HighScoreManager.MAX_SCORES) {
                    this.scores = this.scores.slice(0, HighScoreManager.MAX_SCORES);
                }
            }
        } catch (e) {
            console.warn('Failed to load high scores from localStorage:', e);
            this.scores = [];
        }
    }

    private saveScores(): void {
        try {
            localStorage.setItem(
                HighScoreManager.STORAGE_KEY,
                JSON.stringify(this.scores)
            );
        } catch (e) {
            console.warn('Failed to save high scores to localStorage:', e);
        }
    }

    public formatScore(score: number): string {
        return this.formatDuration(score);
    }

    private formatDuration(seconds: number): string {
        if (seconds < 60) {
            return `${seconds.toFixed(1)}s`;
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
    }

    public getScoreRank(score: number): number {
        let rank = 1;
        for (const entry of this.scores) {
            if (score <= entry.score) {
                rank++;
            }
        }
        return Math.min(rank, HighScoreManager.MAX_SCORES + 1);
    }
} 