import { useCallback, useState } from 'react';
import { connect, disconnect } from 'starknetkit';
import { AccountInterface } from 'starknet';
import { useWallet } from '../context/WalletContext';

export interface WalletConnection {
  address?: string;
  account?: AccountInterface;
  isConnected: boolean;
}

export const WalletConnect: React.FC = () => {
  const { walletConnection, connectWallet, disconnectWallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = useCallback(async () => {
    setIsLoading(true);
    try {
      // Primer paso: Conectar con starknetkit
      const { wallet } = await connect({
        modalMode: "alwaysAsk",
        webWalletUrl: "https://web.argent.xyz",
        dappName: "Dojon't Game",
      });

      console.log("Wallet inicial:", wallet);

      if (!wallet) {
        throw new Error("Could not connect to wallet");
      }

      try {
        // Enable wallet
        await wallet.enable();
        
        // Verify we have the necessary data
        if (!wallet.isConnected || !wallet.account || !wallet.selectedAddress) {
          throw new Error("Could not get necessary wallet data");
        }

        console.log("Wallet enabled:", {
          isConnected: wallet.isConnected,
          account: wallet.account,
          address: wallet.selectedAddress,
          provider: wallet.provider,
          signer: wallet.account.signer
        });

        // Create account object for context
        const starknetWallet = {
          account: wallet.account,
          address: wallet.selectedAddress,
          provider: wallet.provider,
          isConnected: wallet.isConnected
        };

        // Pass wallet to context
        await connectWallet(starknetWallet);

      } catch (enableError) {
        console.error("Error enabling wallet:", enableError);
        throw new Error("Error enabling wallet: " + (enableError as Error).message);
      }
    } catch (error) {
      console.error('Error in connection process:', error);
      alert('Error connecting wallet: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [connectWallet]);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      disconnectWallet();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <div className="justify-center items-center flex">
      {!walletConnection.isConnected ? (
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className={`
            px-4 py-2 transition-all  group group-hover:before:duration-500 group-hover:after:duration-500 after:duration-500 hover:border-rose-300 hover:before:[box-shadow:_20px_20px_20px_30px_#a21caf] duration-500 before:duration-500 hover:duration-500 hover:after:-right-8 hover:before:right-12 hover:before:-bottom-8 hover:before:blur hover:underline-offset-4  origin-left hover:decoration-2 hover:text-black hover:cursor-pointer relative bg-neutral-800 h-16 w-64 border p-3 text-neutral-700 text-2xl font-bold rounded-lg  overflow-hidden  before:absolute before:w-12 before:h-12 before:content[''] before:right-1 before:top-1 before:z-[-2] before:bg-violet-500 before:rounded-full before:blur-lg  after:absolute after:z-[-2] after:w-20 after:h-20 after:content['']  after:bg-rose-300 after:right-8 after:top-3 after:rounded-full after:blur-lg text-center
            ${isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-transparent'
            }
          `}
        > 
          <p className="z-50">{isLoading ? 'Connecting...' : 'Connect Wallet'}</p>
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
            {walletConnection.address?.slice(0, 6)}...{walletConnection.address?.slice(-4)}
          </span>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 rounded text-white font-medium bg-red-500 hover:bg-red-600 active:bg-red-700 transition-all duration-200"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};