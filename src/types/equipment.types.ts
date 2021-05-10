import { ESkillType, IAction, IRecord } from "../internal";

export enum EDamageType {
  SLASH = "SLASH",
  BLUNT = "BLUNT",
  PIERCE = "PIERCE",
  FIRE = "FIRE",
}

export enum EEquipmentType {
  ARMOR = "ARMOR",
  WEAPON = "WEAPON",
  SHIELD = "SHIELD",
}

export interface IEquipment extends IRecord {
  type: EEquipmentType;
}

export interface IEquipmentWithArmor extends IEquipment {
  armor: number;
}

export const instanceOfEquipmentWithArmor = (
  object: Object
): object is IEquipmentWithArmor => object.hasOwnProperty("armor");

export interface IEquipmentWithActions extends IEquipment {
  related_skill: ESkillType;
  available_actions: IAction[];
}

export const instanceOfEquipmentWithActions = (
  object: Object
): object is IEquipmentWithActions =>
  object.hasOwnProperty("available_actions");

export interface IArmor extends IEquipmentWithArmor {
  type: EEquipmentType.ARMOR;
}

export interface IShield extends IEquipmentWithActions {
  type: EEquipmentType.SHIELD;
  block_power: number;
}

export interface IListedDamage {
  type: EDamageType;
  value: number;
}
export interface IWeapon extends IEquipment, IEquipmentWithActions {
  type: EEquipmentType.WEAPON;
  listed_damages: IListedDamage[];
}
