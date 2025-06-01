import { useAccount, useExplorer } from '@starknet-react/core';
import { useCallback, useState } from 'react';
import type { SessionPolicies } from "@cartridge/controller";
import { uint256, Contract } from 'starknet';

const ETH_CONTRACT = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
const RECIPIENT_ADDRESS = '0x064ff2ff6075b12e5c102d26be6106ed4b5f360465c5327e975a11587509c108';

// ERC20 ABI minimal para balanceOf
const ETH_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "felt" }],
    outputs: [{ name: "balance", type: "Uint256" }],
    stateMutability: "view"
  }
];

const formatEth = (wei: bigint): string => {
  return (Number(wei) / 1e18).toFixed(6) + ' ETH';
}

// Define session policies
const policies: SessionPolicies = {
  contracts: {
    [ETH_CONTRACT]: {
      methods: [
        {
          name: "approve",
          entrypoint: "approve",
          description: "Approve spending of tokens",
        },
        { name: "transfer", entrypoint: "transfer" },
      ],
    },
  },
};

export const useEthApproval = () => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { account } = useAccount();
  const explorer = useExplorer();
  const [txnHash, setTxnHash] = useState<string>();

  const execute = useCallback(
    async (amount: string) => {
      if (!account) return;
      setSubmitted(true);
      setTxnHash(undefined);
      try {
        // Convert hex amount to BigInt
        const amountBigInt = BigInt(amount);
        
        // Convert to uint256
        const amountUint256 = uint256.bnToUint256(amountBigInt);

        // Check balance first
        const contract = new Contract(ETH_ABI, ETH_CONTRACT, account);
        const { balance } = await contract.balanceOf(account.address);
        const balanceBigInt = BigInt(balance.toString());

        if (amountBigInt > balanceBigInt) {
          throw new Error(
            `Insufficient balance for the transfer:\n\n` +
            `Current balance: ${formatEth(balanceBigInt)}\n` +
            `Amount to transfer: ${formatEth(amountBigInt)}\n\n` +
            `Please get some test ETH from the Starknet faucet:\n` +
            `1. Visit https://faucet.goerli.starknet.io\n` +
            `2. Connect your wallet (${account.address})\n` +
            `3. Request test ETH\n` +
            `4. Wait a few minutes for the transaction to confirm\n` +
            `5. Try again`
          );
        }

        console.log('Executing ETH operations:', {
          amount: formatEth(amountBigInt),
          amountWei: amountBigInt.toString(),
          balance: formatEth(balanceBigInt),
          balanceWei: balanceBigInt.toString(),
          recipient: RECIPIENT_ADDRESS,
          from: account.address
        });

        // First just try transfer without approve
        const result = await account.execute({
          contractAddress: ETH_CONTRACT,
          entrypoint: 'transfer',
          calldata: [
            RECIPIENT_ADDRESS,
            amountUint256.low.toString(),
            amountUint256.high.toString()
          ],
        });

        setTxnHash(result.transaction_hash);
        return result;
      } catch (e: any) {
        console.error('Error in ETH operations:', e);
        if (e.message?.includes('u256_sub Overflow')) {
          throw new Error(
            `Insufficient balance for the transfer.\n\n` +
            `Please get some test ETH from:\n` +
            `https://faucet.goerli.starknet.io`
          );
        } else if (e.message?.includes('argent/multicall-failed')) {
          throw new Error('Transaction failed. Please check your balance and try again.');
        }
        throw e;
      } finally {
        setSubmitted(false);
      }
    },
    [account],
  );

  return {
    execute,
    submitted,
    txnHash,
    explorerUrl: txnHash ? explorer.transaction(txnHash) : undefined,
    policies
  };
}; 