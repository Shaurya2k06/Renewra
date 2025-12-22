/**
 * Animated background component with gradient mesh and floating orbs
 */
export default function AnimatedBackground({ variant = 'default', className = '' }) {
    if (variant === 'hero') {
        return (
            <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
                {/* Main gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900" />

                {/* Animated gradient orbs */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-green-500/20 rounded-full blur-[120px] animate-pulse"
                    style={{ animationDuration: '4s' }}
                />
                <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[100px] animate-pulse"
                    style={{ animationDuration: '5s', animationDelay: '1s' }}
                />
                <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[80px] animate-pulse"
                    style={{ animationDuration: '6s', animationDelay: '2s' }}
                />

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Radial gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-950" />
            </div>
        );
    }

    if (variant === 'subtle') {
        return (
            <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px]" />
            </div>
        );
    }

    if (variant === 'glow') {
        return (
            <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[150px] animate-pulse"
                    style={{ animationDuration: '3s' }}
                />
            </div>
        );
    }

    // Default variant
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[80px]" />
        </div>
    );
}

/**
 * Floating particles background (optional, more complex)
 */
export function ParticlesBackground({ count = 20, className = '' }) {
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
    }));

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute rounded-full bg-green-500/20"
                    style={{
                        width: particle.size,
                        height: particle.size,
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        animation: `float ${particle.duration}s ease-in-out infinite`,
                        animationDelay: `${particle.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}
