import { DojoProvider, type DojoCall } from "@dojoengine/core";
import { AccountInterface, type BigNumberish, type CairoOption, type CairoCustomEnum } from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {

	const build_battle_actions_createPlayer_calldata = (betAmount: BigNumberish): DojoCall => {
		return {
			contractName: "battle_actions",
			entrypoint: "create_player",
			calldata: [betAmount],
		};
	};

	const battle_actions_createPlayer = async (snAccount: AccountInterface, betAmount: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_battle_actions_createPlayer_calldata(betAmount),
				"dojo_starter",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_battle_actions_joinBattle_calldata = (battleId: BigNumberish): DojoCall => {
		return {
			contractName: "battle_actions",
			entrypoint: "join_battle",
			calldata: [battleId],
		};
	};

	const battle_actions_joinBattle = async (snAccount: AccountInterface, battleId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_battle_actions_joinBattle_calldata(battleId),
				"dojo_starter",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_battle_actions_performAction_calldata = (battleId: BigNumberish, actionType: CairoCustomEnum, value: BigNumberish): DojoCall => {
		return {
			contractName: "battle_actions",
			entrypoint: "perform_action",
			calldata: [battleId, actionType, value],
		};
	};

	const battle_actions_performAction = async (snAccount: AccountInterface, battleId: BigNumberish, actionType: CairoCustomEnum, value: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_battle_actions_performAction_calldata(battleId, actionType, value),
				"dojo_starter",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	return {
		battle_actions: {
			createPlayer: battle_actions_createPlayer,
			buildCreatePlayerCalldata: build_battle_actions_createPlayer_calldata,
			joinBattle: battle_actions_joinBattle,
			buildJoinBattleCalldata: build_battle_actions_joinBattle_calldata,
			performAction: battle_actions_performAction,
			buildPerformActionCalldata: build_battle_actions_performAction_calldata,
		},
	};
}