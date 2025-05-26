// src/components/BattleLauncher.tsx
import { useState, useEffect } from "react";
import { useDojo } from "../hooks/useDojo";
import { useWallet } from "../context/WalletContext";
import { BattleActions } from "./BattleActions";
import type { BigNumberish } from "starknet";
import { useConnect } from '@starknet-react/core';
import ControllerConnector from '@cartridge/connector/controller';
import { useCreatePlayer } from "../hooks/useCreatePlayer";
import { useJoinBattle } from "../hooks/useJoinBattle";
import { lookupAddresses } from '@cartridge/controller';
import { useNavigate } from 'react-router-dom';
import { BattleArena } from "./BattleArena";

interface BattleLauncherProps {
  amount: string;
}

export function BattleLauncher({ amount }: BattleLauncherProps) {
  const navigate = useNavigate();
  const { walletConnection } = useWallet();
  const [selectedBattleId, setSelectedBattleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState("");
  const { setup } = useDojo();
  const { connectors } = useConnect();
  const controller = connectors[0] as ControllerConnector;
  const { execute: createPlayer, submitted } = useCreatePlayer();
  const { battles, loading: loadingBattles, fetchAvailableBattles, joinBattle } = useJoinBattle();
  const [usernames, setUsernames] = useState<Map<string, string>>(new Map());

  // Convertir el amount a wei en formato hexadecimal
  const amountInWei = amount 
    ? "0x" + (BigInt(Math.floor(parseFloat(amount) * 1e18))).toString(16)
    : "0x0";

  // Para mostrar en la UI, convertimos el hex a decimal
  const amountInWeiDecimal = amount
    ? BigInt(Math.floor(parseFloat(amount) * 1e18)).toString()
    : "0";

  // Simplificar la validación para solo verificar el monto
  const isValidAmount = Boolean(
    amount && 
    !isNaN(parseFloat(amount)) && 
    parseFloat(amount) > 0
  );

  // Ahora canInteract depende del monto y el estado de loading
  const canInteract = Boolean(isValidAmount && !loading && !submitted);

  // Cargar batallas y usernames cuando cambie el monto
  useEffect(() => {
    const loadBattlesAndUsernames = async () => {
      if (isValidAmount && amountInWei) {
        const battlesData = await fetchAvailableBattles(amountInWei);
        if (battlesData && battlesData.length > 0) {
          // Obtener todas las direcciones de los creadores de batallas
          const addresses = battlesData.map(battle => battle.player1);
          try {
            const addressMap = await lookupAddresses(addresses);
            setUsernames(addressMap);
          } catch (error) {
            console.error("Error fetching usernames:", error);
          }
        }
      }
    };

    loadBattlesAndUsernames();
  }, [amountInWei, isValidAmount, fetchAvailableBattles]);

  const getDisplayName = (address: string) => {
    const username = usernames.get(address);
    if (username) return username;
    // Si no hay username, acortar la dirección
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const validateAmount = () => {
    if (!isValidAmount) {
      alert("Please, select a valid amount.");
      return false;
    }
    return true;
  };

  const handleCreateBattle = async () => {
    if (!validateAmount()) return;
    
    try {
      setLoading(true);
      setIsRedirecting(true);
      setRedirectMessage("Creating battle...");
      console.log("Creating a battle with amount:", amountInWei);

      const result = await createPlayer(amountInWei as BigNumberish);
      if (result) {
        setTxHash(result.transaction_hash);
        setRedirectMessage("Battle created! Looking for ID...");

        // Function to try to find the battle
        const findBattle = async (retries = 5): Promise<number | null> => {
          for (let i = 0; i < retries; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log(`\nAttempt ${i + 1}: Looking for battles with amount:`, amountInWei);
            const battlesData = await fetchAvailableBattles(amountInWei);
            console.log('Battles found:', battlesData);

            // Look for the most recent battle in "Waiting" state
            const recentBattle = battlesData?.find(battle => battle.status === 'Waiting');
            
            if (recentBattle) {
              console.log('Battle found:', recentBattle);
              return recentBattle.battle_id;
            }
            
            setRedirectMessage(`Looking for battle... (attempt ${i + 1}/${retries})`);
          }
          return null;
        };

        // Try to find the battle with retries
        const battleId = await findBattle();

        if (battleId) {
          setRedirectMessage("Battle found! Redirecting...");
          await new Promise(resolve => setTimeout(resolve, 1000));
          navigate(`/BattleArena/${battleId}`);
        } else {
          throw new Error(
            "Could not find the created battle. Please:\n\n" +
            "1. Verify that the transaction has been confirmed in the explorer\n" +
            "2. Check the console for search details\n" +
            "3. Try refreshing the page in a few moments"
          );
        }
      }

    } catch (error: any) {
      setIsRedirecting(false);
      console.error("Detailed error when creating the battle:", {
        error,
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      });

      let errorMessage = "Error creating the battle: ";
      
      if (error instanceof Error) {
        if (error.message.includes("Max fee") && error.message.includes("exceeds balance")) {
          errorMessage = 
            "You don't have sufficient funds to pay the transaction fee.\n\n" +
            "Please\n" +
            "1. Visit the Starknet faucet: https://faucet.goerli.starknet.io\n" +
            "2. Connect your wallet\n" +
            "3. Request trial ETH\n" +
            "4. Wait a few minutes for the transaction to be confirmed\n" +
            "5. Try creating the battle again";
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += "Unknown error occurred";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
      setIsRedirecting(false);
    }
  };

  const handleBattleClick = async (battleId: number) => {
    // Show confirmation dialog
    const confirmMessage = `Are you sure you want to join battle #${battleId}?\n\n` +
      `Amount to bet: ${amount} ETH\n` +
      `This action will require a transaction on the blockchain and cannot be undone.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      setIsRedirecting(true);
      setRedirectMessage("Joining battle...");
      console.log("Joining battle:", battleId);
      
      const result = await joinBattle(battleId);
      if (result) {
        setTxHash(result.transaction_hash);
        setRedirectMessage("You've joined the battle! Redirecting to arena...");
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigate(`/BattleArena/${battleId}`);
      }
    } catch (error: any) {
      setIsRedirecting(false);
      console.error("Error when joining the battle:", error);
      let errorMessage = "Error when joining the battle: ";
      
      if (error instanceof Error) {
        if (error.message.includes("Max fee") && error.message.includes("exceeds balance")) {
          errorMessage = 
            "You don't have sufficient funds to pay the transaction fee.\n\n" +
            "Please\n" +
            "1. Visit the Starknet faucet: https://faucet.goerli.starknet.io\n" +
            "2. Connect your wallet\n" +
            "3. Request trial ETH\n" +
            "4. Wait a few minutes for the transaction to be confirmed\n" +
            "5. Try joining the battle again";
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += "Unknown error occurred";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {isRedirecting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gradient-to-r from-[#4F7CEC]/10 to-[#9c40ff]/10 p-8 rounded-2xl border border-[#4F7CEC]/20 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#4F7CEC] mx-auto mb-4"></div>
            <p className="text-white text-xl font-semibold animate-pulse">
              {redirectMessage}
            </p>
          </div>
        </div>
      )}

      <div className="p-6 border rounded-xl shadow-md border-gray-900">
        <h2 className="text-2xl text-neutral-200 font-semibold mb-4">Battle</h2>
        
        <div className="space-y-4">
          {!isValidAmount && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700">
                <strong>Amount no valid:</strong> Please, select a valid amount to continue.
              </p>
            </div>
          )}

          <div className="mb-4">
            <p className="text-neutral-400">Amount Selected:</p>
            {isValidAmount ? (
              <>
                <p className="text-xl font-semibold text-purple-600">{amount} ETH</p>
                <p className="text-sm text-gray-500">
                  Decimal: {amountInWeiDecimal} wei
                  <br />
                  Hex: {amountInWei}
                </p>
              </>
            ) : (
              <p className="text-sm text-red-500">Select an amount to conitinue</p>
            )}
          </div>

          {txHash && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700">
                <strong>Transaction Sent:</strong>
                <br />
                Hash: {txHash}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 z-50">
            <button
              onClick={handleCreateBattle}
              disabled={!canInteract || loading}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all duration-300 cursor-pointer
                ${(!canInteract || loading)
                  ? 'bg-gray-300 cursor-not-allowed text-gray-300'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-700 border-2 border-purple-300'
                }
              `}
            >
              {loading ? 'Processing...' : 'Create Batle'}
            </button>
          </div>

          {/* Lista de batallas disponibles */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-neutral-200 mb-4">
              Available Battles
              {loadingBattles && <span className="ml-2 text-sm text-gray-400">(Loading...)</span>}
            </h3>
            
            {battles.length > 0 ? (
              <div className="grid gap-4">
                {battles.map((battle) => (
                  <div 
                    key={battle.battle_id}
                    onClick={() => handleBattleClick(battle.battle_id)}
                    className={`
                      p-4 border border-purple-200 rounded-lg hover:bg-purple-50 cursor-pointer transition-all
                      ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-purple-700">Battle #{battle.battle_id}</p>
                        <p className="text-sm text-gray-600">
                          Creador: {getDisplayName(battle.player1)}
                          {!usernames.get(battle.player1) && (
                            <span className="text-xs text-gray-400 ml-1">(Loading username...)</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-purple-600">{amount} ETH</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isValidAmount ? (
              <p className="text-gray-00 text-center py-4 text-neutral-200">
                There are no battles available with this amount
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}


