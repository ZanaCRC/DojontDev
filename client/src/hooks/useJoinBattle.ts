import { useAccount } from '@starknet-react/core'
import { useCallback, useState } from 'react'
import type { BigNumberish } from 'starknet'
 
const { VITE_BATTLE_CONTRACT_ADDRESS, VITE_TORII_URL } = import.meta.env;

// Types
interface BattleNode {
  battle_id: number;
  player1: string;
  player2: string;
  current_turn: string;
  status: 'Waiting' | 'InProgress' | 'Completed';
  winner: {
    Some: string;
    option: 'None' | string;
  };
  bet: string;
}

interface BattleEdge {
  node: BattleNode;
}

interface BattleQueryResponse {
  data: {
    dojontdevBattleModels: {
      edges: BattleEdge[];
    };
  };
}

const BATTLES_QUERY = `
  query GetBattles {
    dojontdevBattleModels {
      edges {
        node {
          battle_id
          player1
          player2
          current_turn
          status
          winner {
            Some
            option
          }
          bet
        }
      }
    }
  }
`;

export const useJoinBattle = () => {
    const [txnHash, setTxnHash] = useState<string>();
    const [battles, setBattles] = useState<BattleNode[]>([]);
    const [loading, setLoading] = useState(false);
    const { account } = useAccount();
    const [submitted, setSubmitted] = useState(false);

    const fetchAvailableBattles = useCallback(async (betAmount: BigNumberish) => {
        setLoading(true);
        try {
            const response = await fetch(VITE_TORII_URL + "/graphql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: BATTLES_QUERY }),
            });

            const result: BattleQueryResponse = await response.json();
            if (!result.data?.dojontdevBattleModels) {
                throw new Error('No battle data found');
            }

            // Filtrar batallas por estado 'Waiting' y monto de apuesta
            const availableBattles = result.data.dojontdevBattleModels.edges
                .map(edge => edge.node)
                .filter(battle => 
                    battle.status === 'Waiting' && 
                    battle.bet === betAmount.toString()
                );

            setBattles(availableBattles);
            return availableBattles;
        } catch (error) {
            console.error("Error fetching battles:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const joinBattle = useCallback(async (battleId: BigNumberish) => {
        if (!account) return;
        setSubmitted(true);
        setTxnHash(undefined);
      try {
            const result = await account.execute([{
            contractAddress: VITE_BATTLE_CONTRACT_ADDRESS,
            entrypoint: 'join_battle',
            calldata: [battleId],
            }]);
            setTxnHash(result.transaction_hash);
            return result;
      } catch (e) {
            console.error('Error joining battle:', e);
            throw e;
      } finally {
            setSubmitted(false);
      }
    }, [account]);

    return {
        battles,
        loading,
        submitted,
        txnHash,
        fetchAvailableBattles,
        joinBattle
    };
};
  
 