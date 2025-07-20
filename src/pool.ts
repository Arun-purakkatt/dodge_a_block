export interface Poolable {
    reset(): void;
    isActive(): boolean;
    setActive(active: boolean): void;
}

export class ObjectPool<T extends Poolable> {
    private pool: T[] = [];
    private factory: () => T;
    private maxSize: number;
    private growSize: number;

    constructor(factory: () => T, initialSize: number = 100, maxSize: number = 1000, growSize: number = 50) {
        this.factory = factory;
        this.maxSize = maxSize;
        this.growSize = growSize;
        this.initialize(initialSize);
    }

    private initialize(size: number): void {
        for (let i = 0; i < size; i++) {
            const obj = this.factory();
            obj.setActive(false);
            this.pool.push(obj);
        }
    }

    public acquire(): T | null {
        // First, try to find an inactive object
        for (const obj of this.pool) {
            if (!obj.isActive()) {
                obj.reset();
                obj.setActive(true);
                return obj;
            }
        }

        // If no inactive objects and we haven't reached max size, grow the pool
        if (this.pool.length < this.maxSize) {
            const growAmount = Math.min(this.growSize, this.maxSize - this.pool.length);
            this.initialize(growAmount);
            const obj = this.pool[this.pool.length - growAmount];
            obj.reset();
            obj.setActive(true);
            return obj;
        }

        // If we've reached max size, return null
        return null;
    }

    public release(obj: T): void {
        if (this.pool.includes(obj)) {
            obj.setActive(false);
        }
    }

    public releaseAll(): void {
        for (const obj of this.pool) {
            obj.setActive(false);
        }
    }

    public getActiveCount(): number {
        return this.pool.filter(obj => obj.isActive()).length;
    }

    public getTotalCount(): number {
        return this.pool.length;
    }

    public getStats(): { active: number; total: number; available: number } {
        const active = this.getActiveCount();
        return {
            active,
            total: this.pool.length,
            available: this.pool.length - active
        };
    }

    public forEach(callback: (obj: T) => void): void {
        this.pool.filter(obj => obj.isActive()).forEach(callback);
    }

    public clear(): void {
        this.pool = [];
    }
} 