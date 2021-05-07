import default_char_values from "../consts/default_char_values";
import { Act, CombatResult, NextAction } from "./combat";
import {
  ECharacterType,
  IAction,
  ICharacterDefaultValues,
  IEquipment,
  instanceOfEquipmentWithActions,
  instanceOfEquipmentWithArmor,
  IRecord,
} from "./utils";

export class Record {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly description: string;

  constructor(record: IRecord) {
    this.id = record.id;
    this.name = record.name;
    this.label = record.label;
    this.description = record.description;
  }
}

class EquipmentNotFoundException extends Error {
  constructor() {
    super("EquipmentNotFoundException");
  }
}

class EquipmentAlreadyEquipped extends Error {
  constructor() {
    super("EquipmentAlreadyEquipped");
  }
}

export class Character extends Record {
  private _default_values: ICharacterDefaultValues;
  private _max_hp: number;
  private _current_hp: number;
  private _armor: number;
  private _type: ECharacterType;
  private _equipped_equipment: IEquipment[] = [];

  constructor(record: IRecord, type: ECharacterType) {
    super(record);
    this._default_values = default_char_values[type];
    this._type = type;
    this._max_hp = this._current_hp = this._default_values.base_hp;
    this._armor = this._default_values.armor;
    this._equipped_equipment = [];
  }

  public equip(equipment: IEquipment) {
    const index = this.find_equipment_index_by_id(equipment.id);
    if (index !== -1) {
      throw new EquipmentAlreadyEquipped();
    } else {
      this._equipped_equipment = [...this._equipped_equipment, equipment];
    }
    this.recalculate_armor();
  }

  public unequip(equipment_id: string) {
    const index = this.find_equipment_index_by_id(equipment_id);
    if (index === -1) {
      throw new EquipmentNotFoundException();
    } else {
      this._equipped_equipment = this._equipped_equipment
        .slice(0, index)
        .concat(this._equipped_equipment.slice(index + 1));
    }
    this.recalculate_armor();
  }

  public receive_damage(damage: number) {
    this._current_hp -= damage;
  }

  private recalculate_armor() {
    const default_armor = this._default_values.armor;
    this._armor = this._equipped_equipment.reduce((armor, equip) => {
      if (instanceOfEquipmentWithArmor(equip)) {
        return armor + equip.armor;
      } else {
        return armor;
      }
    }, default_armor);
  }

  private find_equipment_index_by_id(equipment_id: string) {
    return this._equipped_equipment.findIndex(
      (equipment) => equipment.id === equipment_id
    );
  }

  public get max_hp() {
    return this._max_hp;
  }
  public get current_hp() {
    return this._current_hp;
  }
  public get armor() {
    return this._armor;
  }
  public get equipped_equipment() {
    return this._equipped_equipment;
  }
  public get type() {
    return this._type;
  }
  public get default_values() {
    return this._default_values;
  }
}

export interface IArtificalIntelligence {
  strategy: (next_action: NextAction) => CombatResult | undefined;
}

export class NPC extends Character {
  public strategy: (next_action: NextAction) => CombatResult | undefined;

  constructor(
    record: Record,
    type: ECharacterType,
    ai: IArtificalIntelligence
  ) {
    super(record, type);
    this.strategy = ai.strategy;
  }
}

export default Character;
