import { Character, IExecuteParams } from "../internal";
import { TurnState } from "../models/combat/combat";
import { ESpellComponent } from "./spell.types";

export enum EEffectType {
  "STAGGERED" = "STAGGERED",
  "BLOCKING" = "BLOCKING",
  "BURNING" = "BURNING",
  "CASTING" = "CASTING",
  "CONCENTRATING" = "CONCENTRATING",
}
export interface IEffect {
  type: EEffectType;
  duration: number;
  blocks_action: boolean;
  blocks_verbal?: boolean;
  blocks_somatic?: boolean;
}

export interface IEffectTurnActionParams {
  target: Character;
  turn_state: TurnState;
}
export interface IEffectWithActionPerTurn extends IEffect {
  turn_action: (args: IEffectTurnActionParams) => void;
}
export const instanceOfEffectWithActionPerTurn = (
  object: Object
): object is IEffectWithActionPerTurn => object.hasOwnProperty("turn_action");

export interface IEffectWithDamage extends IEffect {
  damage: number;
}
export const instanceOfEffectWithDamage = (
  object: Object
): object is IEffectWithDamage => object.hasOwnProperty("damage");

export interface IEffectWithActionAfterEnd extends IEffect {
  action_after_end: (turn_state: TurnState) => void;
}
export const instanceOfEffectWithActionAfterEnd = (
  object: Object
): object is IEffectWithActionAfterEnd =>
  object.hasOwnProperty("action_after_end");

export interface IEffectWithComponents extends IEffect {
  components: ESpellComponent[];
}
export const instanceOfEffectWithComponents = (
  object: Object
): object is IEffectWithComponents => object.hasOwnProperty("components");

export interface IBurningEffect
  extends IEffectWithDamage,
    IEffectWithActionPerTurn {
  type: EEffectType.BURNING;
}
export interface ICastingEffect
  extends IEffectWithComponents,
    IEffectWithActionAfterEnd {
  type: EEffectType.CASTING;
}
export interface IConcentratingEffect
  extends IEffectWithComponents,
    IEffectWithActionPerTurn {
  type: EEffectType.CONCENTRATING;
  related_to: {
    effect_type: EEffectType;
    effect_target_id: string;
  };
}
export const instanceOfConcentratingEffect = (
  object: Object
): object is IConcentratingEffect => object.hasOwnProperty("related_to");
export interface IBlockingEffect extends IEffect {
  type: EEffectType.BLOCKING;
  blocker: Character;
}
export const instanceOfBlockingEffect = (
  object: Object
): object is IBlockingEffect => object.hasOwnProperty("blocker");
