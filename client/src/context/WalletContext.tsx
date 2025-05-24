import React, { createContext, useContext, useState } from 'react';
import { AccountInterface, Account, RpcProvider } from 'starknet';

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
  connectWallet: (wallet: any) => Promise<void>;
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

  const connectWallet = async (wallet: any) => {
    try {
      if (!wallet) {
        throw new Error("No se proporcionó una wallet válida");
      }

      console.log("Procesando wallet para conexión:", wallet);

      // Verificar que tengamos todos los datos necesarios
      if (!wallet.account || !wallet.address || !wallet.provider) {
        throw new Error("La wallet no tiene los datos necesarios");
      }

      // Crear el objeto de cuenta personalizado
      const customAccount: CustomAccount = {
        address: wallet.address,
        provider: wallet.provider,
        signer: wallet.account.signer,
        execute: wallet.account.execute?.bind(wallet.account)
      };

      console.log("Cuenta personalizada creada:", customAccount);

      // Verificar que la cuenta tenga los métodos necesarios
      if (!customAccount.signer || !customAccount.execute) {
        throw new Error("La cuenta no tiene los métodos necesarios (signer o execute)");
      }

      setWalletConnection({
        isConnected: true,
        account: customAccount,
        address: wallet.address,
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

  return (
    <WalletContext.Provider value={{ walletConnection, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}; 