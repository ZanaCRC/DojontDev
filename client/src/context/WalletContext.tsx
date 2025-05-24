import React, { createContext, useContext, useState, useEffect } from 'react';
import { Account, AccountInterface } from 'starknet';

// Interfaz personalizada para nuestra cuenta
interface CustomAccount extends Partial<AccountInterface> {
  address: string;
  provider?: any;
  signer?: any;
  execute?: (...args: any[]) => Promise<any>;
}

interface WalletContextType {
  walletConnection: {
    isConnected: boolean;
    account: CustomAccount | null;
    address: string | undefined;
  };
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({
  walletConnection: {
    isConnected: false,
    account: null,
    address: undefined,
  },
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletConnection, setWalletConnection] = useState<WalletContextType['walletConnection']>({
    isConnected: false,
    account: null,
    address: undefined,
  });

  const connectWallet = async () => {
    try {
      console.log("Intentando conectar wallet...");
      const starknet = (window as any).starknet;
      
      if (!starknet) {
        throw new Error("Por favor, instala Argent X primero");
      }

      // Habilitar la wallet
      const walletAccount = await starknet.enable({
        starknetVersion: "v5"
      });
      console.log("Wallet habilitada:", walletAccount);

      // Esperar a que la wallet esté lista
      await new Promise(resolve => setTimeout(resolve, 500));

      // Obtener la dirección de la cuenta
      const address = starknet.selectedAddress;
      console.log("Dirección obtenida:", address);

      // Verificar si tenemos una cuenta válida
      if (!address) {
        throw new Error("No se pudo obtener la dirección de la wallet");
      }

      // Crear el objeto de cuenta personalizado
      const account: CustomAccount = {
        address,
        provider: starknet.provider,
        signer: starknet.signer,
        execute: starknet.account ? starknet.account.execute.bind(starknet.account) : undefined,
      };

      console.log("Cuenta creada:", account);

      setWalletConnection({
        isConnected: true,
        account,
        address,
      });

      // Suscribirse a eventos de la wallet
      starknet.on('accountsChanged', (accounts: string[]) => {
        console.log('Cuenta cambiada:', accounts);
        if (accounts.length > 0) {
          setWalletConnection(prev => ({
            ...prev,
            address: accounts[0],
            account: prev.account ? { ...prev.account, address: accounts[0] } : null,
          }));
        } else {
          disconnectWallet();
        }
      });

    } catch (error) {
      console.error("Error al conectar wallet:", error);
      alert("Error al conectar wallet: " + (error as Error).message);
      disconnectWallet();
    }
  };

  const disconnectWallet = () => {
    setWalletConnection({
      isConnected: false,
      account: null,
      address: undefined,
    });
  };

  useEffect(() => {
    // Intentar reconectar si hay una sesión previa
    const checkConnection = async () => {
      const starknet = (window as any).starknet;
      if (starknet && starknet.isConnected && starknet.selectedAddress) {
        await connectWallet();
      }
    };

    checkConnection();

    // Limpiar al desmontar
    return () => {
      const starknet = (window as any).starknet;
      if (starknet) {
        starknet.off('accountsChanged', () => {});
      }
    };
  }, []);

  return (
    <WalletContext.Provider value={{ walletConnection, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}; 