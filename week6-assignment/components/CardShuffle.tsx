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

  const currentCard = stats[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % stats.length);
    }, 300);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + stats.length) % stats.length);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-xl p-8 relative overflow-hidden">
      <div
        className="relative w-64 h-80 perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`
            relative w-full h-full transition-transform duration-700 transform-style-3d
            ${isFlipped ? 'rotate-y-180' : ''}
          `}
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center p-6 text-center backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{currentCard.title}</h3>
            <p className={`text-5xl font-extrabold ${colorMap[currentCard.color]}`}>
              {currentCard.value}
            </p>
            <p className="mt-4 text-sm text-gray-500">Click to flip</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 w-full h-full bg-gray-800 text-white rounded-2xl shadow-2xl flex flex-col items-center justify-center p-6 text-center backface-hidden rotate-y-180"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-lg font-medium leading-relaxed">
              {currentCard.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between w-full max-w-xs mt-8 absolute bottom-4 px-8">
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="bg-white p-3 rounded-full shadow-md hover:bg-gray-50 transition-colors z-10"
        >
          ←
        </button>
        <div className="flex gap-2 items-center">
          {stats.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
            />
          ))}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="bg-white p-3 rounded-full shadow-md hover:bg-gray-50 transition-colors z-10"
        >
          →
        </button>
      </div>
    </div>
  );
}
