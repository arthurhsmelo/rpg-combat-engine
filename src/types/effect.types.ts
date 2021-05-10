import { Character } from "../internal";

export enum EEffectType {
  "STAGGERED" = "STAGGERED",
  "BLOCKING" = "BLOCKING",
  "BURNING" = "BURNING",
}
export interface IEffect {
  type: EEffectType;
  blocks_action: boolean;
  number_of_rounds: number;
}

export interface IEffectActionParams {
  target: Character;
}
export interface IEffectWithActionPerTurn extends IEffect {
  turn_action: (args: IEffectActionParams) => void;
}
export const instanceOfEffectWithActionPerTurn = (
  object: Object
): object is IEffectWithActionPerTurn => object.hasOwnProperty("turn_action");

export interface IBurningEffect extends IEffectWithActionPerTurn {
  type: EEffectType.BURNING;
}
export interface IBlockingEffect extends IEffect {
  type: EEffectType.BLOCKING;
  who_is_blocking: Character;
}
export const instanceOfBlockingEffect = (
  object: Object
): object is IBlockingEffect => object.hasOwnProperty("who_is_blocking");
