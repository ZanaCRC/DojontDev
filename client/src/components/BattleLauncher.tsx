// src/components/BattleLauncher.tsx
import { useState } from "react";
import { useAccount, useContract } from "@starknet-react/core";
// import BattleABI from "../abi/Battle.json";

export function BattleLauncher() {
  const { address } = useAccount();
  const [stake, setStake] = useState("0");
  const { contract } = useContract({
    address: "0xTU_CONTRACT_ADDRESS",
    // abi: BattleABI,
  });
  const handleLaunch = async () => {
    if (!address) return alert("Conecta tu wallet primero.");
    if (Number(stake) <= 0) return alert("Apuesta inválida.");
    // Llama a tu sistema create_battle en el contrato Cairo/Dojo
    if (!contract) return alert("Contrato no cargado.");
    try {
      await contract.invoke("create_battle", [address, BigInt(stake)]);
    } catch (error) {
      alert("Error al crear batalla: " + (error as Error).message);
    }
  };

  return (
    <div className="p-4 mt-4 border rounded-xl shadow bg-white">
      <h2 className="text-xl font-semibold mb-2">Iniciar Batalla</h2>
      <input
        type="number"
        min="0"
        placeholder="Apuesta (wei)"
        value={stake}
        onChange={(e) => setStake(e.target.value)}
        className="border p-2 rounded w-full mb-3"
      />
      <button
        onClick={handleLaunch}
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        Crear o Unirse
      </button>
    </div>
  );
}


