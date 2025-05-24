import { useCallback, useEffect, useState } from 'react';
import { connect, disconnect } from 'starknetkit';
import { AccountInterface, Account } from 'starknet';
import { useWallet } from '../context/WalletContext';

export interface WalletConnection {
  address?: string;
  account?: AccountInterface;
  isConnected: boolean;
}

interface ExtendedWallet {
  address: string;
  account?: AccountInterface;
  signer?: any;
  provider?: any;
  isConnected: boolean;
}

export const WalletConnect: React.FC = () => {
  const { walletConnection, connectWallet, disconnectWallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = useCallback(async () => {
    setIsLoading(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error al conectar wallet:', error);
    } finally {
      setIsLoading(false);
    }
  }, [connectWallet]);

  useEffect(() => {
    console.log('Estado actual de la conexión:', walletConnection);
  }, [walletConnection]);

  useEffect(() => {
    const savedConnection = localStorage.getItem('wallet_connection');
    if (savedConnection) {
      const parsed = JSON.parse(savedConnection);
      if (parsed.isConnected) {
        handleConnect();
      }
    }
  }, [handleConnect]);

  console.log('Renderizando WalletConnect, isConnected:', walletConnection.isConnected);

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
          <p className="z-50">{isLoading ? 'Conectando...' : 'Conectar Wallet'}</p>
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
            {walletConnection.address?.slice(0, 6)}...{walletConnection.address?.slice(-4)}
          </span>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 rounded text-white font-medium bg-red-500 hover:bg-red-600 active:bg-red-700 transition-all duration-200"
          >
            Desconectar
          </button>
        </div>
      )}
    </div>
  );
};