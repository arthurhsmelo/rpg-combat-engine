import {
  Character,
  Record,
  ECharacterType,
  ISkill,
  ESkillType,
  IItem,
} from "../../internal";

class ItemNotFoundException extends Error {
  constructor() {
    super("ItemNotFoundException");
  }
}

export class Player extends Character {
  private _skills: ISkill[] = [];
  private _inventory: (IItem & { quantity: number })[] = [];

  constructor(record: Record) {
    super(record, ECharacterType.PLAYER);
    this._skills = this._default_values.skills;
  }

  public increase_skill(skill_type: ESkillType) {
    let skill = this._skills.find((s) => s.type === skill_type);
    if (!skill) {
      skill = {
        type: skill_type,
        level: 0,
        xp: 0,
      };
      this._skills.push(skill);
    }
    if (skill.level < 100) {
      const xp_to_next_level = Math.pow(skill.level + 1, 1.5) * 0.5 + 0.5;
      skill.xp += 1;
      if (skill.xp >= xp_to_next_level) {
        skill.xp = 0;
        skill.level += 1;
      }
    }
  }

  public update_item_quantity(item_id: string, quantity: number) {
    const item_index = this.find_item_index_by_id(item_id);
    if (item_index === -1) {
      throw new ItemNotFoundException();
    } else {
      this._inventory[item_index].quantity += quantity;
      if (this._inventory[item_index].quantity === 0) {
        this.remove_item_from_inventory(item_id);
      }
    }
  }

  public add_item_to_inventory(item: IItem, quantity: number = 1) {
    const item_index = this.find_item_index_by_id(item.id);
    if (item_index !== -1) {
      this._inventory[item_index].quantity += quantity;
    } else {
      this._inventory = [...this._inventory, { ...item, quantity }];
    }
  }

  public remove_item_from_inventory(item_id: string) {
    const item_index = this.find_item_index_by_id(item_id);
    if (item_index === -1) {
      throw new ItemNotFoundException();
    } else {
      this._inventory = this._inventory
        .slice(0, item_index)
        .concat(this._inventory.slice(item_index + 1));
    }
  }

  private find_item_index_by_id(item_id: string) {
    return this._inventory.findIndex((item) => item.id === item_id);
  }

  public get skills() {
    return this._skills;
  }
  public get inventory() {
    return this._inventory;
  }
}
