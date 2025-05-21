// components/StartBattle.tsx
import { useSendTransaction } from "@starknet-react/core";
import { type Call } from "starknet";
import { useMemo } from "react";

export default function StartBattle({ contractAddress }: { contractAddress: string }) {
  const { send } = useSendTransaction({});

  const callData: Call[] = useMemo(() => [
    {
      contractAddress,
      entrypoint: "start_battle",
      calldata: [], // reemplaza con los parámetros reales si los hay
    },
  ], [contractAddress]);

  const handleStart = () => {
    send(callData);
  };

  return <button onClick={handleStart}>Iniciar Batalla</button>;
}
