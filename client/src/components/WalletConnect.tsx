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
  const { walletConnection, setWalletConnection } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Intentando conectar wallet...');
      const connection = await connect({
        modalMode: "alwaysAsk",
        webWalletUrl: "https://web.argent.xyz",
      });

      console.log('Resultado de conexión completo:', connection);

      if (connection?.wallet) {
        const wallet = connection.wallet as unknown as ExtendedWallet;
        console.log('Wallet detectada:', {
          address: wallet.address,
          account: wallet.account,
          signer: wallet.signer,
          provider: wallet.provider,
          isConnected: wallet.isConnected,
          methods: Object.getOwnPropertyNames(Object.getPrototypeOf(wallet))
        });

        // Asegurarnos de que tenemos una cuenta válida
        let account: AccountInterface;
        
        // Si la wallet tiene una cuenta, usarla
        if (wallet.account) {
          console.log('Usando account de wallet.account');
          account = wallet.account;
        } 
        // Si no tiene cuenta pero tiene signer y provider, crear una nueva
        else if (wallet.signer && wallet.provider) {
          console.log('Creando account con signer y provider');
          account = new Account(
            wallet.provider,
            wallet.address,
            wallet.signer
          );
        }
        // Si no tiene ni cuenta ni provider pero tiene signer, usar la wallet directamente
        else if (wallet.signer) {
          console.log('Usando wallet directamente como account');
          account = wallet as unknown as AccountInterface;
        }
        // Si no tiene nada de lo anterior, usar la wallet directamente
        else {
          console.log('Usando wallet como último recurso');
          account = wallet as unknown as AccountInterface;
        }

        console.log('Cuenta final:', {
          address: account.address,
          hasExecute: typeof account.execute === 'function',
          hasSigner: !!account.signer,
          type: account instanceof Account ? 'Account' : 'Other',
          methods: Object.getOwnPropertyNames(Object.getPrototypeOf(account))
        });
        
        const newConnection = {
          address: wallet.address,
          account: account,
          isConnected: true
        };
        
        console.log('Actualizando estado con:', newConnection);
        setWalletConnection(newConnection);
        localStorage.setItem('wallet_connection', JSON.stringify({
          address: wallet.address,
          isConnected: true
        }));
      } else {
        console.log('No se detectó wallet en el resultado');
      }
    } catch (error) {
      console.error('Error al conectar wallet:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setWalletConnection]);

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
      const newConnection = { isConnected: false } as WalletConnection;
      setWalletConnection(newConnection);
      localStorage.removeItem('wallet_connection');
    } catch (error) {
      console.error('Error al desconectar wallet:', error);
    }
  }, [setWalletConnection]);

  useEffect(() => {
    console.log('Estado actual de la conexión:', walletConnection);
  }, [walletConnection]);

  useEffect(() => {
    const savedConnection = localStorage.getItem('wallet_connection');
    if (savedConnection) {
      const parsed = JSON.parse(savedConnection);
      if (parsed.isConnected) {
        connectWallet();
      }
    }
  }, [connectWallet]);

  console.log('Renderizando WalletConnect, isConnected:', walletConnection.isConnected);

  return (
    <div className="justify-center items-center flex mt-10">
      {!walletConnection.isConnected ? (
        <button
          onClick={connectWallet}
          disabled={isLoading}
          className={`
            px-4 py-2 transition-all  group group-hover:before:duration-500 group-hover:after:duration-500 after:duration-500 hover:border-rose-300 hover:before:[box-shadow:_20px_20px_20px_30px_#a21caf] duration-500 before:duration-500 hover:duration-500 hover:after:-right-8 hover:before:right-12 hover:before:-bottom-8 hover:before:blur hover:underline-offset-4  origin-left hover:decoration-2 hover:text-rose-300 relative bg-neutral-800 h-16 w-64 border p-3 text-gray-50 text-2xl font-bold rounded-lg  overflow-hidden  before:absolute before:w-12 before:h-12 before:content[''] before:right-1 before:top-1 before:z-[-2] before:bg-violet-500 before:rounded-full before:blur-lg  after:absolute after:z-[-2] after:w-20 after:h-20 after:content['']  after:bg-rose-300 after:right-8 after:top-3 after:rounded-full after:blur-lg text-center
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