import {
  Character,
  TurnState,
  NPC,
  ESkillType,
  IListedDamage,
  pipe,
  EActiveEffectType,
  EEquipmentType,
  IShield,
  instanceOfBlockingEffect,
  staggeredEffect,
  Player,
  IExecuteParams,
} from "../internal";

const random = (min: number, max: number) => Math.random() * (max - min) + min;

const NPC_DAMAGE_RANGE = {
  MIN: 0.75,
  MAX: 1,
};

const PLAYER_DAMAGE_RANGE = {
  MIN: 0.25,
  MAX: 0.55,
};

const PARRY_RANGE = {
  MIN: 0,
  MAX: 0.5,
};

const SKILL_MULTIPLIER = 0.006;
const BLOCK_MULTIPLIER = 0.005;

export const damage = (
  listed_damages: IListedDamage[],
  related_skill?: ESkillType
) => ({ target, turn_state }: IExecuteParams) => {
  let rng: number;
  let skill: number = 0;
  const { who, active_effects } = turn_state;

  if (who instanceof NPC) {
    rng = random(NPC_DAMAGE_RANGE.MIN, NPC_DAMAGE_RANGE.MAX);
  } else if (who instanceof Player && related_skill) {
    rng = random(PLAYER_DAMAGE_RANGE.MIN, PLAYER_DAMAGE_RANGE.MAX);
    const _skill = who.skills.find((s) => s.type === related_skill);
    skill = SKILL_MULTIPLIER * (_skill?.level ?? 0);
  }

  const apply_blocking_penalty = (damage: number) => {
    const blocking = active_effects.find(
      (eff) =>
        eff.char_id === target.id && eff.type === EActiveEffectType.BLOCKING
    );
    let result = damage;
    if (blocking && instanceOfBlockingEffect(blocking)) {
      const { block_power } = (blocking.who_is_blocking.equipped_equipment.find(
        (equipment) => equipment.type === EEquipmentType.SHIELD
      ) as IShield) ?? { block_power: 0 };

      let level = 0;
      if (blocking.who_is_blocking instanceof Player) {
        ({ level } = blocking.who_is_blocking.skills.find(
          (s) => s.type === ESkillType.SHIELDS
        ) ?? { level: 0 });
      }

      const blocked_damage = block_power * (1 + BLOCK_MULTIPLIER * level);
      result = damage - blocked_damage;

      // Parry
      if (damage <= blocked_damage * 2) {
        const parry =
          random(PARRY_RANGE.MIN, PARRY_RANGE.MAX) + BLOCK_MULTIPLIER * level;
        if (Math.random() <= parry) {
          // Apply Staggered effect to who is attacking
          turn_state.applyEffect(staggeredEffect(), who);
          result = 0;
        }
      }

      // Gets staggered
      if (damage > blocked_damage * 4) {
        // Apply Staggered effect to blocker
        turn_state.applyEffect(staggeredEffect(), blocking.who_is_blocking);
        result = damage;
      }
    }
    return Math.max(result, 0);
  };

  const apply_stagger_bonus = (damage: number) => {
    const staggered = active_effects.find(
      (effect) =>
        effect.char_id === target.id &&
        effect.type === EActiveEffectType.STAGGERED
    );
    let result = damage;
    if (staggered) {
      result = damage * 2;
    }
    return result;
  };

  const rng_damage = (damage: number) => {
    const result = Math.min(rng + skill, 1) * damage;
    return result;
  };

  const calculate_damage = (dmg: IListedDamage) =>
    pipe(rng_damage, apply_stagger_bonus, apply_blocking_penalty)(dmg.value);

  const total_damage = listed_damages.reduce((acc, curr) => {
    return acc + calculate_damage(curr);
  }, 0);

  target.receive_damage(total_damage);
  return total_damage;
};

export const heal = (healing: number) => ({ target }: IExecuteParams) => {
  target.receive_healing(healing);
  return healing;
};

export const use_item = (item_id: string) => ({
  target,
  turn_state,
}: IExecuteParams) => {
  if (turn_state.who instanceof Player) {
    turn_state.who.update_item_quantity(item_id, -1);
  }
  return { target, turn_state };
};
