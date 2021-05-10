import { Character, TurnState, ESkillType, IItem, IRecord } from "../internal";

export enum EActionType {
  PHYSICAL_ATTACK = "PHYSICAL_ATTACK",
  DOT = "DOT",
  HELP = "HELP",
  HEAL = "HEAL",
  USE_ITEM = "USE_ITEM",
  NULL = "NULL",
}

interface IActionResult {
  [EActionType.PHYSICAL_ATTACK]: number;
  [EActionType.HEAL]: number;
  [EActionType.HELP]: boolean;
  [EActionType.USE_ITEM]: boolean;
  [EActionType.DOT]: boolean;
  [EActionType.NULL]: boolean;
}
export type ActionResult<T extends EActionType> = IActionResult[T];

export interface IExecuteParams {
  target: Character;
  turn_state: TurnState;
}
export interface IBaseAction<T extends EActionType = EActionType>
  extends IRecord {
  type: T;
  related_skill?: ESkillType;
  execute: ({ target, turn_state }: IExecuteParams) => ActionResult<T>;
  get_available_targets: (targets: {
    allies: Character[];
    enemies: Character[];
  }) => Character[];
}

export type IActionWithChild<
  T extends EActionType = EActionType
> = IBaseAction<T> & {
  get_child_actions: (who: Character) => IChildAction[];
};
export interface IChildAction<T extends EActionType = EActionType>
  extends IBaseAction<T> {
  parent_action_id: string;
  item: IItem;
}

export type IAction<
  T extends EActionType = EActionType
> = T extends EActionType.USE_ITEM ? IActionWithChild<T> : IBaseAction<T>;

export function action_creator<T extends EActionType>(action: IAction<T>) {
  return action as IAction<typeof action.type>;
}
