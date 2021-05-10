import {
  ESkillType,
  IListedDamage,
  IExecuteParams,
  burningEffect,
  calculate_damage,
} from "../../internal";

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

export const fire_damage = (
  listed_damage: IListedDamage,
  related_skill?: ESkillType
) => ({ target, turn_state }: IExecuteParams) => {
  const damage = calculate_damage(
    listed_damage,
    target,
    turn_state,
    related_skill
  );

  console.log("BURN DMG", damage);
  turn_state.applyEffect(burningEffect(damage), target);
  return true;
};

export const heal = (healing: number) => ({ target }: IExecuteParams) => {
  target.receive_healing(healing);
  return healing;
};
