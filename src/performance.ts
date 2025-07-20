interface PerformanceMetrics {
    fps: number;
    frameTime: number;
    updateTime: number;
    renderTime: number;
    collisionTime: number;
    objectCount: number;
    memoryUsage: number;
}

interface TimingData {
    timestamps: number[];
    average: number;
    min: number;
    max: number;
}

// Chrome-specific performance memory interface
interface PerformanceMemory {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
}

interface ExtendedPerformance extends Performance {
    memory?: PerformanceMemory;
}

export class PerformanceMonitor {
    private metrics: PerformanceMetrics = {
        fps: 0,
        frameTime: 0,
        updateTime: 0,
        renderTime: 0,
        collisionTime: 0,
        objectCount: 0,
        memoryUsage: 0
    };

    private frameCount: number = 0;
    private lastFpsUpdate: number = 0;
    private readonly fpsUpdateInterval: number = 1000; // Update FPS every second
    private readonly historySize: number = 60; // Keep last 60 frames of data

    private timingHistory: Map<string, TimingData> = new Map();
    private readonly timingKeys = ['frameTime', 'updateTime', 'renderTime', 'collisionTime'];

    constructor() {
        this.initializeTimingHistory();
        this.startPerformanceMonitoring();
    }

    private initializeTimingHistory(): void {
        this.timingKeys.forEach(key => {
            this.timingHistory.set(key, {
                timestamps: [],
                average: 0,
                min: Infinity,
                max: -Infinity
            });
        });
    }

    private startPerformanceMonitoring(): void {
        if (typeof window !== 'undefined' && window.performance) {
            setInterval(() => {
                const extendedPerf = performance as ExtendedPerformance;
                if (extendedPerf.memory) {
                    this.metrics.memoryUsage = extendedPerf.memory.usedJSHeapSize / (1024 * 1024);
                }
            }, 1000);
        }
    }

    public startFrame(): number {
        return performance.now();
    }

    public updateFps(timestamp: number): void {
        this.frameCount++;
        
        if (timestamp - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.metrics.fps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = timestamp;
        }
    }

    public recordTiming(key: keyof PerformanceMetrics, duration: number): void {
        this.metrics[key] = duration;

        const history = this.timingHistory.get(key);
        if (history) {
            history.timestamps.push(duration);
            if (history.timestamps.length > this.historySize) {
                history.timestamps.shift();
            }

            // Update statistics
            history.average = history.timestamps.reduce((a, b) => a + b, 0) / history.timestamps.length;
            history.min = Math.min(history.min, duration);
            history.max = Math.max(history.max, duration);
        }
    }

    public setObjectCount(count: number): void {
        this.metrics.objectCount = count;
    }

    public getMetrics(): PerformanceMetrics {
        return { ...this.metrics };
    }

    public getTimingStats(key: string): TimingData | undefined {
        return this.timingHistory.get(key);
    }

    public getAllTimingStats(): Map<string, TimingData> {
        return new Map(this.timingHistory);
    }

    public getDebugInfo(): string[] {
        const info: string[] = [];
        info.push(`FPS: ${this.metrics.fps}`);
        info.push(`Frame Time: ${this.metrics.frameTime.toFixed(2)}ms`);
        info.push(`Update Time: ${this.metrics.updateTime.toFixed(2)}ms`);
        info.push(`Render Time: ${this.metrics.renderTime.toFixed(2)}ms`);
        info.push(`Collision Time: ${this.metrics.collisionTime.toFixed(2)}ms`);
        info.push(`Objects: ${this.metrics.objectCount}`);
        
        if (this.metrics.memoryUsage > 0) {
            info.push(`Memory: ${this.metrics.memoryUsage.toFixed(1)}MB`);
        }

        return info;
    }

    public reset(): void {
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
        this.initializeTimingHistory();
    }
} 