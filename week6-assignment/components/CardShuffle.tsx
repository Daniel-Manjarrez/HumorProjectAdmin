'use client';

import { useState } from 'react';

type StatCard = {
  title: string;
  value: number | string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
};

const colorMap = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  red: 'text-red-600',
  yellow: 'text-yellow-600',
};

export default function CardShuffle({ stats }: { stats: StatCard[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % stats.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + stats.length) % stats.length);
  };

  const getCardStyle = (index: number) => {
    // Calculate distance from current index, handling wrap-around
    const length = stats.length;

    // We want to find the shortest distance.
    // e.g. if length is 5, current is 0, index 4 should be considered -1 (left), not +4 (right)
    let diff = (index - currentIndex + length) % length;
    if (diff > length / 2) diff -= length;

    let transform = '';
    let zIndex = 0;
    let opacity = 0;
    let pointerEvents = 'none';

    if (diff === 0) {
      // Center
      transform = 'translateX(0) scale(1) translateZ(0)';
      zIndex = 30;
      opacity = 1;
      pointerEvents = 'auto';
    } else if (diff === -1) {
      // Left
      transform = 'translateX(-180px) scale(0.85) translateZ(-50px) rotateY(15deg)';
      zIndex = 20;
      opacity = 0.7;
      pointerEvents = 'auto';
    } else if (diff === 1) {
      // Right
      transform = 'translateX(180px) scale(0.85) translateZ(-50px) rotateY(-15deg)';
      zIndex = 20;
      opacity = 0.7;
      pointerEvents = 'auto';
    } else if (diff === -2) {
      // Far Left (hidden but ready to slide in)
      transform = 'translateX(-300px) scale(0.7) translateZ(-100px) rotateY(30deg)';
      zIndex = 10;
      opacity = 0;
    } else if (diff === 2) {
      // Far Right (hidden but ready to slide in)
      transform = 'translateX(300px) scale(0.7) translateZ(-100px) rotateY(-30deg)';
      zIndex = 10;
      opacity = 0;
    } else {
      // Hidden behind center
      transform = 'translateX(0) scale(0.5) translateZ(-200px)';
      zIndex = 0;
      opacity = 0;
    }

    return { transform, zIndex, opacity, pointerEvents };
  };

  if (stats.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-xl p-8 relative overflow-hidden perspective-1000">

      <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '1000px' }}>
        {stats.map((card, index) => {
          const style = getCardStyle(index);
          const isCenter = index === currentIndex;

          return (
            <div
              key={index}
              className="absolute transition-all duration-500 ease-out"
              style={{
                transform: style.transform,
                zIndex: style.zIndex,
                opacity: style.opacity,
                pointerEvents: style.pointerEvents as any
              }}
              onClick={() => {
                if (index === currentIndex) setIsFlipped(!isFlipped);
                else if (index === (currentIndex - 1 + stats.length) % stats.length) handlePrev();
                else if (index === (currentIndex + 1) % stats.length) handleNext();
              }}
            >
              <div
                className="relative w-64 h-80 group cursor-pointer"
                style={{ perspective: '1000px' }}
              >
                <div
                  className={`
                    relative w-full h-full transition-transform duration-700 transform-style-3d
                  `}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isCenter && isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* Front */}
                  <div
                    className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center p-6 text-center border border-gray-100 backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{card.title}</h3>
                    <p className={`text-5xl font-extrabold ${colorMap[card.color]}`}>
                      {card.value}
                    </p>
                    {isCenter && <p className="mt-4 text-sm text-gray-400">Click to flip</p>}
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 w-full h-full bg-gray-800 text-white rounded-2xl shadow-2xl flex flex-col items-center justify-center p-6 text-center backface-hidden"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <p className="text-lg font-medium leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between w-full max-w-md mt-8 absolute bottom-4 px-8 z-30 pointer-events-none">
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="bg-gray-800 text-white p-4 rounded-full shadow-lg hover:bg-gray-700 hover:scale-110 transition-all pointer-events-auto"
          aria-label="Previous"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex gap-2 items-center pointer-events-auto bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
          {stats.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-blue-600 w-4' : 'bg-gray-400'}`}
            />
          ))}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="bg-gray-800 text-white p-4 rounded-full shadow-lg hover:bg-gray-700 hover:scale-110 transition-all pointer-events-auto"
          aria-label="Next"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
