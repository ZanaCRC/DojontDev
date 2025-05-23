import { useEffect, useState } from 'react'
import { useProvider, useAccount } from '@starknet-react/core';
import ContractService from '../services/ContractService';

export function useContract() {
  const { provider } = useProvider();
  const { account } = useAccount();
  const [contractService, setContractService] = useState<ContractService | null>(null);

  useEffect(() => {
    if (!provider) return;

    const service = new ContractService(provider, account || null);
    setContractService(service);
  }, [provider, account]);

  useEffect(() => {
    if (contractService && account) {
      contractService.setAccount(account);
    }
  }, [account, contractService]);

  if (!contractService) {
    throw new Error('Contract service not initialized');
  }

  return contractService;
} 