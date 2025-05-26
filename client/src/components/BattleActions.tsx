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
      alert("Please, connect your wallet first.");
      return false;
    }

    if (!walletConnection.account.address) {
      alert("The wallet address is not available. Please reconnect your wallet.");
      return false;
    }

    return true;
  };

  const getStarknetAccount = async () => {
    const starknet = (window as any).starknet;
    if (!starknet) {
      throw new Error("Starknet is not available.");
    }

    try {
      // Asegurarse de que la wallet esté habilitada
      await starknet.enable();
      
      // Obtener la cuenta actual
      const account = starknet.account;
      if (!account) {
        throw new Error("Could not obtain Starknet account.");
      }

      // Asegurarse de que la cuenta tenga el provider correcto
      if (!account.provider) {
        const provider = new RpcProvider({ nodeUrl: RPC_URL });
        account.provider = provider;
      }

      console.log("Starknet account obtained for action:", {
        address: account.address,
        signer: account.signer,
        provider: account.provider,
        methods: Object.getOwnPropertyNames(Object.getPrototypeOf(account))
      });

      return account;
    } catch (error) {
      console.error("Error obtaining starknet account:", error);
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
      console.log("Using starknet account for action:", starknetAccount);

      const dojoActions = await setup(starknetAccount);
      await dojoActions.performAction(
        Number(battleId),
        new CairoCustomEnum({ [selectedAction.type]: undefined }),
        selectedAction.value
      );
      alert("¡Successful action!");
    } catch (error) {
      console.error("Error performing the action:", error);
      let errorMessage = "Error performing the action: ";
      
      if (error instanceof Error) {
        if (error.message.includes("Max fee") && error.message.includes("exceeds balance")) {
          errorMessage = 
            "You don't have sufficient funds to pay the transaction fee.\n\n" +
            "Please\n" +
            "1. Visit the Starknet faucet: https://faucet.goerli.starknet.io\n" +
            "2. Connect your wallet\n" +
            "3. Request trial ETH\n" +
            "4. Wait a few minutes for the transaction to be confirmed\n" +
            "5. Try creating the battle again";
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += "Unkown Error Ocurred";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl shadow-md border-gray-200 mt-4">
      <h3 className="text-xl text-white font-semibold mb-4">Battle Actions</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Action Type
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
           Action Value 
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
            ? 'Performing Action...' 
            : !walletConnection.isConnected
              ? 'Coonect your wallet first'
              : 'Perform Action'
          }
        </button>
      </div>
    </div>
  );
}; 