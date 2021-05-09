import { TurnState, EActiveEffectType } from "../internal";

export const blockingEffect = (turn_state: TurnState) => ({
  type: EActiveEffectType.BLOCKING,
  who_is_blocking: turn_state.who,
  blocks_action: false,
  number_of_rounds: 1,
});

export const staggeredEffect = () => ({
  type: EActiveEffectType.STAGGERED,
  blocks_action: true,
  number_of_rounds: 1,
});
