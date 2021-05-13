import {
  EActionType,
  ESkillType,
  ESpellComponent,
  fire_damage,
  hostile,
  ISpell,
  pipe,
  use_spell,
  dead,
  ISpellWithMaterial,
  living,
  friendly,
} from "../internal";
import { EEffectType } from "../types/effect.types";
import { blockingEffect, concentration_effect } from "../utils/effects/effects";

export const fire_ball: ISpell = {
  id: "FIREBALL",
  name: "Bola de fogo",
  description:
    "Você se concentra e arremessa uma bola de fogo, causando 20 de dano de fogo em divididos em 3 turnos",
  label: "FB",
  type: EActionType.SPELL,
  related_skill: ESkillType.SPELL_CASTING,
  mana_cost: 10,
  casting_time: 1,
  components: [ESpellComponent.SOMATIC, ESpellComponent.VERBAL],
  after_cast: fire_damage(20, ESkillType.SPELL_CASTING),
  get_available_targets: pipe(hostile(), living),
  get execute() {
    return use_spell(this);
  },
};
export const fire_bolt: ISpell = {
  id: "FireBolt",
  name: "Flecha de fogo",
  description:
    "Você se concentra e arremessa uma flecha de fogo, causando 10 de dano de fogo em divididos em 3 turnos",
  label: "FB",
  type: EActionType.SPELL,
  related_skill: ESkillType.SPELL_CASTING,
  mana_cost: 0,
  casting_time: 0,
  components: [ESpellComponent.SOMATIC, ESpellComponent.VERBAL],
  after_cast: fire_damage(40, ESkillType.SPELL_CASTING),
  get_available_targets: pipe(hostile(), living),
  get execute() {
    return use_spell(this);
  },
};
export const revive: ISpellWithMaterial = {
  id: "Revive",
  name: "Reviver",
  description:
    "Você encosta numa criatura que morreu. Ela volta a vida com 1 ponto de vida.",
  label: "RE",
  type: EActionType.SPELL,
  related_skill: ESkillType.SPELL_CASTING,
  mana_cost: 20,
  casting_time: 0,
  components: [ESpellComponent.SOMATIC, ESpellComponent.VERBAL],
  after_cast: ({ target }) => {
    target.receive_healing(1);
    return true;
  },
  get_available_targets: dead(),
  get execute() {
    return use_spell(this);
  },
  required_materials: [
    {
      item_id: "Diamond",
      quantity: 3,
    },
  ],
};
export const protect: ISpell = {
  id: "Protect",
  name: "Proteger",
  description:
    "Você se concentra para criar um escudo no seu alvo, criando um efeito de Bloquear",
  label: "PR",
  type: EActionType.SPELL,
  related_skill: ESkillType.SPELL_CASTING,
  mana_cost: 0,
  casting_time: 0,
  components: [ESpellComponent.SOMATIC, ESpellComponent.VERBAL],
  after_cast: ({ target, turn_state }) => {
    turn_state.apply_effect(
      concentration_effect({
        turn_state,
        duration: Infinity,
        components: [ESpellComponent.SOMATIC, ESpellComponent.VERBAL],
        related_effect: blockingEffect(turn_state, Infinity),
        related_effect_target_id: target.id,
      }),
      turn_state.agent.id
    );
    return true;
  },
  get_available_targets: pipe(friendly(), living),
  get execute() {
    return use_spell(this);
  },
};
