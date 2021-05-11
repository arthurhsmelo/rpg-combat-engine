import { IExecuteParams, Player } from "../../internal";

export const use_item = (item_id: string) => ({
  target,
  turn_state,
}: IExecuteParams) => {
  if (turn_state.agent instanceof Player) {
    turn_state.agent.update_item_quantity(item_id, -1);
  }
  return { target, turn_state };
};
