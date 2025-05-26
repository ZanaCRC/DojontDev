import React from 'react';

interface BattleArenaProps {
  player1Health: number;
  player2Health: number;
  isMyTurn: boolean;
  onAttack: () => void;
  battleId: string;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  player1Health = 100,
  player2Health = 100,
  isMyTurn = true,
  onAttack,
  battleId
}) => {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center"
         style={{
           backgroundImage: 'url("/b.png")', // Puedes usar una imagen de fondo de tu elección
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
      
      {/* Battle ID Display */}
      <div className="absolute top-4 left-4 text-white font-bold text-lg [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
        Batalla #{battleId}
      </div>
      
      {/* Contenedor principal */}
      <div className="absolute inset-0 flex items-center justify-between px-12">
        
        {/* Jugador 1 (Izquierda) */}
        <div className="flex flex-col items-center">
          <div className="w-48 h-64 relative">
            <div className="absolute inset-0 bg-contain bg-center bg-no-repeat transform scale-x-[-1]"
                 style={{ backgroundImage: 'url("/samurai1.png")' }} />
          </div>
          {/* Barra de vida Jugador 1 */}
          <div className="w-48 h-4 bg-gray-300 rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${player1Health}%` }}
            />
          </div>
          <span className="mt-2 text-white font-bold [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
            {player1Health}/100 HP
          </span>
        </div>

        {/* Área central con botón de ataque */}
        <div className="flex flex-col items-center z-10">
          {isMyTurn ? (
            <button
              onClick={onAttack}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg 
                       transform hover:scale-105 transition-all duration-300 shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isMyTurn}
            >
              ATACAR
            </button>
          ) : (
            <div className="px-8 py-4 bg-gray-600 text-white font-bold rounded-lg">
              TURNO DEL OPONENTE
            </div>
          )}
        </div>

        {/* Jugador 2 (Derecha) */}
        <div className="flex flex-col items-center">
          <div className="w-48 h-64 relative">
            <div className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                 style={{ backgroundImage: 'url("/samurai1.png")' }} />
          </div>
          {/* Barra de vida Jugador 2 */}
          <div className="w-48 h-4 bg-gray-300 rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${player2Health}%` }}
            />
          </div>
          <span className="mt-2 text-white font-bold [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
            {player2Health}/100 HP
          </span>
        </div>
      </div>
    </div>
  );
}; 