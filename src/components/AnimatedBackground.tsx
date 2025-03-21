import React from 'react'

const AnimatedGridPattern = () => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Background gradient base */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-800/90 to-black" />

            {/* Glowing points at intersections */}
            <div className="absolute h-full w-full">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={`glow-${i}`}
                        className="absolute w-2 h-2 rounded-full bg-green-300"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            opacity: 0.8,
                            animation: `pulse 3s infinite ${Math.random() * 2}s`,
                            filter: 'blur(2px)',
                            boxShadow: '0 0 12px rgba(34,197,94,0.8)'
                        }}
                    />
                ))}
            </div>

            {/* Multiple gradient overlays for depth */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(34,197,94,0.05) 0%, rgba(0,0,0,0.2) 100%)'
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(45deg, rgba(74,222,128,0.04) 0%, rgba(20,83,45,0.05) 100%)'
                }}
            />
            {/* Metallic overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(135deg, rgba(75,85,99,0.1) 0%, rgba(209,213,219,0.05) 50%, rgba(75,85,99,0.1) 100%)',
                    mixBlendMode: 'overlay'
                }}
            />

            <style>{`
        @keyframes slideLeft {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        @keyframes slideUp {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(0%);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.5);
          }
        }
      `}</style>
        </div>
    )
}

export default AnimatedGridPattern