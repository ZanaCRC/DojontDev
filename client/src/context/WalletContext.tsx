import React, { createContext, useContext, useState } from 'react';
import { AccountInterface, Account } from 'starknet';

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
      console.log("WalletContext - Iniciando conexión de wallet:", {
        walletData: wallet,
        currentConnection: walletConnection
      });

      if (!wallet) {
        throw new Error("No se proporcionó una wallet válida");
      }

      if (!wallet.address) {
        throw new Error("La wallet no tiene dirección");
      }

      // Crear el objeto de cuenta personalizado
      const customAccount: CustomAccount = {
        address: wallet.address,
        provider: wallet.provider || wallet.account?.provider,
        signer: wallet.account?.signer,
        execute: wallet.account?.execute?.bind(wallet.account)
      };

      console.log("WalletContext - Cuenta personalizada creada:", {
        address: customAccount.address,
        hasProvider: Boolean(customAccount.provider),
        hasSigner: Boolean(customAccount.signer),
        hasExecute: Boolean(customAccount.execute)
      });

      setWalletConnection({
        isConnected: true,
        account: customAccount,
        address: wallet.address,
      });

      console.log("WalletContext - Wallet conectada exitosamente");

    } catch (error) {
      console.error("WalletContext - Error al conectar wallet:", error);
      disconnectWallet();
      throw error; // Re-lanzar el error para manejarlo en el componente
    }
  };

  const disconnectWallet = () => {
    console.log("WalletContext - Desconectando wallet");
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