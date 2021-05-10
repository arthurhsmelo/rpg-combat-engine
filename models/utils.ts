import { TurnState, Character } from "../internal";

export enum ECharacterType {
  PLAYER = "PLAYER",
  BOAR = "BOAR",
}

export enum EResistanceMultipler {
  VERY_WEAK = 2,
  WEAK = 1.5,
  NEUTRAL = 1,
  STRONG = 0.5,
  VERY_STRONG = 0.25,
  IMMUNE = 0,
}

export type IResistances = {
  [damage_type in EDamageType]?: EResistanceMultipler;
};

export interface ICharacterDefaultValues {
  base_hp: number;
  armor: number;
  available_actions: IAction[];
  skills: ISkill[];
  resistances: IResistances;
}

export enum EActionType {
  PHYSICAL_ATTACK = "PHYSICAL_ATTACK",
  DOT = "DOT",
  HELP = "HELP",
  HEAL = "HEAL",
  USE_ITEM = "USE_ITEM",
  NULL = "NULL",
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

export enum EDamageType {
  SLASH = "SLASH",
  BLUNT = "BLUNT",
  PIERCE = "PIERCE",
  FIRE = "FIRE",
}
export interface IListedDamage {
  type: EDamageType;
  value: number;
}
export interface IWeapon extends IEquipment, IEquipmentWithActions {
  type: EEquipmentType.WEAPON;
  listed_damages: IListedDamage[];
}

export enum ESkillType {
  SWORDS = "SWORDS",
  SHIELDS = "SHIELDS",
  UNARMED = "UNARMED",
}
export interface ISkill {
  type: ESkillType;
  level: number;
  xp: number;
}
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

export interface CombatResult {
  winner: number;
}

export interface ActArguments {
  action: IAction;
  target?: Character;
}

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
