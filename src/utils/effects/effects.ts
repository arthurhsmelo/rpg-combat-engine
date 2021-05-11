import {
  IBlockingEffect,
  IBurningEffect,
  IEffect,
  TurnState,
  EEffectType,
  ICastingEffect,
} from "../../internal";
import Character from "../../models/character/character";
import { IEffectTurnActionParams } from "../../types/effect.types";
import { ISpell } from "../../types/spell.types";

export const blockingEffect = (turn_state: TurnState): IBlockingEffect => ({
  type: EEffectType.BLOCKING,
  blocker: turn_state.agent,
  blocks_action: false,
  duration: 1,
});

export const staggeredEffect = (): IEffect => ({
  type: EEffectType.STAGGERED,
  blocks_action: true,
  duration: 1,
});

const damage_turn_action = (
  damage: number,
  duration: number,
  ignore_armor: boolean = false
) => ({ target }: IEffectTurnActionParams) => {
  if (target) {
    const damage_per_turn = damage / duration;
    console.log("burning dmg:", damage_per_turn);
    target.receive_damage(damage_per_turn, ignore_armor);
  }
};

export const burning_effect = (
  damage: number,
  duration: number = 3
): IBurningEffect => ({
  type: EEffectType.BURNING,
  blocks_action: false,
  duration,
  turn_action: damage_turn_action(damage, duration),
});

export const casting_effect = (
  spell: ISpell,
  target: Character
): ICastingEffect => ({
  type: EEffectType.CASTING,
  blocks_action: true,
  duration: spell.casting_time,
  action_after_end: spell.after_cast,
  target,
});
