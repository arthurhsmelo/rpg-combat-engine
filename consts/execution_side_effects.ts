import { Player, IExecuteParams } from "../internal";

export const use_item = (item_id: string) => ({
  target,
  turn_state,
}: IExecuteParams) => {
  if (turn_state.who instanceof Player) {
    turn_state.who.update_item_quantity(item_id, -1);
  }
  return { target, turn_state };
};
