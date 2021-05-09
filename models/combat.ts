import {
  common_verbose,
  verbose,
  ActArguments,
  CombatResult,
  IAction,
  instanceOfEquipmentWithActions,
  Character,
  NPC,
  IActiveEffect,
  EActionType,
  action_creator,
  Player,
} from "../internal";
import { IChildAction } from "./utils";

function shuffleArray(array: Array<any>) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export type Act = (
  action: IAction,
  target: Character
) => CombatResult | undefined;

export interface NextAction {
  who: Character;
  available_actions: IAction[];
  combat_state: {
    allies: Character[];
    enemies: Character[];
  };
}

class ActionNotAvailable extends Error {
  constructor() {
    super("ActionNotAvailable");
  }
}

export type CombatActiveEffects = Array<
  {
    char_id: string;
    remaining_turns: number;
  } & IActiveEffect
>;

export interface TurnState {
  who: Character;
  available_actions: IAction[];
  allies: Character[];
  enemies: Character[];
  applyEffect: (effect: IActiveEffect, target: Character) => void;
  active_effects: CombatActiveEffects;
}

export class Combat {
  private _result: CombatResult;
  private current_index: number;
  private combat_queue: Character[];
  private group_1: Character[];
  private group_2: Character[];
  private verbose: boolean;
  private turn_state: TurnState;
  private active_effects: CombatActiveEffects;

  constructor(
    group_1: Character[],
    group_2: Character[],
    verbose: boolean = true
  ) {
    this.group_1 = group_1;
    this.group_2 = group_2;
    this.verbose = verbose;

    // Initiative
    this.combat_queue = shuffleArray([...group_1, ...group_2]);
    this.current_index = 0;
    this.active_effects = [];
  }

  public init() {
    const combat = this._init();
    let first_round = combat.next();
    return { combat, first_round };
  }

  private *_init(): Generator<TurnState, CombatResult, ActArguments> {
    do {
      const who = this.combat_queue[this.current_index];
      const { allies, enemies } = this.get_allies_and_enemies(who);
      this.turn_state = {
        who,
        available_actions: this.get_available_actions(),
        allies,
        enemies,
        active_effects: this.active_effects,
        applyEffect: this.applyEffect.bind(this),
      };
      let action: IAction, target: Character | undefined;
      if (who instanceof NPC) {
        ({ action, target } = who.strategy(this.turn_state));
      } else {
        ({ action, target } = yield this.turn_state);
        if (action.related_skill) {
          (who as Player).increase_skill(action.related_skill);
        }
      }
      if (action && (action.type === EActionType.NULL || target)) {
        this.act(action, target as Character);
      }
    } while (this._result === undefined);
    return this._result;
  }

  private act(action: IAction, target: Character): CombatResult | undefined {
    if (
      !this.turn_state.available_actions.find(
        (av_action) =>
          av_action.id === action.id ||
          av_action.id === (action as IChildAction).parent_action_id
      )
    ) {
      throw new ActionNotAvailable();
    } else {
      const action_result = action.execute({
        target,
        turn_state: this.turn_state,
      });
      this.update_active_effects();
      this.current_index = (1 + this.current_index) % this.combat_queue.length;

      if (this.verbose && typeof action_result === "number") {
        console.log(
          "\n - " +
            this.turn_state.who.name +
            " " +
            common_verbose["uses"] +
            " " +
            action.name +
            " " +
            common_verbose["on"] +
            " " +
            target.name +
            " " +
            verbose[action.type].action_result_label +
            " " +
            action_result.toFixed(2) +
            " " +
            verbose[action.type].action_result_unit +
            "\n"
        );
      }
    }
    this.check_finish();

    if (this.verbose && this._result?.winner !== undefined) {
      console.log(`\n${this.result}`);
    }
    return this._result;
  }

  private update_active_effects() {
    this.active_effects = this.active_effects.filter((item) => {
      item.remaining_turns -= 1;
      return item.remaining_turns > 0;
    });
  }

  private applyEffect = (effect: IActiveEffect, target: Character) => {
    const active_effect = this.active_effects.find(
      (eff) => eff.type === effect.type
    );
    if (active_effect) {
      active_effect.remaining_turns +=
        effect.number_of_rounds * this.combat_queue.length;
    } else {
      this.active_effects.push({
        char_id: target.id,
        remaining_turns: effect.number_of_rounds * this.combat_queue.length,
        ...effect,
      });
    }
  };

  private check_finish() {
    const sum = (acc: number, curr: Character) => acc + curr.current_hp;
    const sum_group1 = this.group_1.reduce(sum, 0);
    const sum_group2 = this.group_2.reduce(sum, 0);
    if (sum_group1 <= 0) {
      this._result = {
        winner: 1,
      };
    } else if (sum_group2 <= 0) {
      this._result = {
        winner: 0,
      };
    }
  }

  private get_available_actions(): IAction<EActionType>[] {
    const who = this.combat_queue[this.current_index];
    if (
      this.active_effects.find(
        (eff) => eff.char_id === who.id && eff.blocks_action === true
      )
    ) {
      return [
        action_creator({
          id: "NULL",
          name: "ZzZz...",
          label: "ZZ",
          description: "Você não consegue agir neste turno",
          execute: () => {
            return false;
          },
          get_available_targets: () => [],
          type: EActionType.NULL,
        }),
      ];
    } else {
      const default_available_actions = who.default_values.available_actions;
      const available_actions = who.equipped_equipment.reduce(
        (available_actions, equip) => {
          if (instanceOfEquipmentWithActions(equip)) {
            return available_actions.concat(equip.available_actions);
          } else {
            return available_actions;
          }
        },
        default_available_actions
      );
      return available_actions;
    }
  }

  private get_allies_and_enemies(who: Character) {
    const is_from_group_1 = this.group_1.find((c) => c.id === who.id);
    if (is_from_group_1) {
      return { allies: this.group_1, enemies: this.group_2 };
    } else {
      return { allies: this.group_2, enemies: this.group_1 };
    }
  }

  public get result() {
    return `\nO ${
      this._result.winner === 0 ? "primeiro" : "segundo"
    } grupo é o vencedor\n`;
  }
}
