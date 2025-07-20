import { ObjectPool, type Poolable } from './pool';

export class Block implements Poolable {
    private x: number = 0;
    private y: number = 0;
    private width: number = 40;
    private height: number = 40;
    private speed: number = 0;
    private active: boolean = false;

    public reset(): void {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.active = false;
    }

    public init(x: number, y: number, speed: number): void {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.active = true;
    }

    public isActive(): boolean {
        return this.active;
    }

    public setActive(active: boolean): void {
        this.active = active;
    }

    public update(deltaTime: number): void {
        this.y += this.speed * deltaTime;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    public getPosition(): { x: number; y: number; width: number; height: number } {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    public isOffScreen(canvasHeight: number): boolean {
        return this.y > canvasHeight;
    }
}

export class BlockManager {
    private blocks: Block[] = [];
    private spawnInterval: number;
    private lastSpawnTime: number = 0;
    private baseSpeed: number = 200;
    private speedMultiplier: number = 1;
    private speedIncreaseInterval: number = 10000; // 10 seconds
    private lastSpeedIncrease: number = 0;
    private blocksDodged: number = 0;
    private blockPool: ObjectPool<Block>;

    constructor(spawnInterval: number) {
        this.spawnInterval = spawnInterval;
        this.blockPool = new ObjectPool<Block>(
            () => new Block(),
            50,  // initial size
            1000, // max size
            20    // grow size
        );
    }

    public startGame(): void {
        this.blockPool.releaseAll();
        this.blocks = [];
        this.lastSpawnTime = performance.now();
        this.lastSpeedIncrease = performance.now();
        this.speedMultiplier = 1;
        this.blocksDodged = 0;
    }

    public update(deltaTime: number, timestamp: number, canvasWidth: number, canvasHeight: number): void {
        // Update existing blocks
        this.blocks = this.blocks.filter(block => {
            block.update(deltaTime);
            if (block.isOffScreen(canvasHeight)) {
                this.blocksDodged++;
                this.blockPool.release(block);
                return false;
            }
            return true;
        });

        // Spawn new blocks
        if (timestamp - this.lastSpawnTime >= this.spawnInterval) {
            const x = Math.random() * (canvasWidth - 40); // 40 is block width
            const block = this.blockPool.acquire();
            if (block) {
                block.init(x, -40, this.baseSpeed * this.speedMultiplier);
                this.blocks.push(block);
            }
            this.lastSpawnTime = timestamp;
        }

        // Increase speed every 10 seconds
        if (timestamp - this.lastSpeedIncrease >= this.speedIncreaseInterval) {
            this.speedMultiplier += 0.1;
            this.lastSpeedIncrease = timestamp;
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.blocks.forEach(block => block.draw(ctx));
    }

    public getBlocks(): Block[] {
        return this.blocks;
    }

    public getCurrentSpeed(): number {
        return this.speedMultiplier;
    }

    public getBlocksDodged(): number {
        const dodged = this.blocksDodged;
        this.blocksDodged = 0; // Reset after reading
        return dodged;
    }

    public getBlockCount(): number {
        return this.blocks.length;
    }

    public getPoolStats(): { active: number; total: number; available: number } {
        return this.blockPool.getStats();
    }
} 