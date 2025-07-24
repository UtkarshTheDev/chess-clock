"use client";

import { useEffect, useState } from 'react';
import { ChessTimerEngine } from '@/lib/timerEngine';
import { ClockConfig } from '@/types/chess';

export const TimerDebug = () => {
  const [engine, setEngine] = useState<ChessTimerEngine | null>(null);
  const [whiteTime, setWhiteTime] = useState(0);
  const [blackTime, setBlackTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activePlayer, setActivePlayer] = useState<"white" | "black" | null>(null);

  useEffect(() => {
    const config: ClockConfig = {
      mode: 'SUDDEN_DEATH',
      baseMillis: 5 * 60 * 1000, // 5 minutes
    };

    const timerEngine = new ChessTimerEngine(
      config,
      (state) => {
        console.log('Debug: State update received', state);
        setWhiteTime(state.whiteTimeRemaining);
        setBlackTime(state.blackTimeRemaining);
        setIsRunning(state.isRunning);
        setActivePlayer(state.activePlayer);
      },
      (player) => {
        console.log('Debug: Timeout for', player);
        alert(`${player} ran out of time!`);
      }
    );

    setEngine(timerEngine);

    return () => {
      timerEngine.destroy();
    };
  }, []);

  const handleStart = () => {
    if (engine) {
      console.log('Debug: Starting timer');
      engine.start('white');
    }
  };

  const handlePause = () => {
    if (engine) {
      console.log('Debug: Pausing timer');
      engine.pause();
    }
  };

  const handleResume = () => {
    if (engine) {
      console.log('Debug: Resuming timer');
      engine.resume();
    }
  };

  const handleSwitch = () => {
    if (engine) {
      console.log('Debug: Switching player');
      engine.switchPlayer();
    }
  };

  const handleReset = () => {
    if (engine) {
      console.log('Debug: Resetting timer');
      engine.reset();
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Timer Debug</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-white rounded border">
          <h3 className="font-bold">White</h3>
          <p className="text-2xl">{Math.floor(whiteTime / 60)}:{(whiteTime % 60).toString().padStart(2, '0')}</p>
          <p className="text-sm">{activePlayer === 'white' ? 'ACTIVE' : 'WAITING'}</p>
        </div>
        
        <div className="p-4 bg-gray-800 text-white rounded border">
          <h3 className="font-bold">Black</h3>
          <p className="text-2xl">{Math.floor(blackTime / 60)}:{(blackTime % 60).toString().padStart(2, '0')}</p>
          <p className="text-sm">{activePlayer === 'black' ? 'ACTIVE' : 'WAITING'}</p>
        </div>
      </div>

      <div className="mb-4">
        <p><strong>Status:</strong> {isRunning ? 'RUNNING' : 'STOPPED'}</p>
        <p><strong>Active Player:</strong> {activePlayer || 'None'}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button 
          onClick={handleStart}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={isRunning}
        >
          Start
        </button>
        
        <button 
          onClick={handlePause}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          disabled={!isRunning}
        >
          Pause
        </button>
        
        <button 
          onClick={handleResume}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={isRunning}
        >
          Resume
        </button>
        
        <button 
          onClick={handleSwitch}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          disabled={!isRunning}
        >
          Switch Player
        </button>
        
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
