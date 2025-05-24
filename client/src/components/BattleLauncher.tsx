// src/components/BattleLauncher.tsx
import { useState } from "react";
import { useDojo } from "../hooks/useDojo";
import { useWallet } from "../context/WalletContext";
import { BattleActions } from "./BattleActions";
import type { BigNumberish } from "starknet";
import { Account, RpcProvider } from "starknet";

const RPC_URL = import.meta.env.VITE_STARKNET_RPC_URL || "https://starknet-sepolia.public.blastapi.io";

export const BattleLauncher: React.FC = () => {
  const { walletConnection } = useWallet();
  const [stake, setStake] = useState("0");
  const [battleId, setBattleId] = useState("");
  const [activeBattleId, setActiveBattleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setup } = useDojo();

  const validateAccount = () => {
    if (!walletConnection.isConnected || !walletConnection.account) {
      alert("Por favor, conecta tu wallet primero.");
      return false;
    }

    if (!walletConnection.account.address) {
      alert("La dirección de la wallet no está disponible. Por favor, reconecta tu wallet.");
      return false;
    }

    return true;
  };

  const getStarknetAccount = async () => {
    const starknet = (window as any).starknet;
    if (!starknet) {
      throw new Error("Starknet no está disponible");
    }

    try {
      // Asegurarse de que la wallet esté habilitada
      await starknet.enable();
      
      // Obtener la cuenta actual
      const account = starknet.account;
      if (!account) {
        throw new Error("No se pudo obtener la cuenta de Starknet");
      }

      // Asegurarse de que la cuenta tenga el provider correcto
      if (!account.provider) {
        const provider = new RpcProvider({ nodeUrl: RPC_URL });
        account.provider = provider;
      }

      console.log("Cuenta Starknet obtenida:", {
        address: account.address,
        signer: account.signer,
        provider: account.provider,
        methods: Object.getOwnPropertyNames(Object.getPrototypeOf(account))
      });

      return account;
    } catch (error) {
      console.error("Error al obtener la cuenta de Starknet:", error);
      throw error;
    }
  };

  const handleCreateBattle = async () => {
    if (!validateAccount()) return;

    const accountAddress = walletConnection.account!.address;
    console.log("Dirección de la cuenta:", accountAddress);
    
    if (Number(stake) <= 0) {
      alert("La apuesta debe ser mayor que 0.");
      return;
    }

    try {
      setLoading(true);
      
      // Obtener la cuenta de Starknet
      const starknetAccount = walletConnection.account!;
      
      // Usar la cuenta de Starknet directamente
      console.log("Usando cuenta Starknet:", starknetAccount);
      
      const worldContract = await setup(starknetAccount);
      console.log("World Contract:", worldContract);
      
      console.log("Stake:", stake);
      
      const result = await worldContract.createPlayer(stake as BigNumberish);
      console.log("Batalla creada:", result);
      
      // Extraer el battleId del evento BattleCreated
      const txReceipt = result as any;
      if (txReceipt?.events?.length > 0) {
        const battleCreatedEvent = txReceipt.events.find(
          (event: any) => event.keys && event.keys.includes('BattleCreated')
        );
        
        if (battleCreatedEvent) {
          const battleId = battleCreatedEvent.data[0];
          console.log("ID de batalla creada:", battleId);
          setActiveBattleId(battleId.toString());
        }
      }

      alert("¡Jugador creado y batalla iniciada con éxito!");
      setStake("0");
    } catch (error) {
      console.error("Error al crear la batalla:", error);
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
    if (!validateAccount()) return;

    const accountAddress = walletConnection.account!.address;
    console.log("Dirección de la cuenta:", accountAddress);

    if (!battleId) {
      alert("Por favor, ingresa un ID de batalla válido.");
      return;
    }

    try {
      setLoading(true);
      
      // Obtener la cuenta de Starknet
      const starknetAccount = await getStarknetAccount();
      
      // Usar la cuenta de Starknet directamente
      console.log("Usando cuenta Starknet:", starknetAccount);
      
      const worldContract = await setup(starknetAccount);
      console.log("World Contract:", worldContract);
      
      await worldContract.joinBattle(battleId as BigNumberish);
      alert("¡Te has unido a la batalla con éxito!");
      setActiveBattleId(battleId);
      setBattleId("");
    } catch (error) {
      console.error("Error al unirse a la batalla:", error);
      alert("Error al unirse a la batalla: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 mt-10">
      {/* Crear Batalla */}
      <div className="p-4 border rounded-xl shadow-md border-gray-900">
        <h2 className="text-2xl text-neutral-900 font-semibold mb-4">Crear Batalla</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="stake" className="block text-sm font-medium text-neutral-900 mb-1">
              Apuesta (wei)
            </label>
            <input
              id="stake"
              type="number"
              min="0"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-neutral-200 bg-gray-700"
              placeholder="Ingresa la cantidad a apostar"
              disabled={loading || !walletConnection.isConnected}
            />
          </div>

          <button
            onClick={handleCreateBattle}
            disabled={!walletConnection.isConnected || Number(stake) <= 0 || loading}
            className={`
              w-full px-4 py-2 rounded-md font-medium transition-all duration-200
              ${!walletConnection.isConnected || Number(stake) <= 0 || loading
                ? 'bg-gray-600 cursor-not-allowed text-neutral-900'
                : 'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white'
              }
            `}
          >
            {loading 
              ? 'Creando batalla...'
              : !walletConnection.isConnected 
                ? 'Conecta tu wallet primero'
                : Number(stake) <= 0
                  ? 'Ingresa una apuesta válida'
                  : 'Crear Batalla'
            }
          </button>
        </div>
      </div>

      {/* Unirse a Batalla */}
      <div className="p-4 border rounded-xl shadow-md border-gray-900">
        <h2 className="text-2xl text-neutral-900 font-semibold mb-4">Unirse a Batalla</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="battleId" className="block text-sm font-medium text-nautral-900 mb-1">
              ID de Batalla
            </label>
            <input
              id="battleId"
              type="text"
              value={battleId}
              onChange={(e) => setBattleId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-900 text-neutral-900 bg-gray-300"
              placeholder="Ingresa el ID de la batalla"
              disabled={loading || !walletConnection.isConnected}
            />
          </div>

          <button
            onClick={handleJoinBattle}
            disabled={!walletConnection.isConnected || !battleId || loading}
            className={`
              w-full px-4 py-2 rounded-md font-medium transition-all duration-200
              ${!walletConnection.isConnected || !battleId || loading
                ? 'bg-gray-600 cursor-not-allowed text-neutral-900'
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-neutral-900'
              }
            `}
          >
            {loading 
              ? 'Uniéndose a la batalla...'
              : !walletConnection.isConnected 
                ? 'Conecta tu wallet primero'
                : !battleId
                  ? 'Ingresa un ID de batalla'
                  : 'Unirse a Batalla'
            }
          </button>
        </div>
      </div>

      {/* Acciones de Batalla */}
      {activeBattleId && (
        <BattleActions battleId={activeBattleId} />
      )}
    </div>
  );
};


