import React, { createContext, useContext, useState } from 'react';
import { AccountInterface } from 'starknet';

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
      console.log("WalletContext - Starting wallet connection:", {
        walletData: wallet,
        currentConnection: walletConnection
      });

      if (!wallet) {
        throw new Error("No valid wallet provided");
      }

      if (!wallet.address) {
        throw new Error("Wallet has no address");
      }

      // Create custom account object
      const customAccount: CustomAccount = {
        address: wallet.address,
        provider: wallet.provider || wallet.account?.provider,
        signer: wallet.account?.signer,
        execute: wallet.account?.execute?.bind(wallet.account)
      };

      console.log("WalletContext - Custom account created:", {
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

      console.log("WalletContext - Wallet connected successfully");

    } catch (error) {
      console.error("WalletContext - Error connecting wallet:", error);
      disconnectWallet();
      throw error;
    }
  };

  const disconnectWallet = () => {
    console.log("WalletContext - Disconnecting wallet");
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