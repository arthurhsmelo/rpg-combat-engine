import Character from "./character";

export enum ECharacterType {
  PLAYER = "PLAYER",
  BOAR = "BOAR",
}

export interface ICharacterDefaultValues {
  base_hp: number;
  armor: number;
  available_actions: IAction[];
}

export enum EActionType {
  PHYSICAL_ATTACK = "PHYSICAL_ATTACK",
}

export enum EEquipmentType {
  ARMOR = "ARMOR",
  WEAPON = "WEAPON",
  SHIELD = "SHIELD",
}

export interface IRecord {
  id: string;
  name: string;
  label: string;
  description: string;
}

export type ActionResult<T> = T extends EActionType.PHYSICAL_ATTACK
  ? number
  : never;

export interface IAction<T = EActionType> extends IRecord {
  type: T;
  execute: (target: Character) => ActionResult<T>;
}

export interface IEquipment extends IRecord {
  type: EEquipmentType;
}

export interface IEquipmentWithArmor extends IEquipment {
  armor: number;
}

export const instanceOfEquipmentWithArmor = (
  object: any
): object is IEquipmentWithArmor => object.hasOwnProperty("armor");

export interface IEquipmentWithActions extends IEquipment {
  available_actions: IAction[];
}

export const instanceOfEquipmentWithActions = (
  object: any
): object is IEquipmentWithActions =>
  object.hasOwnProperty("available_actions");

export interface IArmor extends IEquipmentWithArmor {
  type: EEquipmentType.ARMOR;
}

export interface IShield extends IEquipmentWithArmor, IEquipmentWithActions {
  type: EEquipmentType.SHIELD;
}

export interface IWeapon extends IEquipment, IEquipmentWithActions {
  type: EEquipmentType.WEAPON;
}
