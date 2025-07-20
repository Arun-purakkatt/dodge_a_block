import { PerformanceMonitor } from '../performance';

describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
        monitor = new PerformanceMonitor();
    });

    describe('Frame Timing', () => {
        it('should track frame start time', () => {
            const startTime = monitor.startFrame();
            expect(startTime).toBeGreaterThan(0);
        });

        it('should update FPS', () => {
            monitor.updateFps(performance.now());
            const metrics = monitor.getMetrics();
            expect(metrics.fps).toBeGreaterThanOrEqual(0);
        });

        it('should record timing metrics', () => {
            monitor.recordTiming('frameTime', 16.67); // 60 FPS frame time
            monitor.recordTiming('updateTime', 5);
            monitor.recordTiming('renderTime', 8);
            
            const metrics = monitor.getMetrics();
            expect(metrics.frameTime).toBe(16.67);
            expect(metrics.updateTime).toBe(5);
            expect(metrics.renderTime).toBe(8);
        });
    });

    describe('Object Tracking', () => {
        it('should track object count', () => {
            monitor.setObjectCount(10);
            const metrics = monitor.getMetrics();
            expect(metrics.objectCount).toBe(10);
        });
    });

    describe('Timing Statistics', () => {
        it('should maintain timing history', () => {
            monitor.recordTiming('frameTime', 16);
            monitor.recordTiming('frameTime', 17);
            
            const stats = monitor.getTimingStats('frameTime');
            expect(stats).toBeDefined();
            expect(stats?.average).toBeGreaterThan(0);
            expect(stats?.min).toBeLessThanOrEqual(16);
            expect(stats?.max).toBeGreaterThanOrEqual(17);
        });

        it('should calculate correct averages', () => {
            const times = [10, 20, 30];
            times.forEach(time => monitor.recordTiming('frameTime', time));
            
            const stats = monitor.getTimingStats('frameTime');
            expect(stats?.average).toBe(20); // (10 + 20 + 30) / 3
        });

        it('should track min and max values', () => {
            const times = [15, 10, 25, 20];
            times.forEach(time => monitor.recordTiming('frameTime', time));
            
            const stats = monitor.getTimingStats('frameTime');
            expect(stats?.min).toBe(10);
            expect(stats?.max).toBe(25);
        });
    });

    describe('Debug Information', () => {
        it('should generate debug info strings', () => {
            monitor.recordTiming('frameTime', 16.67);
            monitor.recordTiming('updateTime', 5);
            monitor.recordTiming('renderTime', 8);
            monitor.setObjectCount(10);
            
            const info = monitor.getDebugInfo();
            expect(info).toBeInstanceOf(Array);
            expect(info.length).toBeGreaterThan(0);
            expect(info[0]).toContain('FPS');
        });
    });

    describe('Memory Tracking', () => {
        it('should track memory usage when available', () => {
            // Mock memory API
            const mockMemory = {
                usedJSHeapSize: 1024 * 1024 // 1MB
            };
            (performance as any).memory = mockMemory;
            
            // Wait for memory tracking interval
            jest.advanceTimersByTime(1000);
            
            const metrics = monitor.getMetrics();
            expect(metrics.memoryUsage).toBeGreaterThan(0);
        });
    });

    describe('Reset Functionality', () => {
        it('should reset all metrics', () => {
            // Record some metrics
            monitor.recordTiming('frameTime', 16.67);
            monitor.setObjectCount(10);
            
            // Reset
            monitor.reset();
            
            // Check if reset worked
            const metrics = monitor.getMetrics();
            const stats = monitor.getTimingStats('frameTime');
            expect(metrics.frameTime).toBe(0);
            expect(metrics.objectCount).toBe(0);
            expect(stats?.timestamps).toHaveLength(0);
        });
    });
}); 