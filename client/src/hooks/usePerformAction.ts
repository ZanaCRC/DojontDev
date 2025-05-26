import { useAccount } from '@starknet-react/core'
import { useCallback, useState, useEffect } from 'react'
import type { BigNumberish } from 'starknet'

const { VITE_BATTLE_CONTRACT_ADDRESS, VITE_TORII_URL } = import.meta.env;

// Types
interface PlayerNode {
  player: string;
  health: number;
  in_battle: number;
  bet_amount: string;
}

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
}

interface BattleState {
  battle: BattleNode | null;
  player1Health: number;
  player2Health: number;
}

interface UsePerformActionProps {
    battleId: BigNumberish;
}

const BATTLE_QUERY = `
  query GetBattle($battleId: Int!) {
    dojontdevBattleModels(where: { battle_id: { eq: $battleId } }) {
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
        }
      }
    }
  }
`;

const PLAYER_QUERY = `
  query GetPlayer($playerAddress: String!) {
    dojontdevPlayerModels(where: { player: { eq: $playerAddress } }) {
      edges {
        node {
          player
          health
          in_battle
          bet_amount
        }
      }
    }
  }
`;

export const usePerformAction = ({ battleId }: UsePerformActionProps) => {
    const [battleState, setBattleState] = useState<BattleState>({
        battle: null,
        player1Health: 100,
        player2Health: 100
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [txnHash, setTxnHash] = useState<string>();
    const { account } = useAccount();

    const isMyTurn = useCallback(async (): Promise<boolean> => {
        if (!account) return false;
        try {
            const response = await fetch(VITE_TORII_URL + "/graphql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: BATTLE_QUERY,
                    variables: { battleId: Number(battleId) }
                }),
            });

            const result = await response.json();
            const battle = result.data?.dojontdevBattleModels?.edges[0]?.node;
            
            if (!battle) return false;
            return battle.current_turn === account.address;
        } catch (error) {
            console.error("Error checking turn:", error);
            return false;
        }
    }, [account, battleId]);

    const fetchPlayerHealth = async (address: string): Promise<number> => {
        try {
            const response = await fetch(VITE_TORII_URL + "/graphql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: PLAYER_QUERY,
                    variables: { playerAddress: address }
                }),
            });

            const result = await response.json();
            const player = result.data?.dojontdevPlayerModels?.edges[0]?.node;
            return player?.health ?? -10;
        } catch (error) {
            console.error("Error fetching player health:", error);
            return -10;
        }
    };

    const fetchBattleState = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(VITE_TORII_URL + "/graphql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: BATTLE_QUERY,
                    variables: { battleId: Number(battleId) }
                }),
            });

            const result = await response.json();
            const battle = result.data?.dojontdevBattleModels?.edges[0]?.node;

            if (battle) {
                const [player1Health, player2Health] = await Promise.all([
                    fetchPlayerHealth(battle.player1),
                    fetchPlayerHealth(battle.player2)
                ]);

                setBattleState({
                    battle,
                    player1Health,
                    player2Health
                });
            }
        } catch (error) {
            console.error("Error fetching battle state:", error);
        } finally {
            setLoading(false);
        }
    }, [battleId]);

    const performAction = useCallback(async (actionType: BigNumberish, attackValue: BigNumberish) => {
        if (!account) return;
        if (actionType === 0 && (Number(attackValue) < 1 || Number(attackValue) > 5)) {
            throw new Error('Attack value must be between 1 and 5');
        }
        setSubmitted(true);
        setTxnHash(undefined);
        try {
            const result = await account.execute([{
                contractAddress: VITE_BATTLE_CONTRACT_ADDRESS,
                entrypoint: 'perform_action',
                calldata: [battleId, actionType, attackValue],
            }]);
            setTxnHash(result.transaction_hash);
            await fetchBattleState(); // Refresh battle state after action
            return result;
        } catch (e) {
            console.error('Error performing action:', e);
            throw e;
        } finally {
            setSubmitted(false);
        }
    }, [account, battleId, fetchBattleState]);

    // Set up automatic refresh of battle state
    useEffect(() => {
        fetchBattleState();
        const interval = setInterval(fetchBattleState, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [fetchBattleState]);

    return {
        battleState,
        loading,
        submitted,
        txnHash,
        performAction,
        refreshBattleState: fetchBattleState,
        isMyTurn
    };
};
