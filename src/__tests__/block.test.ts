import { Block, BlockManager } from '../block';

describe('Block', () => {
    let block: Block;

    beforeEach(() => {
        block = new Block();
        block.init(100, 200, 300); // x, y, speed
    });

    it('should initialize with correct values', () => {
        expect(block.getPosition()).toEqual({
            x: 100,
            y: 200,
            width: 40,
            height: 40
        });
    });

    it('should update position based on speed and delta time', () => {
        block.update(0.5); // 0.5 seconds
        expect(block.getPosition().y).toBe(350); // 200 + (300 * 0.5)
    });

    it('should detect when off screen', () => {
        expect(block.isOffScreen(100)).toBe(true); // y = 200 > 100
        expect(block.isOffScreen(300)).toBe(false); // y = 200 < 300
    });

    it('should implement Poolable interface', () => {
        expect(block.isActive()).toBe(true);
        block.setActive(false);
        expect(block.isActive()).toBe(false);
        block.reset();
        expect(block.getPosition()).toEqual({
            x: 0,
            y: 0,
            width: 40,
            height: 40
        });
    });
});

describe('BlockManager', () => {
    let blockManager: BlockManager;
    const canvasWidth = 800;
    const canvasHeight = 600;

    beforeEach(() => {
        blockManager = new BlockManager(1000); // 1 second spawn interval
        blockManager.startGame();
    });

    it('should start with no blocks', () => {
        expect(blockManager.getBlocks().length).toBe(0);
    });

    it('should spawn blocks at interval', () => {
        blockManager.update(0.5, 1500, canvasWidth, canvasHeight); // After spawn interval
        expect(blockManager.getBlocks().length).toBe(1);
    });

    it('should remove blocks that go off screen', () => {
        // Force spawn a block
        blockManager.update(0.5, 1500, canvasWidth, canvasHeight);
        const initialCount = blockManager.getBlocks().length;

        // Move block off screen
        blockManager.update(10, 2000, canvasWidth, canvasHeight);
        expect(blockManager.getBlocks().length).toBeLessThan(initialCount);
    });

    it('should increase speed over time', () => {
        const initialSpeed = blockManager.getCurrentSpeed();
        
        // Simulate time passing
        blockManager.update(0.5, 11000, canvasWidth, canvasHeight); // After speed increase interval
        
        expect(blockManager.getCurrentSpeed()).toBeGreaterThan(initialSpeed);
    });

    it('should track dodged blocks', () => {
        // Spawn and move a block off screen
        blockManager.update(0.5, 1500, canvasWidth, canvasHeight);
        blockManager.update(10, 2000, canvasWidth, canvasHeight);
        
        expect(blockManager.getBlocksDodged()).toBeGreaterThan(0);
    });

    it('should provide pool statistics', () => {
        const stats = blockManager.getPoolStats();
        expect(stats).toHaveProperty('active');
        expect(stats).toHaveProperty('total');
        expect(stats).toHaveProperty('available');
    });

    it('should draw blocks', () => {
        const ctx = document.createElement('canvas').getContext('2d')!;
        blockManager.update(0.5, 1500, canvasWidth, canvasHeight); // Spawn a block
        blockManager.draw(ctx);
        expect(ctx.fillRect).toHaveBeenCalled();
    });
}); 