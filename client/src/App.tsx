// src/App.tsx
import { StarknetConfig, InjectedConnector, jsonRpcProvider } from '@starknet-react/core';
import { BattleLauncher } from './components/BattleLauncher';
import { WalletConnect } from './components/WalletConnect';
import { sepolia } from '@starknet-react/chains';
import { Hero } from './components/Hero';
import { Header } from './components/Header';
import { useDojo } from './hooks/useDojo';
import { WalletProvider } from './context/WalletContext';

export function App() {
  const dojoContext = useDojo();
  
  const connectors = [
    new InjectedConnector({ options: { id: 'braavos' }}),
    new InjectedConnector({ options: { id: 'argentX' }})
  ];

  const provider = jsonRpcProvider({
    rpc: () => ({
      nodeUrl: dojoContext.config.rpcUrl
    })
  });

  return (
    <StarknetConfig 
      connectors={connectors} 
      chains={[sepolia]} 
      provider={provider}
      autoConnect
    >
      <WalletProvider>
        <div className="min-h-screen relative">
          <div className="absolute top-0 z-[-5] min-h-full w-full bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
          <div className="max-w-4xl mx-auto">
            <Header />
            <Hero />
            <WalletConnect />
            <BattleLauncher />
          </div>
        </div>
      </WalletProvider>
    </StarknetConfig>
  );
}

export default App;