interface GameStatistics {
    blocksDodged: number;
    maxSpeed: number;
    distanceMoved: number;
    closeCalls: number;
}

export class GameStats {
    private stats: GameStatistics = {
        blocksDodged: 0,
        maxSpeed: 0,
        distanceMoved: 0,
        closeCalls: 0
    };

    private elements = {
        blocksDodged: document.getElementById('blocks-dodged')!,
        maxSpeed: document.getElementById('max-speed')!,
        distanceMoved: document.getElementById('distance-moved')!,
        closeCalls: document.getElementById('close-calls')!
    };

    constructor() {
        this.resetStats();
    }

    public resetStats(): void {
        this.stats = {
            blocksDodged: 0,
            maxSpeed: 0,
            distanceMoved: 0,
            closeCalls: 0
        };
    }

    public incrementBlocksDodged(): void {
        this.stats.blocksDodged++;
    }

    public updateMaxSpeed(speed: number): void {
        this.stats.maxSpeed = Math.max(this.stats.maxSpeed, speed);
    }

    public addDistanceMoved(distance: number): void {
        this.stats.distanceMoved += Math.abs(distance);
    }

    public incrementCloseCalls(): void {
        this.stats.closeCalls++;
    }

    public getStats(): GameStatistics {
        return { ...this.stats };
    }

    private async animateNumber(element: HTMLElement, value: number, duration: number = 1000): Promise<void> {
        element.classList.add('counting');
        
        const startValue = 0;
        const steps = 20;
        const stepDuration = duration / steps;
        
        for (let i = 0; i <= steps; i++) {
            const currentValue = startValue + (value - startValue) * (i / steps);
            let displayValue: string;
            
            if (element.id === 'max-speed') {
                displayValue = currentValue.toFixed(1) + 'x';
            } else if (element.id === 'distance-moved') {
                displayValue = Math.round(currentValue) + 'px';
            } else {
                displayValue = Math.round(currentValue).toString();
            }
            
            element.textContent = displayValue;
            await new Promise(resolve => setTimeout(resolve, stepDuration));
        }
        
        element.classList.remove('counting');
    }

    public async displayStats(): Promise<void> {
        // Add counting animation class to each stat
        const elements = Object.values(this.elements);
        elements.forEach(el => el.classList.add('counting-animation'));

        // Animate each statistic
        await Promise.all([
            this.animateNumber(this.elements.blocksDodged, this.stats.blocksDodged),
            this.animateNumber(this.elements.maxSpeed, this.stats.maxSpeed),
            this.animateNumber(this.elements.distanceMoved, this.stats.distanceMoved),
            this.animateNumber(this.elements.closeCalls, this.stats.closeCalls)
        ]);

        // Remove counting animation class
        elements.forEach(el => el.classList.remove('counting-animation'));
    }
} 