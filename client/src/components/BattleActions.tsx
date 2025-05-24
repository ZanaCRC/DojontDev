import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useDojo } from '../hooks/useDojo';
import { CairoCustomEnum, RpcProvider } from 'starknet';

const RPC_URL = import.meta.env.VITE_STARKNET_RPC_URL || "https://starknet-sepolia.public.blastapi.io";

interface BattleAction {
  type: 'Attack' | 'Defense';
  value: number;
}

export const BattleActions: React.FC<{ battleId: string }> = ({ battleId }) => {
  const { walletConnection } = useWallet();
  const { setup } = useDojo();
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<BattleAction>({
    type: 'Attack',
    value: 1
  });

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

      console.log("Cuenta Starknet obtenida para acción:", {
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

  const handleAction = async () => {
    if (!validateAccount()) return;

    try {
      setLoading(true);

      // Obtener la cuenta de Starknet
      const starknetAccount = await getStarknetAccount();
      
      // Usar la cuenta de Starknet directamente
      console.log("Usando cuenta Starknet para acción:", starknetAccount);

      const dojoActions = await setup(starknetAccount);
      await dojoActions.performAction(
        Number(battleId),
        new CairoCustomEnum({ [selectedAction.type]: undefined }),
        selectedAction.value
      );
      alert("¡Acción realizada con éxito!");
    } catch (error) {
      console.error("Error al realizar la acción:", error);
      let errorMessage = "Error al realizar la acción: ";
      
      if (error instanceof Error) {
        if (error.message.includes("Max fee") && error.message.includes("exceeds balance")) {
          errorMessage = 
            "No tienes suficientes fondos para pagar la tarifa de transacción.\n\n" +
            "Por favor:\n" +
            "1. Visita el faucet de Starknet: https://faucet.goerli.starknet.io\n" +
            "2. Conecta tu wallet\n" +
            "3. Solicita ETH de prueba\n" +
            "4. Espera unos minutos a que se confirme la transacción\n" +
            "5. Intenta realizar la acción nuevamente";
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

  return (
    <div className="p-4 border rounded-xl shadow-md border-gray-200 mt-4">
      <h3 className="text-xl text-white font-semibold mb-4">Acciones de Batalla</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Tipo de Acción
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['Attack', 'Defense'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedAction(prev => ({ ...prev, type }))}
                className={`
                  px-4 py-2 rounded-md font-medium transition-all duration-200
                  ${selectedAction.type === type
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }
                `}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Valor de la Acción
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={selectedAction.value}
            onChange={(e) => setSelectedAction(prev => ({
              ...prev,
              value: Math.max(1, Math.min(10, Number(e.target.value)))
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-gray-200 bg-gray-700"
          />
        </div>

        <button
          onClick={handleAction}
          disabled={loading || !walletConnection.isConnected}
          className={`
            w-full px-4 py-2 rounded-md font-medium transition-all duration-200
            ${loading || !walletConnection.isConnected
              ? 'bg-gray-600 cursor-not-allowed text-gray-200'
              : 'bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white'
            }
          `}
        >
          {loading 
            ? 'Realizando acción...' 
            : !walletConnection.isConnected
              ? 'Conecta tu wallet primero'
              : 'Realizar Acción'
          }
        </button>
      </div>
    </div>
  );
}; 