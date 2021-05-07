import Character from "../models/character";

export const damage = (damage: number) => (target: Character) => {
  target.receive_damage(damage);
  return damage;
};
