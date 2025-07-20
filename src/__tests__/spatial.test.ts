import { SpatialGrid } from '../spatial';

describe('SpatialGrid', () => {
    let grid: SpatialGrid;
    const worldWidth = 800;
    const worldHeight = 600;
    const cellSize = 100;

    beforeEach(() => {
        grid = new SpatialGrid(worldWidth, worldHeight, cellSize);
    });

    const createTestObject = (x: number, y: number, width = 40, height = 40) => ({
        x,
        y,
        width,
        height
    });

    describe('Object Management', () => {
        it('should insert and retrieve objects', () => {
            const obj = createTestObject(150, 150);
            grid.insertObject(obj);
            const nearby = grid.getPotentialCollisions(obj);
            expect(nearby).toHaveLength(0); // Only returns other objects
        });

        it('should remove objects', () => {
            const obj = createTestObject(150, 150);
            grid.insertObject(obj);
            grid.removeObject(obj);
            const nearby = grid.getPotentialCollisions(obj);
            expect(nearby).toHaveLength(0);
        });

        it('should update object positions', () => {
            const obj = createTestObject(150, 150);
            grid.insertObject(obj);
            
            // Move object to new position
            const oldX = obj.x;
            const oldY = obj.y;
            obj.x = 250;
            obj.y = 250;
            
            grid.updateObject(obj, oldX, oldY);
            const cellObjects = grid.getObjectsInCell(250, 250);
            expect(cellObjects).toContain(obj);
        });

        it('should clear all objects', () => {
            const obj1 = createTestObject(150, 150);
            const obj2 = createTestObject(250, 250);
            grid.insertObject(obj1);
            grid.insertObject(obj2);
            
            grid.clear();
            const stats = grid.getStats();
            expect(stats.totalObjects).toBe(0);
        });
    });

    describe('Collision Detection', () => {
        it('should find potential collisions in same cell', () => {
            const obj1 = createTestObject(150, 150);
            const obj2 = createTestObject(160, 160);
            grid.insertObject(obj1);
            grid.insertObject(obj2);
            
            const nearby = grid.getPotentialCollisions(obj1);
            expect(nearby).toContain(obj2);
        });

        it('should find potential collisions across cells', () => {
            const obj1 = createTestObject(95, 95);  // Object spanning multiple cells
            const obj2 = createTestObject(105, 105);
            grid.insertObject(obj1);
            grid.insertObject(obj2);
            
            const nearby = grid.getPotentialCollisions(obj1);
            expect(nearby).toContain(obj2);
        });

        it('should not find objects in distant cells', () => {
            const obj1 = createTestObject(50, 50);
            const obj2 = createTestObject(750, 550); // Far away
            grid.insertObject(obj1);
            grid.insertObject(obj2);
            
            const nearby = grid.getPotentialCollisions(obj1);
            expect(nearby).not.toContain(obj2);
        });
    });

    describe('Grid Statistics', () => {
        it('should track object and cell counts', () => {
            const obj1 = createTestObject(150, 150);
            const obj2 = createTestObject(250, 250);
            grid.insertObject(obj1);
            grid.insertObject(obj2);
            
            const stats = grid.getStats();
            expect(stats.totalObjects).toBe(2);
            expect(stats.cells).toBeGreaterThan(0);
        });

        it('should handle objects spanning multiple cells', () => {
            const largeObj = createTestObject(95, 95, 100, 100); // Spans 4 cells
            grid.insertObject(largeObj);
            
            const stats = grid.getStats();
            expect(stats.cells).toBeGreaterThanOrEqual(4);
        });
    });

    describe('Edge Cases', () => {
        it('should handle objects at grid boundaries', () => {
            const edgeObj = createTestObject(0, 0);
            grid.insertObject(edgeObj);
            const nearby = grid.getPotentialCollisions(edgeObj);
            expect(nearby).toHaveLength(0);
        });

        it('should handle objects outside grid boundaries', () => {
            const outsideObj = createTestObject(-50, -50);
            grid.insertObject(outsideObj);
            const nearby = grid.getPotentialCollisions(outsideObj);
            expect(nearby).toHaveLength(0);
        });

        it('should handle zero-size objects', () => {
            const zeroObj = createTestObject(150, 150, 0, 0);
            grid.insertObject(zeroObj);
            const nearby = grid.getPotentialCollisions(zeroObj);
            expect(nearby).toHaveLength(0);
        });
    });
}); 