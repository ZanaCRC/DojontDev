import { createContext, useContext, useState, type ReactNode } from 'react';
import type { WalletConnection } from '../components/WalletConnect';

interface WalletContextType {
  walletConnection: WalletConnection;
  setWalletConnection: (connection: WalletConnection) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletConnection, setWalletConnection] = useState<WalletConnection>({
    isConnected: false
  });

  const updateWalletConnection = (connection: WalletConnection) => {
    console.log('WalletProvider: Actualizando conexión con:', connection);
    setWalletConnection(connection);
  };

  console.log('WalletProvider: Estado actual:', walletConnection);

  return (
    <WalletContext.Provider value={{ walletConnection, setWalletConnection: updateWalletConnection }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 