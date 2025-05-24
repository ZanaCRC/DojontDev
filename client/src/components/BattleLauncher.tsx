// src/components/BattleLauncher.tsx
import { useState, useEffect } from "react";
import { useDojo } from "../hooks/useDojo";
import { useWallet } from "../context/WalletContext";
import { BattleActions } from "./BattleActions";
import type { BigNumberish } from "starknet";
import { useConnect } from '@starknet-react/core';
import ControllerConnector from '@cartridge/connector/controller';

interface BattleLauncherProps {
  amount: string;
}

export function BattleLauncher({ amount }: BattleLauncherProps) {
  const { walletConnection } = useWallet();
  const [battleId, setBattleId] = useState("");
  const [activeBattleId, setActiveBattleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setup } = useDojo();
  const { connectors } = useConnect();
  const controller = connectors[0] as ControllerConnector;

  // Convertir el amount a wei (asumiendo que amount está en ETH)
  const amountInWei = amount ? Math.floor(parseFloat(amount) * 1e18) : 0;

  // Simplificar la validación para solo verificar el monto
  const isValidAmount = Boolean(
    amount && 
    !isNaN(parseFloat(amount)) && 
    parseFloat(amount) > 0
  );

  // Ahora canInteract solo depende del monto y el estado de loading
  const canInteract = Boolean(isValidAmount && !loading);

  useEffect(() => {
    console.log('BattleLauncher - Estado del monto:', {
      amount,
      amountInWei,
      isValidAmount,
      loading,
      canInteract,
      hasController: Boolean(controller)
    });
  }, [amount, amountInWei, isValidAmount, loading, canInteract, controller]);

  const validateAmount = () => {
    if (!isValidAmount) {
      alert("Por favor, selecciona un monto válido.");
      return false;
    }
    return true;
  };

  const handleCreateBattle = async () => {
    console.log("handleCreateBattle - Iniciando función");
    if (!validateAmount()) return;
    console.log("validateAmount - Paso 1");
    try {
      setLoading(true);
      console.log("Creando batalla con Cartridge:", {
        amount: amountInWei.toString(),
        controller: Boolean(controller),
        controllerMethods: Object.keys(controller || {})
      });

      if (!controller) {
        throw new Error("No se encontró el controlador de Cartridge");
      }

      // Usar el controlador de Cartridge para la transacción
      const worldContract = await setup(controller);
      const result = await worldContract.createPlayer(amountInWei.toString() as BigNumberish);
      console.log("result", result);
      console.log("Resultado de crear batalla:", {
        result,
        type: typeof result,
        properties: Object.keys(result || {})
      });

      alert("¡Batalla creada! La transacción está siendo procesada.");

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
                <p className="text-sm text-gray-500">({amountInWei.toString()} wei)</p>
              </>
            ) : (
              <p className="text-sm text-red-500">Selecciona un monto para continuar</p>
            )}
          </div>

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
        </div>
      </div>

      {activeBattleId && (
        <BattleActions battleId={activeBattleId} />
      )}
    </div>
  );
}


