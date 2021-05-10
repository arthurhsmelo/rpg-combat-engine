import { IAction, IRecord } from "../internal";

export enum EItemType {
  "POTION" = "POTION",
}
export interface IItem extends IRecord {
  type: EItemType;
}
export interface IItemWithActions extends IItem {
  available_actions: IAction[];
}

export const instanceOfItemWithActions = (
  object: Object
): object is IItemWithActions => object.hasOwnProperty("available_actions");

export interface IPotion extends IItemWithActions {
  type: EItemType.POTION;
}
