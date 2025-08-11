import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type PlayerStats, type MoveRecord } from '@/stores/statsStore';
import AnimatedList from '../AnimatedList/AnimatedList';
import StatCard from './StatCard';

const EnhancedMoveItem = ({ move, whiteStats, blackStats }: { move: MoveRecord, whiteStats: PlayerStats, blackStats: PlayerStats }) => {
  const getPerformanceIndicator = (move: MoveRecord) => {
    const indicators = [];
    const allMoves = [...whiteStats.moveHistory, ...blackStats.moveHistory].sort((a, b) => a.moveNumber - b.moveNumber);
    const fastestMove = allMoves.reduce((fastest, move) => move.time < fastest.time ? move : fastest, allMoves[0]);
    const slowestMove = allMoves.reduce((slowest, move) => move.time > slowest.time ? move : slowest, allMoves[0]);
    const avgMoveTime = allMoves.reduce((sum, move) => sum + move.time, 0) / allMoves.length;

    if (move === fastestMove) indicators.push('⚡ Fastest');
    if (move === slowestMove) indicators.push('🐌 Slowest');
    if (move.type === 'check') indicators.push('👑 Check');
    if (move.type === 'checkmate') indicators.push('🏆 Checkmate');
    if (move.time > avgMoveTime * 2) indicators.push('⏰ Long think');
    if (move.time < 5) indicators.push('💨 Quick');
    if (move.timeRemaining < 30) indicators.push('⚠️ Time pressure');

    return indicators;
  };
  const indicators = getPerformanceIndicator(move);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-lg border",
        "bg-white/5 backdrop-blur-sm border-white/10",
        indicators.includes('⚡ Fastest') && "border-green-500/50 bg-green-500/5",
        indicators.includes('🐌 Slowest') && "border-red-500/50 bg-red-500/5",
        move.type === 'check' && "border-yellow-500/50 bg-yellow-500/5",
        move.type === 'checkmate' && "border-purple-500/50 bg-purple-500/5"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
            move.by === 'white' ? "bg-white text-black" : "bg-neutral-700 text-white"
          )}>
            {move.moveNumber}
          </div>
          <div>
            <span className={cn("text-sm font-medium",
              move.by === 'white' ? "text-white" : "text-neutral-300"
            )}>
              {move.by === 'white' ? 'White' : 'Black'} Move {move.moveNumber}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("text-xs px-2 py-1 rounded",
                move.phase === 'opening' && "bg-blue-500/20 text-blue-300",
                move.phase === 'middlegame' && "bg-yellow-500/20 text-yellow-300",
                move.phase === 'endgame' && "bg-red-500/20 text-red-300"
              )}>
                {move.phase?.charAt(0).toUpperCase() + move.phase?.slice(1)}
              </span>
              <span className="text-xs text-neutral-500">
                {move.timeRemaining.toFixed(1)}s remaining
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">
            {move.time.toFixed(1)}s
          </div>
          {indicators.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 justify-end">
              {indicators.map((indicator, idx) => (
                <span key={idx} className="text-xs bg-neutral-700 text-neutral-200 px-2 py-1 rounded">
                  {indicator}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MoveHistory = ({ whiteStats, blackStats }: { whiteStats: PlayerStats; blackStats: PlayerStats }) => {
  const [filterBy, setFilterBy] = useState<'all' | 'white' | 'black' | 'critical' | 'slow'>('all');

  const allMoves = [...whiteStats.moveHistory, ...blackStats.moveHistory]
    .sort((a, b) => a.moveNumber - b.moveNumber);

  const avgMoveTime = allMoves.reduce((sum, move) => sum + move.time, 0) / allMoves.length;

  const filteredMoves = allMoves.filter(move => {
    switch (filterBy) {
      case 'white':
        return move.by === 'white';
      case 'black':
        return move.by === 'black';
      case 'critical':
        return move.type === 'check' || move.type === 'checkmate';
      case 'slow':
        return move.time > avgMoveTime * 1.5;
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Move History</h3>
        <p className="text-sm text-neutral-400">Detailed move-by-move analysis with performance indicators</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {[
          { key: 'all', label: 'All Moves', count: allMoves.length },
          { key: 'white', label: 'White', count: whiteStats.moveHistory.length },
          { key: 'black', label: 'Black', count: blackStats.moveHistory.length },
          { key: 'critical', label: 'Critical', count: allMoves.filter(m => m.type !== 'normal').length },
          { key: 'slow', label: 'Slow', count: allMoves.filter(m => m.time > avgMoveTime * 1.5).length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilterBy(key as typeof filterBy)}
            className={cn(
              "px-3 py-2 rounded-lg text-xs font-medium transition-all",
              filterBy === key
                ? "bg-blue-600 text-white"
                : "bg-neutral-800 text-neutral-400 hover:text-white"
            )}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredMoves.length > 0 ? (
          (() => {
            const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReducedMotion) {
              return (
                <>
                  {filteredMoves.map((move) => (
                    <EnhancedMoveItem
                      key={`${move.by}-${move.moveNumber}`}
                      move={move}
                      whiteStats={whiteStats}
                      blackStats={blackStats}
                    />
                  ))}
                </>
              );
            }
            const items = filteredMoves.map((move) => (
              <EnhancedMoveItem key={`${move.by}-${move.moveNumber}`} move={move} whiteStats={whiteStats} blackStats={blackStats} />
            ));
            return (
              <AnimatedList
                items={items}
                showGradients={false}
                enableArrowNavigation={false}
                className="w-full"
                itemClassName="bg-neutral-800/50 border border-white/10 hover:bg-neutral-800/70"
                displayScrollbar={false}
                wrapItems={false}
              />
            );
          })()
        ) : (
          <div className="text-center py-8 text-neutral-400">
            No moves match the selected filter.
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
        <StatCard
          label="Total Moves"
          value={allMoves.length.toString()}
          tooltip="Total moves in the game"
        />
        <StatCard
          label="Critical Moves"
          value={allMoves.filter(m => m.type !== 'normal').length.toString()}
          tooltip="Checks and checkmates"
        />
        <StatCard
          label="Avg Move Time"
          value={`${avgMoveTime.toFixed(1)}s`}
          tooltip="Average time per move"
        />
        <StatCard
          label="Time Pressure"
          value={allMoves.filter(m => m.timeRemaining < 30).length.toString()}
          tooltip="Moves made with less than 30 seconds remaining"
        />
      </div>
    </div>
  );
};

export default MoveHistory;
