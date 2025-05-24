import { BattleLauncher } from '../components/BattleLauncher';
import { useWallet } from '../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from '@starknet-react/core';
import { Button } from '@cartridge/ui-next';

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
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-neutral-600">Verificando conexión...</div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-neutral-600">No hay conexión activa</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-900">Dojon&apos;t Lobby</h1>
          <div className="flex items-center gap-4">
            <div className="bg-neutral-200 rounded-lg px-4 py-2">
              <p className="text-sm text-neutral-600">Conectado como:</p>
              <p className="font-mono text-neutral-900">{address.slice(0, 6)}...{address.slice(-4)}</p>
            </div>
            <Button 
              className="px-4 py-2 transition-all group hover:border-rose-300 hover:before:[box-shadow:_20px_20px_20px30px#a21caf] duration-500 hover:text-black hover:cursor-pointer relative bg-transparent border text-neutral-700 font-bold rounded-lg overflow-hidden before:absolute before:w-12 before:h-12 before:content[''] before:right-1 before:top-1 before:z-[-2] before:bg-red-500 before:rounded-full before:blur-lg" 
              onClick={handleDisconnect}
            >
              Desconectar
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Selecciona el monto de la batalla</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AMOUNTS.map((amount) => (
              <button
                key={amount.value}
                onClick={() => handleAmountSelect(amount.value)}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-300
                  ${selectedAmount === amount.value 
                    ? 'border-purple-500 bg-purple-50 text-purple-700' 
                    : 'border-neutral-200 hover:border-purple-300 text-neutral-600 hover:bg-purple-50'}
                `}
              >
                <p className="font-semibold">{amount.label}</p>
              </button>
            ))}
          </div>
        </div>

        <BattleLauncher amount={selectedAmount || ''} />
      </div>
    </div>
  );
}
