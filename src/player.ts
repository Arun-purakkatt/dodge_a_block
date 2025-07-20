export class Player {
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private speed: number;
    private movingLeft: boolean = false;
    private movingRight: boolean = false;

    constructor(canvasWidth: number, canvasHeight: number) {
        this.width = 50;
        this.height = 50;
        // Start at the bottom center of the canvas
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - this.height - 10; // 10px margin from bottom
        this.speed = 400; // pixels per second
    }

    public startMoving(direction: 'left' | 'right'): void {
        if (direction === 'left') {
            this.movingLeft = true;
        } else {
            this.movingRight = true;
        }
    }

    public stopMoving(direction: 'left' | 'right'): void {
        if (direction === 'left') {
            this.movingLeft = false;
        } else {
            this.movingRight = false;
        }
    }

    public update(deltaTime: number, canvasWidth: number): void {
        // Calculate movement based on time elapsed
        const movement = this.speed * deltaTime;

        // Update position based on active movement flags
        if (this.movingLeft) {
            this.x = Math.max(0, this.x - movement);
        }
        if (this.movingRight) {
            this.x = Math.min(canvasWidth - this.width, this.x + movement);
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#4CAF50';
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
} 