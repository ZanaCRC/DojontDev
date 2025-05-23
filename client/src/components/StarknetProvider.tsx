import { RpcProvider } from 'starknet';
import { useEffect, useState } from 'react';
import { Provider } from 'starknet';

interface StarknetProviderProps {
  children: React.ReactNode;
}

export const StarknetProvider: React.FC<StarknetProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    const initializeProvider = async () => {
      const provider = new RpcProvider({
        nodeUrl: import.meta.env.VITE_STARKNET_RPC_URL || 'http://localhost:5050',
      });
      
      setProvider(provider);
    };

    initializeProvider();
  }, []);

  if (!provider) {
    return <div>Conectando a Starknet...</div>;
  }

  return (
    <div className="starknet-provider">
      {children}
    </div>
  );
};

export default StarknetProvider;