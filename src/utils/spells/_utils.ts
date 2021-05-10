import { castingEffect, IExecuteParams, ISpell } from "../../internal";

export const use_spell = (spell: ISpell) => ({
  target,
  turn_state,
}: IExecuteParams) => {
  if (turn_state.who.current_mana >= spell.mana_cost) {
    turn_state.who.use_mana(spell.mana_cost);
    if (spell.casting_time > 0) {
      turn_state.apply_effect(castingEffect(spell, target), turn_state.who);
      return true;
    } else {
      return spell.after_cast({ target, turn_state });
    }
  } else {
    return false;
  }
};
