import {
  Character,
  EDamageType,
  EEffectType,
  EEquipmentType,
  ESkillType,
  IListedDamage,
  instanceOfBlockingEffect,
  IShield,
  NPC,
  pipe,
  Player,
  staggeredEffect,
  TurnState,
} from "../../internal";

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
  MAX: 1,
};
const SKILL_MULTIPLIER = 0.006;
const BLOCK_MULTIPLIER = 0.005;
const PARRY_MULTIPLIER = 0.009;

const random = (min: number, max: number) => Math.random() * (max - min) + min;

export const calculate_damage = (
  listed_damage: IListedDamage,
  target: Character,
  turn_state: TurnState,
  related_skill?: ESkillType
) => {
  const { agent, active_effects } = turn_state;

  const apply_blocking_penalty = (damage: number) => {
    const blocking = active_effects.find(
      (eff) => eff.char_id === target.id && eff.type === EEffectType.BLOCKING
    );
    let result = damage;
    if (blocking && instanceOfBlockingEffect(blocking)) {
      const { block_power } = (blocking.blocker.equipped_equipment.find(
        (equipment) => equipment.type === EEquipmentType.SHIELD
      ) as IShield) ?? { block_power: 0 };

      let level = 0;
      if (blocking.blocker instanceof Player) {
        ({ level } = blocking.blocker.skills.find(
          (s) => s.type === ESkillType.SHIELDS
        ) ?? { level: 0 });
      }

      const blocked_damage = block_power * (1 + BLOCK_MULTIPLIER * level);
      result = damage - blocked_damage;

      // Parry
      if (damage <= blocked_damage * 2) {
        const parry = random(PARRY_MULTIPLIER * level, PARRY_RANGE.MAX);
        if (Math.random() <= parry) {
          console.log("applied parry", agent.id);
          // Apply Staggered effect to turn agent
          turn_state.apply_effect(staggeredEffect(), agent.id);
          result = 0;
        }
      }

      // Gets staggered
      if (damage > blocked_damage * 4) {
        // Apply Staggered effect to blocker
        turn_state.apply_effect(staggeredEffect(), blocking.blocker.id);
        result = damage;
      }
    }
    return Math.max(result, 0);
  };

  const apply_damage_type_bonus = (type: EDamageType) => (damage: number) => {
    const resistance = target.resistances[type];
    let result = damage;
    if (resistance !== undefined) {
      result = damage * resistance;
    }
    return result;
  };

  const apply_stagger_bonus = (damage: number) => {
    const staggered = active_effects.find(
      (effect) =>
        effect.char_id === target.id && effect.type === EEffectType.STAGGERED
    );
    let result = damage;
    if (staggered) {
      result = damage * 2;
    }
    return result;
  };

  const rng_damage = (damage: number) => {
    let rng: number = 0;
    let skill_level: number = 0;

    if (agent instanceof NPC) {
      rng = random(NPC_DAMAGE_RANGE.MIN, NPC_DAMAGE_RANGE.MAX);
    } else if (agent instanceof Player) {
      rng = random(PLAYER_DAMAGE_RANGE.MIN, PLAYER_DAMAGE_RANGE.MAX);

      if (related_skill) {
        const skill = agent.skills.find((s) => s.type === related_skill);
        skill_level = SKILL_MULTIPLIER * (skill?.level ?? 0);
      }
    }

    const result = Math.min(rng + skill_level, 1) * damage;
    return result;
  };

  return pipe(
    rng_damage,
    apply_stagger_bonus,
    apply_damage_type_bonus(listed_damage.type),
    apply_blocking_penalty
  )(listed_damage.value);
};
