import React, { useEffect, useState, useRef } from 'react';
import left_player from '../assets/Player1_Left.png';
import right_player from '../assets/Player2_Right.png';
import { usePerformAction } from '../hooks/usePerformAction';
import { useAccount } from '@starknet-react/core';
import { lookupAddresses } from '@cartridge/controller';
import { useLocation, useParams } from 'react-router-dom';

// Definir los keyframes y clases de animación
const floatingAnimation = `
  @keyframes floating {
    0% {
      transform: translateY(0px) scale(-1, 1);
    }
    50% {
      transform: translateY(-15px) scale(-1, 1);
    }
    100% {
      transform: translateY(0px) scale(-1, 1);
    }
  }

  @keyframes floatingRight {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-15px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  .float-left {
    animation: floating 3s ease-in-out infinite;
  }

  .float-right {
    animation: floatingRight 3s ease-in-out infinite;
  }
`;

export const BattleArena = () => {
  const { battleId } = useParams();
  const location = useLocation();
  const { account } = useAccount();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isWaiting, setIsWaiting] = useState(true);  // Empezamos asumiendo que estamos esperando
  const { 
    battleState, 
    loading, 
    performAction, 
    isMyTurn,
    refreshBattleState 
  } = usePerformAction({ battleId: battleId || "0" });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [usernames, setUsernames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Inyectar los estilos de animación
    const styleSheet = document.createElement("style");
    styleSheet.textContent = floatingAnimation;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    console.log('🎮 Battle Arena Mounted');
    console.log('🎮 Battle ID:', battleId);
    console.log('🎮 Account:', account?.address);
    refreshBattleState(); // Forzar una actualización inicial
  }, []);

  useEffect(() => {
    const loadUsernames = async () => {
      if (battleState.battle?.player1 && battleState.battle?.player2) {
        try {
          const addresses = [battleState.battle.player1, battleState.battle.player2];
          const addressMap = await lookupAddresses(addresses);
          setUsernames(addressMap);
        } catch (error) {
          console.error("Error fetching usernames:", error);
        }
      }
    };

    loadUsernames();
  }, [battleState.battle?.player1, battleState.battle?.player2]);

  const getDisplayName = (address: string) => {
    const username = usernames.get(address);
    if (username) return username;
    // Si no hay username, acortar la dirección
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    console.log('🎮 Battle State Updated:', {
      battle: battleState.battle,
      player1Health: battleState.player1Health,
      player2Health: battleState.player2Health,
      isMyTurn: isMyTurn()
    });
  }, [battleState, isMyTurn]);

  useEffect(() => {
    if (!loading && isInitialLoading) {
      setIsInitialLoading(false);
    }
  }, [loading]);

  const handleAttack = async () => {
    try {
      console.log('🎮 Initiating Attack');
      const attackValue = Math.floor(Math.random() * 5) + 1;
      console.log('🎮 Attack Value:', attackValue);
      await performAction(0, attackValue);
      await refreshBattleState(); // Actualizar estado después del ataque
      console.log('🎮 Attack Completed');
    } catch (error) {
      console.error("🎮 Error performing attack:", error);
    }
  };

  // Inicializar y manejar el audio
  useEffect(() => {
    // Crear el elemento de audio
    audioRef.current = new Audio('/battlesound.mp3');
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5; // 50% volumen
      audioRef.current.play().catch(error => {
        console.warn("Audio autoplay failed:", error);
      });
    }

    // Cleanup cuando el componente se desmonte
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Efecto para verificar el estado de la batalla
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkBattleStatus = async () => {
      await refreshBattleState();
      if (battleState.battle?.status === 'InProgress') {
        setIsWaiting(false);
      }
    };

    if (isWaiting) {
      // Verificar el estado cada 3 segundos
      intervalId = setInterval(checkBattleStatus, 3000);
      checkBattleStatus(); // Verificar inmediatamente también
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isWaiting, battleState.battle?.status, refreshBattleState]);

  // Pantalla de espera
  if (isWaiting && battleState.battle?.status !== 'InProgress') {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center transition-opacity duration-300">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#4F7CEC] mx-auto"></div>
          <h2 className="text-2xl text-white font-bold">Esperando oponente...</h2>
          <p className="text-gray-400">
            Battle ID: {battleId}
          </p>
          <p className="text-sm text-gray-500">
            La batalla comenzará automáticamente cuando un oponente se una
          </p>
        </div>
      </div>
    );
  }

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

  const currentTurn = battleState.battle?.current_turn || 'Unknown';
  const myTurn = isMyTurn();

  return (
    <div 
      className="relative w-full h-[920px] flex items-center justify-center transition-opacity duration-300"
      style={{
        backgroundImage: 'url("/b.png")', 
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Audio Controls - Optional: remove if you don't want visible controls */}
      <div className="absolute top-16 right-4 text-white">
        <button
          className="px-3 py-1 bg-gray-800/50 rounded hover:bg-gray-700/50 transition-colors"
          onClick={() => {
            if (audioRef.current) {
              if (audioRef.current.paused) {
                audioRef.current.play();
              } else {
                audioRef.current.pause();
              }
            }
          }}
        >
          {audioRef.current?.paused ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Battle ID Display */}
      <div className="absolute top-4 left-4 text-white font-bold text-lg [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
        Battle #{battleId}
      </div>
      
      {/* Debug Info */}
      <div className="absolute top-4 right-4 text-white text-sm text-right [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
        <div>My Address: {account?.address ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : 'Not connected'}</div>
        <div>Current Turn: {currentTurn !== 'Unknown' ? `${currentTurn.slice(0, 6)}...${currentTurn.slice(-4)}` : 'Unknown'}</div>
        <div>Is My Turn: {myTurn ? 'Yes' : 'No'}</div>
        <div>Battle Status: {battleState.battle?.status || 'Unknown'}</div>
      </div>
      
      {/* Debug Info */}
      <div className="absolute top-4 right-4 text-white text-sm text-right [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
        <div>My Address: {account?.address ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : 'Not connected'}</div>
        <div>Current Turn: {currentTurn !== 'Unknown' ? `${currentTurn.slice(0, 6)}...${currentTurn.slice(-4)}` : 'Unknown'}</div>
        <div>Is My Turn: {myTurn ? 'Yes' : 'No'}</div>
        <div>Battle Status: {battleState.battle?.status || 'Unknown'}</div>
      </div>
      
      {/* Contenedor principal */}
      <div className="absolute inset-0 flex items-center justify-between px-12">
        {/* Jugador 1 (Izquierda) */}
        <div className="flex flex-col items-center">
          <div className="w-48 h-64 relative">
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat float-left"
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
          <span className="mt-1 text-white text-sm [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
            {battleState.battle?.player1 ? getDisplayName(battleState.battle.player1) : 'Unknown'}
          </span>
        </div>

        {/* Área central con botón de ataque */}
        <div className="flex flex-col items-center z-10">
          {myTurn ? (
            <button
              onClick={handleAttack}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg 
                       transform hover:scale-105 transition-all duration-300 shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!myTurn || loading}
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
              className="absolute inset-0 bg-contain bg-center bg-no-repeat float-right"
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
          <span className="mt-1 text-white text-sm [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
            {battleState.battle?.player2 ? getDisplayName(battleState.battle.player2) : 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
}; 
      {/* Contenedor principal */}
      <div className="absolute inset-0 flex items-center justify-between px-12">
        {/* Jugador 1 (Izquierda) */}
        <div className="flex flex-col items-center">
          <div className="w-48 h-64 relative">
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat float-left"
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
          <span className="mt-1 text-white text-sm [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
            {battleState.battle?.player1 ? getDisplayName(battleState.battle.player1) : 'Unknown'}
          </span>
        </div>

        {/* Área central con botón de ataque */}
        <div className="flex flex-col items-center z-10">
          {myTurn ? (
            <button
              onClick={handleAttack}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg 
                       transform hover:scale-105 transition-all duration-300 shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!myTurn || loading}
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
              className="absolute inset-0 bg-contain bg-center bg-no-repeat float-right"
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
          <span className="mt-1 text-white text-sm [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
            {battleState.battle?.player2 ? getDisplayName(battleState.battle.player2) : 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
}; 