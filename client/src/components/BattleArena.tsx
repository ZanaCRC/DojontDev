import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import left_player from '../assets/Player1_Left.png';
import right_player from '../assets/Player2_Right.png';
import { usePerformAction } from '../hooks/usePerformAction';
import { useAccount } from '@starknet-react/core';

export const BattleArena = () => {
  const { battleId } = useParams();
  const { account } = useAccount();
  const { battleState, loading, performAction } = usePerformAction({ battleId: battleId || '0' });
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Memoizar el estado del turno para evitar re-renders innecesarios
  const isMyTurn = useMemo(() => 
    battleState.battle?.current_turn === account?.address,
    [battleState.battle?.current_turn, account?.address]
  );

  // Manejar el estado de carga inicial
  useEffect(() => {
    if (!loading && isInitialLoading) {
      setIsInitialLoading(false);
    }
  }, [loading]);

  const handleAttack = async () => {
    try {
      const attackValue = Math.floor(Math.random() * 5) + 1;
      await performAction(0, attackValue);
    } catch (error) {
      console.error("Error performing attack:", error);
    }
  };

  // Pantalla de carga inicial con fade
  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center transition-opacity duration-300">
        <div className="text-2xl text-white flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4F7CEC]"></div>
          <div>Loading battle data...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-[920px] flex items-center justify-center transition-opacity duration-300"
      style={{
        backgroundImage: 'url("/b.png")', 
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Battle ID Display */}
      <div className="absolute top-4 left-4 text-white font-bold text-lg [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
        Battle #{battleId}
      </div>
      
      {/* Contenedor principal */}
      <div className="absolute inset-0 flex items-center justify-between px-12">
        {/* Jugador 1 (Izquierda) */}
        <div className="flex flex-col items-center">
          <div className="w-48 h-64 relative">
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat transform scale-x-[-1] transition-transform duration-300"
              style={{ backgroundImage: `url(${left_player})` }} 
            />
          </div>
          {/* Barra de vida Jugador 1 */}
          <div className="w-48 h-4 bg-gray-300 rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-red-600 transition-all duration-500 ease-out"
              style={{ width: `${battleState.player1Health}%` }}
            />
          </div>
          <span className="mt-2 text-white font-bold [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
            {battleState.player1Health}/100 HP
          </span>
        </div>

        {/* Área central con botón de ataque */}
        <div className="flex flex-col items-center z-10">
          {isMyTurn ? (
            <button
              onClick={handleAttack}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg 
                       transform hover:scale-105 transition-all duration-300 shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isMyTurn || loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Attacking...</span>
                </div>
              ) : (
                "ATTACK"
              )}
            </button>
          ) : (
            <div className="px-8 py-4 bg-gray-600 text-white font-bold rounded-lg">
              OPPONENT'S TURN
            </div>
          )}
        </div>

        {/* Jugador 2 (Derecha) */}
        <div className="flex flex-col items-center">
          <div className="w-48 h-64 relative">
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-300"
              style={{ backgroundImage: `url(${right_player})` }} 
            />
          </div>
          {/* Barra de vida Jugador 2 */}
          <div className="w-48 h-4 bg-gray-300 rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-red-600 transition-all duration-500 ease-out"
              style={{ width: `${battleState.player2Health}%` }}
            />
          </div>
          <span className="mt-2 text-white font-bold [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
            {battleState.player2Health}/100 HP
          </span>
        </div>
      </div>
    </div>
  );
}; 