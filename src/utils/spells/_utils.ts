import {
  casting_effect,
  IExecuteParams,
  IMaterial,
  ISpellWithMaterial,
  ISpell,
  Player,
} from "../../internal";
import { concentration_effect } from "../effects/effects";
import { use_item } from "../executions/execution_side_effects";

export const use_spell =
  (spell: ISpell) =>
  ({ target, turn_state }: IExecuteParams) => {
    let spell_used: boolean = false;
    let required_materials: IMaterial[] =
      (spell as ISpellWithMaterial).required_materials ?? [];
    let has_all_required_materials: boolean = true;
    if (required_materials.length > 0) {
      if (turn_state.agent instanceof Player) {
        const items_quantity: { [item_id: string]: number } =
          turn_state.agent.inventory.reduce(
            (result, item) => ({ ...result, [item.id]: item.quantity }),
            {}
          );
        required_materials.forEach((material) => {
          const item_quantity = items_quantity[material.item_id];
          if (!item_quantity || item_quantity < material.quantity) {
            has_all_required_materials = false;
          }
        });
      }
    }
    if (
      has_all_required_materials &&
      turn_state.agent.current_mana >= spell.mana_cost
    ) {
      turn_state.agent.use_mana(spell.mana_cost);
      required_materials.forEach(({ item_id }) => {
        use_item(item_id)({ target, turn_state });
      });
      if (spell.casting_time > 0) {
        turn_state.apply_effect(
          concentration_effect({
            turn_state,
            duration: spell.casting_time,
            related_effect: casting_effect(spell, target),
            related_effect_target_id: turn_state.agent.id,
          }),
          turn_state.agent.id
        );
        spell_used = true;
      } else {
        spell_used = spell.after_cast({ target, turn_state });
      }
    }
    return spell_used;
  };
