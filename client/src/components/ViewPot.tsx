// src/components/BattleLauncher.tsx
import { useState } from "react";
import { useAccount, useContract, useSendTransaction } from "@starknet-react/core";
import { type  Call } from "starknet";
// import BattleAbi from "../abi/TurnBattles.json";

export function BattleLauncher() {
  const { address } = useAccount();
  const [stake, setStake] = useState("");

  // Reemplaza esta dirección con la real de tu contrato
  const contractAddress = "0x0123456789abcdef"; 

  useContract({
    address: contractAddress,
    // abi: BattleAbi,
  });

  const { send, data, status } = useSendTransaction({});

  const handleLaunch = () => {
    if (!address) {
      alert("Conecta tu wallet primero.");
      return;
    }

    const amount = BigInt(stake || "0");
    if (amount <= 0n) {
      alert("Apuesta inválida.");
      return;
    }

    const call: Call = {
      contractAddress,
      entrypoint: "create_battle",
      calldata: [address, amount.toString()],
    };

    send([call]);
  };

  return (
    <div className="p-4 mt-4 border rounded-xl shadow bg-white">
      <h2 className="text-xl font-semibold mb-2">Crear / Unirse a Batalla</h2>
      <input
        type="number"
        placeholder="Apuesta (wei)"
        value={stake}
        onChange={(e) => setStake(e.target.value)}
        className="border p-2 rounded w-full mb-3"
      />
      <button
        onClick={handleLaunch}
        disabled={status === "pending"}
        className="bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded w-full"
      >
        {status === "pending" ? "Enviando..." : "Ir a la batalla"}
      </button>
      {data?.transaction_hash && (
        <p className="text-sm text-gray-500 mt-2">
          Tx enviada: {data.transaction_hash}
        </p>
      )}
    </div>
  );
}
