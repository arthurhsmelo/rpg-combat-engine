import {
  IBlockingEffect,
  IBurningEffect,
  IEffect,
  TurnState,
  EEffectType,
  ICastingEffect,
  Character,
  IConcentratingEffect,
  IEffectTurnActionParams,
  ISpell,
  instanceOfConcentratingEffect,
} from "../../internal";

export const blockingEffect = (
  turn_state: TurnState,
  duration: number = 1
): IBlockingEffect => ({
  type: EEffectType.BLOCKING,
  blocker: turn_state.agent,
  blocks_action: false,
  duration,
});

export const staggeredEffect = (): IEffect => ({
  type: EEffectType.STAGGERED,
  blocks_action: true,
  duration: 1,
});

const damage_turn_action =
  (damage: number, duration: number, ignore_armor: boolean = false) =>
  ({ target }: IEffectTurnActionParams) => {
    if (target) {
      const damage_per_turn = damage / duration;
      target.receive_damage(damage_per_turn, ignore_armor);
    }
  };

export const burning_effect = (
  damage: number,
  duration: number = 3
): IBurningEffect => ({
  type: EEffectType.BURNING,
  blocks_action: false,
  duration,
  turn_action: damage_turn_action(damage, duration),
});

export const casting_effect = (
  spell: ISpell,
  spell_target: Character
): ICastingEffect => ({
  type: EEffectType.CASTING,
  blocks_action: true,
  duration: spell.casting_time,
  action_after_end: (turn_state) => {
    turn_state.remove_effect(EEffectType.CONCENTRATING, spell_target.id);
    return spell.after_cast({ turn_state, target: spell_target });
  },
});

const keep_concentrating =
  (
    initial_hp: number,
    related_to: {
      effect_type: EEffectType;
      effect_target_id: string;
    }
  ) =>
  ({ target, turn_state }: IEffectTurnActionParams) => {
    if (target.current_hp < initial_hp) {
      turn_state.remove_effect(EEffectType.CONCENTRATING, target.id);
      turn_state.remove_effect(
        related_to.effect_type,
        related_to.effect_target_id
      );
    }
  };

interface IConcentrationParams {
  turn_state: TurnState;
  duration: number;
  related_effect: IEffect;
  related_effect_target_id: string;
}

export const concentration_effect = ({
  turn_state,
  duration,
  related_effect,
  related_effect_target_id,
}: IConcentrationParams): IConcentratingEffect => {
  const concentrating_in = turn_state.active_effects.find(
    (eff) =>
      eff.type === EEffectType.CONCENTRATING &&
      eff.char_id === turn_state.agent.id
  );
  if (concentrating_in && instanceOfConcentratingEffect(concentrating_in)) {
    turn_state.remove_effect(EEffectType.CONCENTRATING, turn_state.agent.id);
    turn_state.remove_effect(
      concentrating_in.related_to.effect_type,
      concentrating_in.related_to.effect_target_id
    );
  }
  turn_state.apply_effect(related_effect, related_effect_target_id);
  return {
    type: EEffectType.CONCENTRATING,
    blocks_action: false,
    duration,
    related_to: {
      effect_target_id: related_effect_target_id,
      effect_type: related_effect.type,
    },
    turn_action: keep_concentrating(turn_state.agent.current_hp, {
      effect_target_id: related_effect_target_id,
      effect_type: related_effect.type,
    }),
  };
};
