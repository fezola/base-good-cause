import React, { useState } from 'react';

export function SimpleClickTest() {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    console.log('🎯 Simple button clicked!', new Date().toISOString());
    alert(`Button clicked ${clickCount + 1} times!`);
    setClickCount(prev => prev + 1);
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="font-semibold mb-4">Simple Click Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        This is a basic button to test if click events are working at all.
      </p>
      
      <button
        onClick={handleClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        🎯 Click Me! (Clicked {clickCount} times)
      </button>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Last click: {clickCount > 0 ? new Date().toLocaleTimeString() : 'Never'}</p>
      </div>
    </div>
  );
}
