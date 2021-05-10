import {
  IBlockingEffect,
  IBurningEffect,
  IEffect,
  IEffectActionParams,
  TurnState,
  EEffectType,
} from "../../internal";

export const blockingEffect = (turn_state: TurnState): IBlockingEffect => ({
  type: EEffectType.BLOCKING,
  who_is_blocking: turn_state.who,
  blocks_action: false,
  number_of_rounds: 1,
});

export const staggeredEffect = (): IEffect => ({
  type: EEffectType.STAGGERED,
  blocks_action: true,
  number_of_rounds: 1,
});

const damage_turn_action = (
  damage: number,
  number_of_rounds: number,
  ignore_armor: boolean = false
) => ({ target }: IEffectActionParams) => {
  if (target) {
    const damage_per_turn = damage / number_of_rounds;
    target.receive_damage(damage_per_turn, ignore_armor);
  }
};

export const burningEffect = (
  damage: number,
  number_of_rounds: number = 3
): IBurningEffect => ({
  type: EEffectType.BURNING,
  blocks_action: false,
  number_of_rounds,
  turn_action: damage_turn_action(damage, number_of_rounds),
});
