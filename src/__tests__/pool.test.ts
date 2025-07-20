import { ObjectPool, type Poolable } from '../pool';

class TestObject implements Poolable {
    private active: boolean = false;
    public value: number = 0;

    reset(): void {
        this.value = 0;
        this.active = false;
    }

    isActive(): boolean {
        return this.active;
    }

    setActive(active: boolean): void {
        this.active = active;
    }
}

describe('ObjectPool', () => {
    let pool: ObjectPool<TestObject>;
    const initialSize = 5;
    const maxSize = 10;
    const growSize = 2;

    beforeEach(() => {
        pool = new ObjectPool<TestObject>(
            () => new TestObject(),
            initialSize,
            maxSize,
            growSize
        );
    });

    describe('Pool Initialization', () => {
        it('should create pool with initial size', () => {
            const stats = pool.getStats();
            expect(stats.total).toBe(initialSize);
            expect(stats.available).toBe(initialSize);
            expect(stats.active).toBe(0);
        });
    });

    describe('Object Acquisition', () => {
        it('should acquire and activate objects', () => {
            const obj = pool.acquire();
            expect(obj).toBeTruthy();
            expect(obj?.isActive()).toBe(true);
        });

        it('should reuse inactive objects', () => {
            const obj1 = pool.acquire();
            pool.release(obj1!);
            const obj2 = pool.acquire();
            expect(obj2).toBe(obj1);
        });

        it('should grow pool when needed', () => {
            // Acquire all initial objects
            const objects = Array(initialSize).fill(null).map(() => pool.acquire());
            expect(objects.every(obj => obj !== null)).toBe(true);

            // Acquire one more - should trigger growth
            const newObj = pool.acquire();
            expect(newObj).toBeTruthy();

            const stats = pool.getStats();
            expect(stats.total).toBe(initialSize + growSize);
        });

        it('should respect max size', () => {
            // Acquire more than max size
            const objects = Array(maxSize + 1).fill(null).map(() => pool.acquire());
            const activeCount = objects.filter(obj => obj !== null).length;
            expect(activeCount).toBe(maxSize);
        });
    });

    describe('Object Release', () => {
        it('should release and deactivate objects', () => {
            const obj = pool.acquire();
            pool.release(obj!);
            expect(obj?.isActive()).toBe(false);
        });

        it('should make released objects available for reuse', () => {
            const obj1 = pool.acquire();
            pool.release(obj1!);
            const obj2 = pool.acquire();
            expect(obj2).toBe(obj1);
        });

        it('should release all objects', () => {
            // Acquire several objects
            Array(3).fill(null).forEach(() => pool.acquire());
            
            pool.releaseAll();
            const stats = pool.getStats();
            expect(stats.active).toBe(0);
            expect(stats.available).toBe(stats.total);
        });
    });

    describe('Pool Operations', () => {
        it('should iterate over active objects', () => {
            const objects = Array(3).fill(null).map(() => pool.acquire());
            let count = 0;
            pool.forEach(() => count++);
            expect(count).toBe(3);
        });

        it('should clear pool', () => {
            // Acquire some objects
            Array(3).fill(null).forEach(() => pool.acquire());
            
            pool.clear();
            const stats = pool.getStats();
            expect(stats.total).toBe(0);
            expect(stats.active).toBe(0);
            expect(stats.available).toBe(0);
        });
    });

    describe('Object State', () => {
        it('should reset objects on acquisition', () => {
            const obj = pool.acquire();
            obj!.value = 42;
            pool.release(obj!);
            
            const reusedObj = pool.acquire();
            expect(reusedObj!.value).toBe(0);
        });

        it('should maintain object state while active', () => {
            const obj = pool.acquire();
            obj!.value = 42;
            expect(obj!.value).toBe(42);
            expect(obj!.isActive()).toBe(true);
        });
    });
}); 