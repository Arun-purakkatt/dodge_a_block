// Types for collision detection
export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface CollisionEffect {
    x: number;
    y: number;
    age: number;
    maxAge: number;
    particles: Particle[];
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    alpha: number;
}

export class CollisionSystem {
    private effects: CollisionEffect[] = [];
    private readonly particleColors = ['#FF5252', '#FF4081', '#7C4DFF', '#448AFF', '#64FFDA', '#FFD740'];

    public checkCollision(a: BoundingBox, b: BoundingBox): boolean {
        // Implement precise AABB collision detection
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    public createCollisionEffect(x: number, y: number): void {
        const effect: CollisionEffect = {
            x,
            y,
            age: 0,
            maxAge: 1, // 1 second
            particles: []
        };

        // Create explosion particles
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 2 + Math.random() * 3;
            effect.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 3,
                color: this.particleColors[Math.floor(Math.random() * this.particleColors.length)],
                alpha: 1
            });
        }

        this.effects.push(effect);
    }

    public update(deltaTime: number): void {
        // Update all active effects
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.age += deltaTime;

            // Update particles
            for (const particle of effect.particles) {
                particle.x += particle.vx * 60 * deltaTime;
                particle.y += particle.vy * 60 * deltaTime;
                particle.alpha = Math.max(0, 1 - (effect.age / effect.maxAge));
                particle.vy += 5 * deltaTime; // Add gravity
            }

            // Remove old effects
            if (effect.age >= effect.maxAge) {
                this.effects.splice(i, 1);
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Draw all active effects
        for (const effect of this.effects) {
            for (const particle of effect.particles) {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `${particle.color}${Math.floor(particle.alpha * 255).toString(16).padStart(2, '0')}`;
                ctx.fill();
            }
        }
    }

    public hasActiveEffects(): boolean {
        return this.effects.length > 0;
    }
} 