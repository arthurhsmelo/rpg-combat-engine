import {
  default_char_values,
  ECharacterType,
  ICharacterDefaultValues,
  IEquipment,
  instanceOfEquipmentWithArmor,
  IRecord,
  IResistances,
  ISpell,
} from "../../internal";
import { instanceOfEquipmentWithManaPower } from "../../types/equipment.types";

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
  protected _default_values: ICharacterDefaultValues;
  protected _max_hp: number;
  protected _current_hp: number;
  protected _armor: number;
  protected _type: ECharacterType;
  protected _equipped_equipment: IEquipment[];
  protected _resistances: IResistances;
  protected _max_mana: number;
  protected _current_mana: number;
  protected _spells: ISpell[];

  constructor(record: IRecord, type: ECharacterType) {
    super(record);
    this._default_values = default_char_values[type];
    this._type = type;
    this._max_hp = this._current_hp = this._default_values.base_hp;
    this._armor = this._default_values.armor;
    this._resistances = this._default_values.resistances;
    this._equipped_equipment = [];
    this._spells = [];
    this._max_mana = 0;
    this._current_mana = 0;
  }

  public equip(equipment: IEquipment) {
    const index = this.find_equipment_index_by_id(equipment.id);
    if (index !== -1) {
      throw new EquipmentAlreadyEquipped();
    } else {
      this._equipped_equipment = [...this._equipped_equipment, equipment];
      if (instanceOfEquipmentWithManaPower(equipment)) {
        this._max_mana += equipment.mana_power;
        this._current_mana += equipment.mana_power;
      }
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

  public receive_damage(damage: number, ignore_armor: boolean = false) {
    let damage_taken = damage;
    if (this._armor > 0 && !ignore_armor) {
      damage_taken = (damage / (this._armor * 4)) * damage;
      if (this._armor < damage / 2) {
        damage_taken = damage - this._armor;
      }
    }
    this._current_hp = Math.max(this._current_hp - damage_taken, 0);
  }

  public receive_healing(healing: number) {
    this._current_hp += healing;
  }

  public use_mana(mana: number) {
    this._current_mana -= mana;
  }

  public add_spell(spell: ISpell) {
    const spell_index = this.find_spell_index_by_id(spell.id);
    if (spell_index === -1) {
      this._spells = [...this._spells, spell];
    }
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

  private find_spell_index_by_id(spell_id: string) {
    return this._spells.findIndex((spell) => spell.id === spell_id);
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
  public get resistances() {
    return this._resistances;
  }
  public get current_mana() {
    return this._current_mana;
  }
  public get spells() {
    return this._spells;
  }
  public get default_values() {
    return this._default_values;
  }
}

export default Character;
