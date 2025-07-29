// Dark Theme Loading Screen with Enhanced Animations
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isComplete, setIsComplete] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setIsComplete(true);
      setTimeout(onComplete, 800); // Longer transition for dramatic effect
    }, 2500); // 2.5 seconds loading

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center z-50 overflow-hidden">
      {/* Animated Background Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: `float 4s ease-in-out infinite ${particle.delay}s, twinkle 2s ease-in-out infinite ${particle.delay}s`
          }}
        />
      ))}

      <div className="text-center relative z-10">
        {/* Rotating Rectangle with Glow */}
        <div className="mb-12 flex justify-center">
          <div className="relative">
            {/* Glow Effect */}
            <div
              className={`
                absolute inset-0 w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600
                rounded-xl blur-xl opacity-60 transition-all duration-1000 ease-out
                ${isComplete ? 'scale-100 opacity-40' : 'scale-150 opacity-80'}
              `}
            />
            {/* Main Rectangle */}
            <div
              className={`
                relative w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                rounded-xl shadow-2xl transition-all duration-1000 ease-out
                ${isComplete ? 'rotate-0 scale-100' : 'rotate-45 scale-110'}
              `}
              style={{
                animation: isComplete ? 'none' : 'spin 1.5s ease-in-out infinite alternate, pulse 2s ease-in-out infinite'
              }}
            />
          </div>
        </div>

        {/* Brand Text with Glow */}
        <div className={`transition-all duration-800 ${isComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              BasePay
            </span>
            <span className="text-white mx-2">×</span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              FundMe
            </span>
          </h1>
          <p className="text-gray-400 text-sm tracking-wide">
            Next-Gen Decentralized Crowdfunding
          </p>

          {/* Loading Dots */}
          <div className="flex justify-center space-x-1 mt-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full"
                style={{
                  animation: `bounce 1.4s ease-in-out infinite ${i * 0.16}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}
