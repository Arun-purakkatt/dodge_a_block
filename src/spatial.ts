interface GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface GridCell {
    objects: GameObject[];
}

export class SpatialGrid {
    private cellSize: number;
    private gridWidth: number;
    private gridHeight: number;
    private grid: Map<string, GridCell>;

    constructor(worldWidth: number, worldHeight: number, cellSize: number) {
        this.cellSize = cellSize;
        this.gridWidth = Math.ceil(worldWidth / cellSize);
        this.gridHeight = Math.ceil(worldHeight / cellSize);
        this.grid = new Map();
    }

    private getCellKey(x: number, y: number): string {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }

    private getCellsForObject(obj: GameObject): string[] {
        const startX = Math.floor(obj.x / this.cellSize);
        const startY = Math.floor(obj.y / this.cellSize);
        const endX = Math.floor((obj.x + obj.width) / this.cellSize);
        const endY = Math.floor((obj.y + obj.height) / this.cellSize);
        
        const cells: string[] = [];
        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    cells.push(`${x},${y}`);
                }
            }
        }
        return cells;
    }

    public clear(): void {
        this.grid.clear();
    }

    public insertObject(obj: GameObject): void {
        const cells = this.getCellsForObject(obj);
        for (const cellKey of cells) {
            if (!this.grid.has(cellKey)) {
                this.grid.set(cellKey, { objects: [] });
            }
            this.grid.get(cellKey)!.objects.push(obj);
        }
    }

    public getPotentialCollisions(obj: GameObject): GameObject[] {
        const cells = this.getCellsForObject(obj);
        const nearbyObjects = new Set<GameObject>();

        for (const cellKey of cells) {
            const cell = this.grid.get(cellKey);
            if (cell) {
                for (const other of cell.objects) {
                    if (other !== obj) {
                        nearbyObjects.add(other);
                    }
                }
            }
        }

        return Array.from(nearbyObjects);
    }

    public removeObject(obj: GameObject): void {
        const cells = this.getCellsForObject(obj);
        for (const cellKey of cells) {
            const cell = this.grid.get(cellKey);
            if (cell) {
                cell.objects = cell.objects.filter(o => o !== obj);
                if (cell.objects.length === 0) {
                    this.grid.delete(cellKey);
                }
            }
        }
    }

    public updateObject(obj: GameObject, oldX: number, oldY: number): void {
        // Remove from old cells
        const oldObj = { ...obj, x: oldX, y: oldY };
        this.removeObject(oldObj);
        // Insert into new cells
        this.insertObject(obj);
    }

    public getObjectsInCell(x: number, y: number): GameObject[] {
        const cellKey = this.getCellKey(x, y);
        const cell = this.grid.get(cellKey);
        return cell ? [...cell.objects] : [];
    }

    public getStats(): { cells: number; totalObjects: number } {
        let totalObjects = 0;
        for (const cell of this.grid.values()) {
            totalObjects += cell.objects.length;
        }
        return {
            cells: this.grid.size,
            totalObjects
        };
    }
} 