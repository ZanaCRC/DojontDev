import { useEffect, useState, useRef } from 'react';
import left_player from '../assets/Player1_Left.png';
import right_player from '../assets/Player2_Right.png';
import { usePerformAction } from '../hooks/usePerformAction';
import { useAccount } from '@starknet-react/core';
import { lookupAddresses } from '@cartridge/controller';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

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

  @keyframes attackLeft {
    0% { transform: translateX(0) scale(-1, 1); }
    50% { transform: translateX(100px) scale(-1, 1); }
    100% { transform: translateX(0) scale(-1, 1); }
  }

  @keyframes attackRight {
    0% { transform: translateX(0); }
    50% { transform: translateX(-100px); }
    100% { transform: translateX(0); }
  }

  @keyframes damageShake {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(-8px, 8px) scale(1.05); }
    50% { transform: translate(8px, -8px) scale(1.05); }
    75% { transform: translate(-8px, -8px) scale(1.05); }
  }

  @keyframes damageFlash {
    0%, 100% { filter: none; }
    50% { filter: brightness(3) saturate(150%) sepia(100%) hue-rotate(-50deg); }
  }

  .float-left {
    animation: floating 3s ease-in-out infinite;
  }

  .float-right {
    animation: floatingRight 3s ease-in-out infinite;
  }

  .attack-left {
    animation: attackLeft 1s ease-in-out;
  }

  .attack-right {
    animation: attackRight 1s ease-in-out;
  }

  .damage-shake-left {
    animation: damageShake 0.5s ease-in-out, damageFlash 0.5s ease-in-out;
    animation-fill-mode: forwards;
  }

  .damage-shake-right {
    animation: damageShake 0.5s ease-in-out, damageFlash 0.5s ease-in-out;
    animation-fill-mode: forwards;
  }

  @keyframes damageNumber {
    0% { 
      opacity: 0;
      transform: translateY(0);
    }
    20% {
      opacity: 1;
    }
    100% { 
      opacity: 0;
      transform: translateY(-50px);
    }
  }

  .damage-number {
    animation: damageNumber 1s ease-out forwards;
  }
`;

const DamageNumber = ({ damage, position }: { damage: number, position: 'left' | 'right' }) => {
  return (
    <div 
      className="absolute text-6xl font-bold text-[#4F7CEC] damage-number z-50"
      style={{
        top: '40%',
        [position]: '30%',
        textShadow: '3px 3px 6px rgba(0,0,0,0.7)'
      }}
    >
      -{damage}
    </div>
  );
};

export const BattleArena = () => {
  const { battleId } = useParams();
  const location = useLocation();
  const { account } = useAccount();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const attackSoundRef = useRef<HTMLAudioElement | null>(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const { 
    battleState, 
    loading, 
    performAction, 
    isMyTurn,
    refreshBattleState 
  } = usePerformAction({ battleId: battleId || "0" });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [usernames, setUsernames] = useState<Map<string, string>>(new Map());
  const [attackAnimation, setAttackAnimation] = useState<'left' | 'right' | null>(null);
  const [damageDisplay, setDamageDisplay] = useState<{ damage: number, position: 'left' | 'right' } | null>(null);
  const [damageAnimation, setDamageAnimation] = useState<'left' | 'right' | null>(null);
  const [lastHealthValues, setLastHealthValues] = useState({ player1: 100, player2: 100 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

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

  // Inicializar y manejar el audio de fondo
  useEffect(() => {
    const initBackgroundMusic = () => {
      if (!audioRef.current) {
        audioRef.current = new Audio('/battlesound.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.2;
      }
    };

    const playBackgroundMusic = async () => {
      try {
        if (audioRef.current && isMusicPlaying) {
          await audioRef.current.play();
        }
      } catch (error) {
        console.warn("Audio autoplay failed:", error);
      }
    };

    initBackgroundMusic();
    playBackgroundMusic();

    // Manejar eventos de visibilidad del documento
    const handleVisibilityChange = () => {
      if (document.hidden) {
        audioRef.current?.pause();
      } else if (isMusicPlaying) {
        audioRef.current?.play().catch(console.warn);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isMusicPlaying]);

  // Inicializar sonido del botón
  useEffect(() => {
    attackSoundRef.current = new Audio('/button.wav');
    if (attackSoundRef.current) {
      attackSoundRef.current.volume = 0.6;
    }

    return () => {
      if (attackSoundRef.current) {
        attackSoundRef.current.pause();
        attackSoundRef.current = null;
      }
    };
  }, []);

  const handleAttack = async () => {
    try {
      setIsAttacking(true);
      if (attackSoundRef.current) {
        attackSoundRef.current.currentTime = 0;
        attackSoundRef.current.play().catch(console.error);
      }
      
      const attackValue = Math.floor(Math.random() * 5) + 1;
      const isPlayer1 = account?.address === battleState.battle?.player1;
      
      // Set attack animation
      setAttackAnimation(isPlayer1 ? 'left' : 'right');
      
      // Show damage number
      setDamageDisplay({
        damage: attackValue,
        position: isPlayer1 ? 'right' : 'left'
      });

      // Perform the attack
      await performAction(0, attackValue);

      // Wait for animations
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Clear animations
      setAttackAnimation(null);
      setDamageDisplay(null);

      // Update battle state after animations
      setIsRefreshing(true);
      await refreshBattleState();
      setIsRefreshing(false);
    } catch (error) {
      console.error("Error performing attack:", error);
    } finally {
      setIsAttacking(false);
    }
  };

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

  // Modify the health change effect to use lastHealthValues
  useEffect(() => {
    if (isRefreshing || isAttacking) return; // Don't trigger during refresh or attack

    const isPlayer1 = account?.address === battleState.battle?.player1;
    const currentHealth = isPlayer1 ? battleState.player1Health : battleState.player2Health;
    const lastHealth = isPlayer1 ? lastHealthValues.player1 : lastHealthValues.player2;

    if (currentHealth < lastHealth) {
      // Damage taken
      setDamageAnimation(isPlayer1 ? 'left' : 'right');
      setTimeout(() => setDamageAnimation(null), 500);
    }

    // Update last health values
    setLastHealthValues({
      player1: battleState.player1Health,
      player2: battleState.player2Health
    });
  }, [battleState.player1Health, battleState.player2Health]);

  // Modify the refresh interval
  useEffect(() => {
    console.log('🎮 Setting up battle state refresh');
    
    // Initial fetch
    const initialFetch = async () => {
      setIsRefreshing(true);
      await refreshBattleState();
      setIsRefreshing(false);
    };
    initialFetch();
    
    // Set up interval with longer delay and check for animations
    const interval = setInterval(async () => {
      if (!isAttacking && !damageAnimation) {
        console.log('🎮 Auto-refreshing battle state');
        setIsRefreshing(true);
        await refreshBattleState();
        setIsRefreshing(false);
      }
    }, 3000); // Increased to 3 seconds
    
    return () => {
      console.log('🎮 Cleaning up battle state refresh');
      clearInterval(interval);
    };
  }, [refreshBattleState]);

  // Add check for completed battle
  useEffect(() => {
    if (battleState.battle?.status === 'Completed') {
      // Stop background music when battle ends
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [battleState.battle?.status]);

  // Pantalla de batalla completada
  if (battleState.battle?.status === 'Completed') {
    const winner = battleState.player1Health > 0 ? battleState.battle.player1 : battleState.battle.player2;
    const isWinner = account?.address === winner;

    return (
      <div 
        className="relative w-full h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url("/Pasted_image.png")', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="fixed inset-0 bg-[#1A2C38]/90 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#1A2C38] p-8 rounded-xl border-2 border-[#4F7CEC] shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-3xl font-bold text-center text-[#4F7CEC] mb-6">
              Battle Completed!
            </h2>
            <div className="text-center mb-8">
              <p className="text-xl text-[#E2E8F0] font-semibold mb-2">
                {isWinner ? 'You Won!' : 'You Lost!'}
              </p>
              <p className="text-[#94A3B8]">
                Winner: {getDisplayName(winner)}
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/battleview')}
                className="px-6 py-3 bg-[#4F7CEC] hover:bg-[#3D63C9] text-white font-semibold rounded-lg 
                         transform hover:scale-105 transition-all duration-300 shadow-lg
                         hover:shadow-[#4F7CEC]/50 border border-[#4F7CEC]/30"
              >
                Back to Battles
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de espera
  if (isWaiting && battleState.battle?.status !== 'InProgress') {
    return (
      <div className="fixed inset-0 bg-[#1A2C38]/95 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#4F7CEC] mx-auto"></div>
          <h2 className="text-2xl text-[#4F7CEC] font-bold">Waiting for opponent...</h2>
          <p className="text-[#E2E8F0]">
            Battle ID: {battleId}
          </p>
          <p className="text-sm text-[#94A3B8]">
            The battle will start automatically when an opponent joins
          </p>
        </div>
      </div>
    );
  }

  // Pantalla de carga inicial
  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 bg-[#1A2C38]/95 flex items-center justify-center">
        <div className="text-2xl text-[#4F7CEC] flex flex-col items-center gap-4">
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
      className="relative w-full h-screen flex items-center justify-center"
      style={{
        backgroundImage: 'url("/Pasted_image.png")', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Show damage number if exists */}
      {damageDisplay && (
        <DamageNumber damage={damageDisplay.damage} position={damageDisplay.position} />
      )}

      {/* Battle Info Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
        {/* Battle ID y Estado */}
        <div className="bg-[#1A2C38]/90 p-3 rounded-lg border border-[#4F7CEC]/30 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="text-[#4F7CEC] font-bold text-lg">
              Battle #{battleId}
            </div>
            <div className="h-4 w-4 rounded-full bg-[#4F7CEC] animate-pulse"></div>
          </div>
          <div className="text-[#E2E8F0] text-sm mt-1">
            Estado: {battleState.battle?.status === 'InProgress' ? 
              <span className="text-green-400">In Progress</span> : 
              <span className="text-yellow-400">Waiting</span>
            }
          </div>
        </div>

        {/* Audio Controls and Debug Info */}
        <div className="flex flex-col items-end gap-2">
          <button
            className="px-4 py-2 bg-[#1A2C38]/90 text-[#4F7CEC] rounded-lg hover:bg-[#2D3748] transition-all
                     shadow-lg hover:shadow-[#4F7CEC]/20 border border-[#4F7CEC]/30 backdrop-blur-sm
                     flex items-center gap-2"
            onClick={() => {
              setIsMusicPlaying(!isMusicPlaying);
              if (audioRef.current) {
                if (audioRef.current.paused) {
                  audioRef.current.play().catch(console.warn);
                } else {
                  audioRef.current.pause();
                }
              }
            }}
          >
            {!isMusicPlaying ? '🔇 Music Off' : '🔊 Music On'}
          </button>

          <div className="bg-[#1A2C38]/90 p-3 rounded-lg border border-[#4F7CEC]/30 backdrop-blur-sm">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[#E2E8F0] text-sm">
                <div className="w-2 h-2 rounded-full bg-[#4F7CEC]"></div>
                <span className="text-[#94A3B8]">Address:</span> 
                {account?.address ? 
                  <span className="font-mono">{`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}</span> : 
                  <span className="text-red-400">Not Connected</span>
                }
              </div>
              <div className="flex items-center gap-2 text-[#E2E8F0] text-sm">
                <div className="w-2 h-2 rounded-full bg-[#4F7CEC]"></div>
                <span className="text-[#94A3B8]">Turn:</span> 
                {currentTurn !== 'Unknown' ? 
                  <span className="font-mono">{`${currentTurn.slice(0, 6)}...${currentTurn.slice(-4)}`}</span> : 
                  <span className="text-yellow-400">Unknown</span>
                }
              </div>
              <div className="flex items-center gap-2 text-[#E2E8F0] text-sm">
                <div className="w-2 h-2 rounded-full bg-[#4F7CEC]"></div>
                <span className="text-[#94A3B8]">My Turn:</span> 
                {myTurn ? 
                  <span className="text-green-400">Yes</span> : 
                  <span className="text-red-400">No</span>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Players Container */}
      <div className="absolute inset-0 flex items-center justify-between px-12">
        {/* Player 1 (Left) */}
        <div className="flex flex-col items-center">
          <div className="bg-[#1A2C38]/80 p-4 rounded-lg border border-[#4F7CEC]/30 backdrop-blur-sm mb-4">
            <div className="text-[#4F7CEC] font-bold text-center mb-2">
              {battleState.battle?.player1 ? getDisplayName(battleState.battle.player1) : 'Unknown'}
            </div>
          </div>
          
          <div className="w-48 h-64 relative">
            <div 
              className={`absolute inset-0 bg-contain bg-center bg-no-repeat ${
                attackAnimation === 'left' ? 'attack-left' : 
                damageAnimation === 'left' ? 'damage-shake-left' : 'float-left'
              }`}
              style={{ backgroundImage: `url(${left_player})` }} 
            />
          </div>

          {/* Stats Container */}
          <div className="mt-4 bg-[#1A2C38]/80 p-4 rounded-lg border border-[#4F7CEC]/30 backdrop-blur-sm w-48">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#94A3B8] text-sm">HP</span>
              <span className="text-[#4F7CEC] font-bold">{battleState.player1Health}/100</span>
            </div>
            <div className="w-full h-4 bg-[#1A2C38] rounded-full overflow-hidden shadow-lg border border-[#4F7CEC]/30">
              <div 
                className="h-full bg-gradient-to-r from-[#4F7CEC] to-[#3D63C9] transition-all duration-500 ease-out"
                style={{ width: `${battleState.player1Health}%` }}
              />
            </div>
          </div>
        </div>

        {/* Central Attack Area */}
        <div className="flex flex-col items-center z-10">
          <div className="bg-[#1A2C38]/80 p-6 rounded-lg border border-[#4F7CEC]/30 backdrop-blur-sm">
            {myTurn ? (
              <button
                onClick={handleAttack}
                className="px-8 py-4 bg-gradient-to-r from-[#4F7CEC] to-[#3D63C9] hover:from-[#3D63C9] hover:to-[#2D4B9E] 
                         text-white font-bold rounded-lg transform hover:scale-105 transition-all duration-300 
                         shadow-lg hover:shadow-[#4F7CEC]/50 disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:hover:scale-100 border border-[#4F7CEC]/30
                         min-w-[200px]"
                disabled={!myTurn || isAttacking}
              >
                {isAttacking ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Attacking...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>⚔️</span>
                    <span>ATTACK</span>
                  </div>
                )}
              </button>
            ) : (
              <div className="px-8 py-4 bg-[#1A2C38] text-[#94A3B8] font-bold rounded-lg shadow-lg border border-[#4F7CEC]/30
                            min-w-[200px] text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-pulse">⏳</div>
                  <span>OPPONENT'S TURN</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Player 2 (Right) */}
        <div className="flex flex-col items-center">
          <div className="bg-[#1A2C38]/80 p-4 rounded-lg border border-[#4F7CEC]/30 backdrop-blur-sm mb-4">
            <div className="text-[#4F7CEC] font-bold text-center mb-2">
              {battleState.battle?.player2 ? getDisplayName(battleState.battle.player2) : 'Unknown'}
            </div>
          </div>
          
          <div className="w-48 h-64 relative">
            <div 
              className={`absolute inset-0 bg-contain bg-center bg-no-repeat ${
                attackAnimation === 'right' ? 'attack-right' : 
                damageAnimation === 'right' ? 'damage-shake-right' : 'float-right'
              }`}
              style={{ backgroundImage: `url(${right_player})` }} 
            />
          </div>

          {/* Stats Container */}
          <div className="mt-4 bg-[#1A2C38]/80 p-4 rounded-lg border border-[#4F7CEC]/30 backdrop-blur-sm w-48">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#94A3B8] text-sm">HP</span>
              <span className="text-[#4F7CEC] font-bold">{battleState.player2Health}/100</span>
            </div>
            <div className="w-full h-4 bg-[#1A2C38] rounded-full overflow-hidden shadow-lg border border-[#4F7CEC]/30">
              <div 
                className="h-full bg-gradient-to-r from-[#4F7CEC] to-[#3D63C9] transition-all duration-500 ease-out"
                style={{ width: `${battleState.player2Health}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 