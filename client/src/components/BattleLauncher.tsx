// src/components/BattleLauncher.tsx
import { useState, useEffect } from "react";
import { useDojo } from "../hooks/useDojo";
import { useWallet } from "../context/WalletContext";
import { BattleActions } from "./BattleActions";
import type { BigNumberish } from "starknet";
import { useConnect } from '@starknet-react/core';
import ControllerConnector from '@cartridge/connector/controller';
import { useCreatePlayer } from "../hooks/useCreatePlayer";
import { useJoinBattle } from "../hooks/useJoinBattle";
import { lookupAddresses } from '@cartridge/controller';
import { useNavigate } from 'react-router-dom';
import { BattleArena } from "./BattleArena";

interface BattleLauncherProps {
  amount: string;
}

export function BattleLauncher({ amount }: BattleLauncherProps) {
  const navigate = useNavigate();
  const { walletConnection } = useWallet();
  const [selectedBattleId, setSelectedBattleId] = useState<string | null>(null);
  const [battleId, setBattleId] = useState("");
  const [activeBattleId, setActiveBattleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  
  const [txHash, setTxHash] = useState<string | null>(null);
  const { setup } = useDojo();
  const { connectors } = useConnect();
  const controller = connectors[0] as ControllerConnector;
  const { execute: createPlayer, submitted } = useCreatePlayer();
  const { battles, loading: loadingBattles, fetchAvailableBattles } = useJoinBattle();
  const [usernames, setUsernames] = useState<Map<string, string>>(new Map());
  

  // Convertir el amount a wei en formato hexadecimal
  const amountInWei = amount 
    ? "0x" + (BigInt(Math.floor(parseFloat(amount) * 1e18))).toString(16)
    : "0x0";

  // Para mostrar en la UI, convertimos el hex a decimal
  const amountInWeiDecimal = amount
    ? BigInt(Math.floor(parseFloat(amount) * 1e18)).toString()
    : "0";

  // Simplificar la validación para solo verificar el monto
  const isValidAmount = Boolean(
    amount && 
    !isNaN(parseFloat(amount)) && 
    parseFloat(amount) > 0
  );

  // Ahora canInteract depende del monto y el estado de loading
  const canInteract = Boolean(isValidAmount && !loading && !submitted);

  // Cargar batallas y usernames cuando cambie el monto
  useEffect(() => {
    const loadBattlesAndUsernames = async () => {
      if (isValidAmount && amountInWei) {
        const battlesData = await fetchAvailableBattles(amountInWei);
        if (battlesData && battlesData.length > 0) {
          // Obtener todas las direcciones de los creadores de batallas
          const addresses = battlesData.map(battle => battle.player1);
          try {
            const addressMap = await lookupAddresses(addresses);
            setUsernames(addressMap);
          } catch (error) {
            console.error("Error fetching usernames:", error);
          }
        }
      }
    };

    loadBattlesAndUsernames();
  }, [amountInWei, isValidAmount, fetchAvailableBattles]);

  const getDisplayName = (address: string) => {
    const username = usernames.get(address);
    if (username) return username;
    // Si no hay username, acortar la dirección
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const validateAmount = () => {
    if (!isValidAmount) {
      alert("Por favor, selecciona un monto válido.");
      return false;
    }
    return true;
  };

  const handleCreateBattle = async () => {
    if (!validateAmount()) return;
    
    try {
      setLoading(true);
      console.log("Creando batalla con monto:", amountInWei);

      const result = await createPlayer(amountInWei as BigNumberish);
      if (result) {
        setTxHash(result.transaction_hash);
        alert("¡Transacción enviada! Hash: " + result.transaction_hash);
      }

    } catch (error: any) {
      console.error("Error detallado al crear la batalla:", {
        error,
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      });

      let errorMessage = "Error al crear la batalla: ";
      
      if (error instanceof Error) {
        if (error.message.includes("Max fee") && error.message.includes("exceeds balance")) {
          errorMessage = 
            "No tienes suficientes fondos para pagar la tarifa de transacción.\n\n" +
            "Por favor:\n" +
            "1. Visita el faucet de Starknet: https://faucet.goerli.starknet.io\n" +
            "2. Conecta tu wallet\n" +
            "3. Solicita ETH de prueba\n" +
            "4. Espera unos minutos a que se confirme la transacción\n" +
            "5. Intenta crear la batalla nuevamente";
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += "Error desconocido";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinBattle = async () => {
    if (!validateAmount()) return;

    if (!battleId) {
      alert("Por favor, ingresa un ID de batalla válido.");
      return;
    }

    try {
      setLoading(true);
      console.log("Uniendo a batalla con Cartridge:", {
        battleId,
        controller: Boolean(controller),
        controllerMethods: Object.keys(controller || {})
      });

      if (!controller) {
        throw new Error("No se encontró el controlador de Cartridge");
      }
      
      const worldContract = await setup(controller);
      const result = await worldContract.joinBattle(battleId as BigNumberish);
      
      console.log("Resultado de unirse a batalla:", {
        result,
        type: typeof result,
        properties: Object.keys(result || {})
      });

      alert("¡Te has unido a la batalla! La transacción está siendo procesada.");
      setActiveBattleId(battleId);
      setBattleId("");
    } catch (error: any) {
      console.error("Error detallado al unirse a la batalla:", {
        error,
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      });
      alert("Error al unirse a la batalla: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBattleClick = (battleId: number) => {
    setSelectedBattleId(battleId.toString());
  };

  const handleAttack = () => {
    console.log("Ataque realizado en batalla:", selectedBattleId);
  };

  // Si hay una batalla seleccionada, mostrar la vista de batalla
  if (selectedBattleId) {
    return (
      <div className="w-full">
        <button 
          onClick={() => setSelectedBattleId(null)}
          className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          ← Volver a la lista de batallas
        </button>
        <BattleArena
          battleId={selectedBattleId}
          player1Health={100}
          player2Health={100}
          isMyTurn={true}
          onAttack={handleAttack}
        />
      </div>
    );
  }

  // Si no hay batalla seleccionada, mostrar la lista de batallas
  return (
    <div className="space-y-6">
      <div className="p-6 border rounded-xl shadow-md border-gray-900">
        <h2 className="text-2xl text-neutral-900 font-semibold mb-4">Batalla</h2>
        
        <div className="space-y-4">
          {!isValidAmount && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700">
                <strong>Monto no válido:</strong> Por favor, selecciona un monto válido para continuar.
              </p>
            </div>
          )}

          <div className="mb-4">
            <p className="text-neutral-600">Monto seleccionado:</p>
            {isValidAmount ? (
              <>
                <p className="text-xl font-semibold text-purple-600">{amount} ETH</p>
                <p className="text-sm text-gray-500">
                  Decimal: {amountInWeiDecimal} wei
                  <br />
                  Hex: {amountInWei}
                </p>
              </>
            ) : (
              <p className="text-sm text-red-500">Selecciona un monto para continuar</p>
            )}
          </div>

          {txHash && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700">
                <strong>Transacción enviada:</strong>
                <br />
                Hash: {txHash}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={handleCreateBattle}
              disabled={!canInteract}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all duration-300
                ${!canInteract
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-700 border-2 border-purple-300'
                }
              `}
            >
              {loading ? 'Creando batalla...' : 'Crear Batalla'}
            </button>
          </div>

          {/* Lista de batallas disponibles */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Batallas Disponibles
              {loadingBattles && <span className="ml-2 text-sm text-gray-500">(Cargando...)</span>}
            </h3>
            
            {battles.length > 0 ? (
              <div className="grid gap-4">
                {battles.map((battle) => (
                  <div 
                    key={battle.battle_id}
                    onClick={() => handleBattleClick(battle.battle_id)}
                    className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 cursor-pointer transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-purple-700">Batalla #{battle.battle_id}</p>
                        <p className="text-sm text-gray-600">
                          Creador: {getDisplayName(battle.player1)}
                          {!usernames.get(battle.player1) && (
                            <span className="text-xs text-gray-400 ml-1">(Cargando username...)</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-purple-600">{amount} ETH</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isValidAmount ? (
              <p className="text-gray-500 text-center py-4">
                No hay batallas disponibles con este monto
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {activeBattleId && (
        <BattleActions battleId={activeBattleId} />
      )}
    </div>
  );
}


