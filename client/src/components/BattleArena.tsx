import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import left_player from '../assets/Player1_Left.png';
import right_player from '../assets/Player2_Right.png';
import { usePerformAction } from '../hooks/usePerformAction';
import { useAccount } from '@starknet-react/core';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export const BattleArena = () => {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const { account } = useAccount();
  const { battleState, loading, performAction, isMyTurn, refreshBattleState } = usePerformAction({ battleId: battleId || '0' });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [attackInProgress, setAttackInProgress] = useState(false);
  const [loadingRetries, setLoadingRetries] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasReachedMaxRetries, setHasReachedMaxRetries] = useState(false);

  // Efecto para manejar la visibilidad inicial - solo se ejecuta una vez
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Efecto principal para cargar datos de batalla - se ejecuta solo cuando es necesario
  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const attemptLoad = async () => {
      if (!mounted || hasReachedMaxRetries) return;

      try {
        await refreshBattleState();
        
        if (mounted) {
          if (!battleState.battle && loadingRetries < MAX_RETRIES) {
            retryTimeout = setTimeout(() => {
              if (mounted) {
                setLoadingRetries(prev => prev + 1);
              }
            }, RETRY_DELAY);
          } else if (!battleState.battle) {
            setHasReachedMaxRetries(true);
            setLoadError('No se pudo cargar la batalla después de varios intentos');
            setIsInitialLoading(false);
          } else {
            setLoadError(null);
            setIsInitialLoading(false);
            setHasReachedMaxRetries(false);
          }
        }
      } catch (error) {
        if (!mounted) return;
        
        console.error("Error loading battle data:", error);
        if (loadingRetries < MAX_RETRIES) {
          retryTimeout = setTimeout(() => {
            if (mounted) {
              setLoadingRetries(prev => prev + 1);
            }
          }, RETRY_DELAY);
        } else {
          setHasReachedMaxRetries(true);
          setLoadError('Error al cargar los datos de la batalla');
          setIsInitialLoading(false);
        }
      }
    };

    if (battleId && isInitialLoading) {
      attemptLoad();
    }

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [battleId, loadingRetries, refreshBattleState, battleState.battle, hasReachedMaxRetries, isInitialLoading]);

  // Manejador de reintento manual
  const handleManualRetry = useCallback(() => {
    setLoadingRetries(0);
    setLoadError(null);
    setIsInitialLoading(true);
    setHasReachedMaxRetries(false);
  }, []);

  // Verificar si somos player1 o player2 (con validación)
  const amIPlayer1 = battleState.battle?.player1 && account?.address 
    ? battleState.battle.player1.toLowerCase() === account.address.toLowerCase()
    : false;

  const amIPlayer2 = battleState.battle?.player2 && account?.address
    ? battleState.battle.player2.toLowerCase() === account.address.toLowerCase()
    : false;

  const handleAttack = async () => {
    if (!isMyTurn() || attackInProgress || !battleState.battle) return;

    try {
      setAttackInProgress(true);
      const attackValue = Math.floor(Math.random() * 5) + 1;
      await performAction(0, attackValue);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshBattleState();
    } catch (error) {
      console.error("Error performing attack:", error);
    } finally {
      setAttackInProgress(false);
    }
  };

  // Pantalla de carga inicial con fade y mensaje de error
  if (isInitialLoading || loading) {
    return (
      <div 
        className={`fixed inset-0 bg-black/90 flex items-center justify-center transition-all duration-300 ease-in-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="text-2xl text-white flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4F7CEC]"></div>
          <div className="transition-opacity duration-300">
            Cargando datos de la batalla... {loadingRetries > 0 ? `(Intento ${loadingRetries}/${MAX_RETRIES})` : ''}
          </div>
          {loadError && (
            <div className="text-red-500 text-lg mt-2 transition-opacity duration-300">
              {loadError}
              <button
                onClick={() => {
                  setLoadingRetries(0);
                  setLoadError(null);
                  setIsInitialLoading(true);
                }}
                className="ml-4 px-4 py-2 bg-[#4F7CEC] rounded-lg hover:bg-[#4F7CEC]/80 text-white transition-colors duration-300"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Si hay error y no está cargando, mostrar pantalla de error
  if (loadError && !isInitialLoading) {
    return (
      <div 
        className={`fixed inset-0 bg-black/90 flex items-center justify-center transition-all duration-300 ease-in-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Error al cargar la batalla</h2>
          <p className="mb-4 text-red-500">{loadError}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleManualRetry}
              className="px-6 py-3 bg-[#4F7CEC] rounded-lg hover:bg-[#4F7CEC]/80 transition-colors duration-300"
            >
              Reintentar
            </button>
            <button
              onClick={() => navigate('/battleview')}
              className="px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors duration-300"
            >
              Volver al lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verificar si el usuario es parte de la batalla
  if (!amIPlayer1 && !amIPlayer2) {
    if (!battleState.battle) {
      return (
        <div 
          className={`fixed inset-0 bg-black/90 flex items-center justify-center transition-all duration-300 ease-in-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Error al cargar los datos de la batalla</h2>
            <button
              onClick={() => navigate('/battleview')}
              className="px-6 py-3 bg-[#4F7CEC] rounded-lg hover:bg-[#4F7CEC]/80 transition-colors duration-300"
            >
              Volver al lobby
            </button>
          </div>
        </div>
      );
    }

    return (
      <div 
        className={`fixed inset-0 bg-black/90 flex items-center justify-center transition-all duration-300 ease-in-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">No eres parte de esta batalla</h2>
          <p className="mb-4 text-gray-400">
            Player 1: {battleState.battle.player1.slice(0, 6)}...{battleState.battle.player1.slice(-4)}<br/>
            Player 2: {battleState.battle.player2 ? `${battleState.battle.player2.slice(0, 6)}...${battleState.battle.player2.slice(-4)}` : 'Esperando oponente'}
          </p>
          <button
            onClick={() => navigate('/battleview')}
            className="px-6 py-3 bg-[#4F7CEC] rounded-lg hover:bg-[#4F7CEC]/80 transition-colors duration-300"
          >
            Volver al lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full h-[920px] flex items-center justify-center transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundImage: 'url("/b.png")', 
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Battle ID y Estado del Turno */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="text-white font-bold text-lg [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
          Battle #{battleId}
        </div>
        <div className={`text-sm font-medium px-3 py-1 rounded-lg ${
          isMyTurn() 
            ? 'bg-green-500/80 text-white' 
            : 'bg-red-500/80 text-white'
        }`}>
          {isMyTurn() ? 'Tu turno' : 'Turno del oponente'}
        </div>
      </div>
      
      {/* Contenedor principal */}
      <div className="absolute inset-0 flex items-center justify-between px-12">
        {/* Jugador 1 (Izquierda) */}
        <div className="flex flex-col items-center">
          <div className="w-48 h-64 relative">
            <div 
              className={`absolute inset-0 bg-contain bg-center bg-no-repeat transform scale-x-[-1] transition-all duration-300 ${
                amIPlayer1 && isMyTurn() ? 'scale-110' : ''
              }`}
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
            {amIPlayer1 && <span className="ml-2">(Tú)</span>}
          </span>
        </div>

        {/* Área central con botón de ataque */}
        <div className="flex flex-col items-center z-10">
          {isMyTurn() ? (
            <button
              onClick={handleAttack}
              disabled={attackInProgress || !isMyTurn()}
              className="px-8 py-4 bg-gradient-to-r from-[#4F7CEC] to-[#9c40ff] text-white font-bold rounded-lg 
                       transform hover:scale-105 transition-all duration-300 shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {attackInProgress ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Atacando...</span>
                </div>
              ) : (
                "ATACAR"
              )}
            </button>
          ) : (
            <div className="px-8 py-4 bg-gray-600/50 backdrop-blur-sm text-white font-bold rounded-lg border border-white/10">
              TURNO DEL OPONENTE
            </div>
          )}
        </div>

        {/* Jugador 2 (Derecha) */}
        <div className="flex flex-col items-center">
          <div className="w-48 h-64 relative">
            <div 
              className={`absolute inset-0 bg-contain bg-center bg-no-repeat transition-all duration-300 ${
                amIPlayer2 && isMyTurn() ? 'scale-110' : ''
              }`}
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
            {amIPlayer2 && <span className="ml-2">(Tú)</span>}
          </span>
        </div>
      </div>
    </div>
  );
}; 