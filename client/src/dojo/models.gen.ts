import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { CairoCustomEnum, CairoOption, CairoOptionVariant, type BigNumberish } from 'starknet';

// Type definition for `dojo_starter::models::battle::Battle` struct
export interface Battle {
	battle_id: BigNumberish;
	player1: string;
	player2: string;
	current_turn: string;
	status: BattleStatusEnum;
	winner: CairoOption<string>;
}

// Type definition for `dojo_starter::models::battle::BattleAction` struct
export interface BattleAction {
	battle_id: BigNumberish;
	player: string;
	action_type: ActionTypeEnum;
	value: BigNumberish;
	turn: BigNumberish;
}

// Type definition for `dojo_starter::models::battle::BattleActionValue` struct
export interface BattleActionValue {
	action_type: ActionTypeEnum;
	value: BigNumberish;
	turn: BigNumberish;
}

// Type definition for `dojo_starter::models::battle::BattleValue` struct
export interface BattleValue {
	player1: string;
	player2: string;
	current_turn: string;
	status: BattleStatusEnum;
	winner: CairoOption<string>;
}

// Type definition for `dojo_starter::models::battle::Player` struct
export interface Player {
	player: string;
	health: BigNumberish;
	bet_amount: BigNumberish;
	in_battle: boolean;
}

// Type definition for `dojo_starter::models::battle::PlayerValue` struct
export interface PlayerValue {
	health: BigNumberish;
	bet_amount: BigNumberish;
	in_battle: boolean;
}

// Type definition for `dojo_starter::systems::battle_actions::battle_actions::ActionPerformed` struct
export interface ActionPerformed {
	battle_id: BigNumberish;
	player: string;
	action_type: ActionTypeEnum;
	value: BigNumberish;
	target_health: BigNumberish;
}

// Type definition for `dojo_starter::systems::battle_actions::battle_actions::ActionPerformedValue` struct
export interface ActionPerformedValue {
	player: string;
	action_type: ActionTypeEnum;
	value: BigNumberish;
	target_health: BigNumberish;
}

// Type definition for `dojo_starter::systems::battle_actions::battle_actions::BattleCreated` struct
export interface BattleCreated {
	battle_id: BigNumberish;
	player1: string;
}

// Type definition for `dojo_starter::systems::battle_actions::battle_actions::BattleCreatedValue` struct
export interface BattleCreatedValue {
	player1: string;
}

// Type definition for `dojo_starter::systems::battle_actions::battle_actions::BattleEnded` struct
export interface BattleEnded {
	battle_id: BigNumberish;
	winner: string;
	reward_amount: BigNumberish;
}

// Type definition for `dojo_starter::systems::battle_actions::battle_actions::BattleEndedValue` struct
export interface BattleEndedValue {
	winner: string;
	reward_amount: BigNumberish;
}

// Type definition for `dojo_starter::systems::battle_actions::battle_actions::BattleJoined` struct
export interface BattleJoined {
	battle_id: BigNumberish;
	player2: string;
}

// Type definition for `dojo_starter::systems::battle_actions::battle_actions::BattleJoinedValue` struct
export interface BattleJoinedValue {
	player2: string;
}

// Type definition for `dojo_starter::models::battle::ActionType` enum
export const actionType = [
	'Attack',
	'Defense',
] as const;
export type ActionType = { [key in typeof actionType[number]]: string };
export type ActionTypeEnum = CairoCustomEnum;

// Type definition for `dojo_starter::models::battle::BattleStatus` enum
export const battleStatus = [
	'Waiting',
	'InProgress',
	'Completed',
] as const;
export type BattleStatus = { [key in typeof battleStatus[number]]: string };
export type BattleStatusEnum = CairoCustomEnum;

export interface SchemaType extends ISchemaType {
	dojo_starter: {
		Battle: Battle,
		BattleAction: BattleAction,
		BattleActionValue: BattleActionValue,
		BattleValue: BattleValue,
		Player: Player,
		PlayerValue: PlayerValue,
		ActionPerformed: ActionPerformed,
		ActionPerformedValue: ActionPerformedValue,
		BattleCreated: BattleCreated,
		BattleCreatedValue: BattleCreatedValue,
		BattleEnded: BattleEnded,
		BattleEndedValue: BattleEndedValue,
		BattleJoined: BattleJoined,
		BattleJoinedValue: BattleJoinedValue,
	},
}
export const schema: SchemaType = {
	dojo_starter: {
		Battle: {
			battle_id: 0,
			player1: "",
			player2: "",
			current_turn: "",
		status: new CairoCustomEnum({ 
					Waiting: "",
				InProgress: undefined,
				Completed: undefined, }),
		winner: new CairoOption(CairoOptionVariant.None),
		},
		BattleAction: {
			battle_id: 0,
			player: "",
		action_type: new CairoCustomEnum({ 
					Attack: "",
				Defense: undefined, }),
			value: 0,
			turn: 0,
		},
		BattleActionValue: {
		action_type: new CairoCustomEnum({ 
					Attack: "",
				Defense: undefined, }),
			value: 0,
			turn: 0,
		},
		BattleValue: {
			player1: "",
			player2: "",
			current_turn: "",
		status: new CairoCustomEnum({ 
					Waiting: "",
				InProgress: undefined,
				Completed: undefined, }),
		winner: new CairoOption(CairoOptionVariant.None),
		},
		Player: {
			player: "",
			health: 0,
			bet_amount: 0,
			in_battle: false,
		},
		PlayerValue: {
			health: 0,
			bet_amount: 0,
			in_battle: false,
		},
		ActionPerformed: {
			battle_id: 0,
			player: "",
		action_type: new CairoCustomEnum({ 
					Attack: "",
				Defense: undefined, }),
			value: 0,
			target_health: 0,
		},
		ActionPerformedValue: {
			player: "",
		action_type: new CairoCustomEnum({ 
					Attack: "",
				Defense: undefined, }),
			value: 0,
			target_health: 0,
		},
		BattleCreated: {
			battle_id: 0,
			player1: "",
		},
		BattleCreatedValue: {
			player1: "",
		},
		BattleEnded: {
			battle_id: 0,
			winner: "",
			reward_amount: 0,
		},
		BattleEndedValue: {
			winner: "",
			reward_amount: 0,
		},
		BattleJoined: {
			battle_id: 0,
			player2: "",
		},
		BattleJoinedValue: {
			player2: "",
		},
	},
};
export enum ModelsMapping {
	ActionType = 'dojo_starter-ActionType',
	Battle = 'dojo_starter-Battle',
	BattleAction = 'dojo_starter-BattleAction',
	BattleActionValue = 'dojo_starter-BattleActionValue',
	BattleStatus = 'dojo_starter-BattleStatus',
	BattleValue = 'dojo_starter-BattleValue',
	Player = 'dojo_starter-Player',
	PlayerValue = 'dojo_starter-PlayerValue',
	ActionPerformed = 'dojo_starter-ActionPerformed',
	ActionPerformedValue = 'dojo_starter-ActionPerformedValue',
	BattleCreated = 'dojo_starter-BattleCreated',
	BattleCreatedValue = 'dojo_starter-BattleCreatedValue',
	BattleEnded = 'dojo_starter-BattleEnded',
	BattleEndedValue = 'dojo_starter-BattleEndedValue',
	BattleJoined = 'dojo_starter-BattleJoined',
	BattleJoinedValue = 'dojo_starter-BattleJoinedValue',
}