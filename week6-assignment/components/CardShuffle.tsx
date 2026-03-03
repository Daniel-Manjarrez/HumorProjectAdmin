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

  const getIndex = (offset: number) => {
    return (currentIndex + offset + stats.length) % stats.length;
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % stats.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + stats.length) % stats.length);
  };

  const renderCard = (index: number, position: 'left' | 'center' | 'right') => {
    const card = stats[index];
    const isCenter = position === 'center';

    let transformClass = '';
    let zIndex = 0;

    if (position === 'left') {
      transformClass = '-translate-x-32 scale-90 opacity-60';
      zIndex = 10;
    } else if (position === 'right') {
      transformClass = 'translate-x-32 scale-90 opacity-60';
      zIndex = 10;
    } else { // center
      transformClass = 'scale-100';
      zIndex = 20;
    }

    return (
      <div
        key={`${index}-${position}`}
        className={`absolute transition-all duration-500 ease-in-out ${transformClass}`}
        style={{ zIndex }}
        onClick={() => {
          if (position === 'left') handlePrev();
          else if (position === 'right') handleNext();
          else setIsFlipped(!isFlipped);
        }}
      >
        <div
          className="relative w-64 h-80 group"
          style={{ perspective: '1000px' }} // Add perspective for 3D effect
        >
          <div
            className={`
              relative w-full h-full transition-transform duration-700
            `}
            style={{ transformStyle: 'preserve-3d', transform: isCenter && isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-6 text-center border border-gray-100"
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
              className="absolute inset-0 w-full h-full bg-gray-800 text-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-6 text-center"
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
  };

  if (stats.length === 0) return null;

  const prevIndex = getIndex(-1);
  const nextIndex = getIndex(1);

  return (
    <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-xl p-8 relative overflow-hidden">

      <div className="relative w-full h-full flex items-center justify-center">
        {stats.length > 1 && renderCard(prevIndex, 'left')}
        {renderCard(currentIndex, 'center')}
        {stats.length > 1 && renderCard(nextIndex, 'right')}
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
