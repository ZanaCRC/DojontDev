import { useAccount } from '@starknet-react/core'
import { useCallback, useState } from 'react'
import type { BigNumberish } from 'starknet'

const { VITE_BATTLE_CONTRACT_ADDRESS } = import.meta.env;
export const useCreatePlayer = () => {
    const [txnHash, setTxnHash] = useState<string>()
    const { account } = useAccount()
    const [submitted, setSubmitted] = useState<boolean>(false)
  
    const execute = useCallback(
        async (amount: BigNumberish) => {
            if (!account) return
            setSubmitted(true)
            setTxnHash(undefined)
            try {
                const result = await account.execute({
                    contractAddress: VITE_BATTLE_CONTRACT_ADDRESS,
                    entrypoint: 'create_player',
                    calldata: [amount]
                })
                
                console.log('Create player result:', result)
                setTxnHash(result.transaction_hash)
                return result
            } catch (e) {
                console.error('Error in create player:', e)
                throw e
            } finally {
                setSubmitted(false)
            }
        },
        [account],  
    )

    return {
        execute,
        txnHash,
        submitted
    }
}
  
 