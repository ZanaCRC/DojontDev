import { BattleLauncher } from '../components/BattleLauncher';
import { useWallet } from '../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from '@starknet-react/core';
import { Button } from '@cartridge/ui-next';
import HeaderLogo from '../assets/DojontLogo.svg'
const AMOUNTS = [
  { value: '0.001', label: '0.001 ETH' },
  { value: '0.005', label: '0.005 ETH' },
  { value: '0.01', label: '0.01 ETH' },
  { value: '0.05', label: '0.05 ETH' },
];

export function BattleView() {
  const { walletConnection, connectWallet, disconnectWallet } = useWallet();
  const { address, account, status } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);

  useEffect(() => {
    console.log('BattleView - Estado actual:', {
      cartridgeStatus: status,
      hasAddress: Boolean(address),
      addressValue: address,
      hasAccount: Boolean(account),
      accountDetails: account ? {
        address: account.address,
        hasProvider: Boolean(account.provider),
        hasSigner: Boolean(account.signer)
      } : null,
      walletConnection: {
        isConnected: walletConnection.isConnected,
        hasAccount: Boolean(walletConnection.account),
        address: walletConnection.address
      }
    });
  }, [status, address, account, walletConnection]);

  useEffect(() => {
    if (address && account && !walletConnection.isConnected) {
      console.log('BattleView - Intentando sincronizar wallet:', {
        address,
        accountType: typeof account,
        accountMethods: Object.keys(account)
      });

      try {
        connectWallet({
          address,
          account: {
            address,
            signer: account.signer,
            execute: account.execute?.bind(account)
          },
          provider: account
        });
        console.log('BattleView - Wallet sincronizada exitosamente');
      } catch (error) {
        console.error('BattleView - Error al sincronizar wallet:', error);
      }
    }
  }, [address, account, walletConnection.isConnected, connectWallet]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!address) {
        console.log('BattleView - No hay dirección, redirigiendo');
        navigate('/', { replace: true });
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [address, navigate]);

  const handleDisconnect = async () => {
    try {
      console.log('BattleView - Desconectando');
      await disconnect();
      disconnectWallet();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error al desconectar:', error);
    }
  };

  const handleAmountSelect = (value: string) => {
    console.log('Seleccionando monto:', value);
    setSelectedAmount(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4F7CEC]"></div>
          <div className="text-xl font-semibold bg-gradient-to-r from-[#4F7CEC] to-[#9c40ff] text-transparent bg-clip-text">
            Verifying connection...
          </div>
        </div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl font-semibold bg-gradient-to-r from-[#4F7CEC] to-[#9c40ff] text-transparent bg-clip-text">
          No active connection
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center bg-gradient-to-r from-[#4F7CEC]/10 to-[#9c40ff]/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-[#4F7CEC]/20 transition-all duration-300 hover:bg-gray-50/[.05]">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#4F7CEC] to-[#9c40ff] text-transparent bg-clip-text min-h-12">
            <img src={HeaderLogo} alt="Dojon't Logo" className="w-72 h-32" /> 
          </h1>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-[#4F7CEC]/10 to-[#9c40ff]/10 backdrop-blur-md rounded-xl px-6 py-3 border border-[#4F7CEC]/20 transition-all duration-300 hover:bg-gray-50/[.05]">
              <p className="text-sm text-white/80">Connected as:</p>
              <p className="font-mono text-[#4F7CEC] font-semibold">{address.slice(0, 6)}...{address.slice(-4)}</p>
            </div>
            <Button 
              className="px-6 py-3 transition-all duration-300 bg-gradient-to-r from-[#4F7CEC] to-[#9c40ff] text-white font-bold rounded-xl
                         hover:scale-105 shadow-lg hover:shadow-[#4F7CEC]/50"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#4F7CEC]/10 to-[#9c40ff]/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-[#4F7CEC]/20 transition-all duration-300 hover:bg-gray-50/[.05]">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#4F7CEC] to-[#9c40ff] text-transparent bg-clip-text mb-6">
            Select the battle amount
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AMOUNTS.map((amount) => (
              <button
                key={amount.value}
                onClick={() => handleAmountSelect(amount.value)}
                className={`
                  p-6 rounded-xl transition-all duration-300 backdrop-blur-md
                  font-semibold shadow-lg hover:scale-105 border
                  ${selectedAmount === amount.value 
                    ? 'bg-gradient-to-r from-[#4F7CEC] to-[#9c40ff] text-white border-transparent' 
                    : 'bg-gradient-to-r from-[#4F7CEC]/10 to-[#9c40ff]/10 text-white/90 border-[#4F7CEC]/20 hover:border-[#4F7CEC]/40 hover:bg-gray-50/[.05]'}
                `}
              >
                <p className="text-lg">{amount.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#4F7CEC]/10 to-[#9c40ff]/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-[#4F7CEC]/20 transition-all duration-300 hover:bg-gray-50/[.05]">
          <BattleLauncher amount={selectedAmount || ''} />
        </div>
      </div>
    </div>
  );
}
