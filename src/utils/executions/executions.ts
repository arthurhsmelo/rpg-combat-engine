import {
  ESkillType,
  IListedDamage,
  IExecuteParams,
  burning_effect,
  calculate_damage,
} from "../../internal";
import { EDamageType } from "../../types/equipment.types";

export const damage = (
  listed_damages: IListedDamage[],
  related_skill?: ESkillType
) => ({ target, turn_state }: IExecuteParams) => {
  const total_damage = listed_damages.reduce((acc, curr) => {
    return acc + calculate_damage(curr, target, turn_state, related_skill);
  }, 0);

  target.receive_damage(total_damage);
  return total_damage;
};

export const fire_damage = (value: number, related_skill?: ESkillType) => ({
  target,
  turn_state,
}: IExecuteParams) => {
  const damage = calculate_damage(
    { type: EDamageType.FIRE, value },
    target,
    turn_state,
    related_skill
  );
  console.log("burning effect:", damage);
  turn_state.apply_effect(burning_effect(damage), target);
  return true;
};

export const heal = (healing: number) => ({ target }: IExecuteParams) => {
  target.receive_healing(healing);
  return healing;
};
