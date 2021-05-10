import { Character, IExecuteParams } from "../internal";

export enum EEffectType {
  "STAGGERED" = "STAGGERED",
  "BLOCKING" = "BLOCKING",
  "BURNING" = "BURNING",
  "CASTING" = "CASTING",
}
export interface IEffect {
  type: EEffectType;
  blocks_action: boolean;
  duration: number;
}

export interface IEffectTurnActionParams {
  target: Character;
}
export interface IEffectWithActionPerTurn extends IEffect {
  turn_action: (args: IEffectTurnActionParams) => void;
}
export const instanceOfEffectWithActionPerTurn = (
  object: Object
): object is IEffectWithActionPerTurn => object.hasOwnProperty("turn_action");

export interface IEffectWithActionAfterEnd extends IEffect {
  target: Character;
  action_after_end: (args: IExecuteParams) => void;
}
export const instanceOfEffectWithActionAfterEnd = (
  object: Object
): object is IEffectWithActionAfterEnd =>
  object.hasOwnProperty("action_after_end");

export interface IBurningEffect extends IEffectWithActionPerTurn {
  type: EEffectType.BURNING;
}
export interface ICastingEffect extends IEffectWithActionAfterEnd {
  type: EEffectType.CASTING;
}
export interface IBlockingEffect extends IEffect {
  type: EEffectType.BLOCKING;
  who_is_blocking: Character;
}
export const instanceOfBlockingEffect = (
  object: Object
): object is IBlockingEffect => object.hasOwnProperty("who_is_blocking");
