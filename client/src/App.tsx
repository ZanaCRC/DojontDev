// src/App.tsx
import { InjectedConnector, jsonRpcProvider } from '@starknet-react/core';

import { ConnectWallet } from './components/Cartridge/WalletConnection';

import { Hero } from './components/Hero';
import { Header } from './components/Header';
import { useDojo } from './hooks/useDojo';

import { MarqueeDemo } from './components/MarqueeLogos';
import { MorphingText } from './components/ShadcnComponents/MorphingText';
import { useWallet } from './context/WalletContext';
import { AnimatedGridPattern } from './components/ShadcnComponents/AnimatedGrid';
import { BorderBeamCard } from './components/AboutDojont';
import { cn } from './lib/utils';
import { HowOperate } from './components/HowOperate';
import { FooterDojont } from './components/FooterDojont';
const AppContent = () => {
  const { walletConnection } = useWallet();

  return (
    <>
    
    <div className="min-h-screen relative">
    
      <div className="absolute top-0 z-[-5] min-h-full w-full bg-[#111111] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(11,0,83,0.3),rgba(255,255,255,0))]"></div>
      <AnimatedGridPattern
        numSquares={60}
        maxOpacity={0.1}
        duration={2}
        repeatDelay={1}
        className={cn(
          "z-0",
        )}
      />
      <div className="max-w-4xl mx-auto">
        <Header />
        <div className="h-[600px]">
          <Hero />
          <MorphingText texts={["Connect", "Play", "Win","Dojon't game"]} />
        </div>
        <div className="">
          <ConnectWallet />
          <div className="flex flex-row justify-center items-center mt-20">

            <BorderBeamCard />
            </div>
            <HowOperate />
            <MarqueeDemo />
          </div>
          
        </div>
        <FooterDojont />
      </div>
    
    </>
  );
};

export function App() {
  
  return (
    

        <AppContent />
   
  );
}

export default App;