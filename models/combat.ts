import Character, { NPC } from "./character";
import { IAction, instanceOfEquipmentWithActions } from "./utils";

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
  act: Act;
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

class CombatFinished extends Error {
  constructor(winner: number) {
    super("ActionNotAvailable");
    this.message = `O ${
      winner === 0 ? "primeiro" : "segundo"
    } grupo é o vencedor`;
  }
}

export interface CombatResult {
  winner: number;
}

class Combat {
  private current_index: number;
  private combat_queue: Character[];
  private next_action: NextAction;
  private group_1: Character[];
  private group_2: Character[];
  private _result: CombatResult;

  constructor(group_1: Character[], group_2: Character[]) {
    this.group_1 = group_1;
    this.group_2 = group_2;

    // Initiative
    this.combat_queue = shuffleArray([...group_1, ...group_2]);
    this.current_index = 0;
  }

  public next(): NextAction {
    if (this._result?.winner !== undefined) {
      throw new CombatFinished(this._result.winner);
    } else {
      const who = this.combat_queue[this.current_index];
      const { allies, enemies } = this.get_allies_and_enemies(who);
      this.next_action = {
        who,
        available_actions: this.get_available_actions(),
        act: this.act.bind(this),
        combat_state: {
          allies,
          enemies,
        },
      };
      if (who instanceof NPC) {
        who.strategy(this.next_action);
        return this.next();
      } else {
        return this.next_action;
      }
    }
  }

  private act(
    action: IAction,
    target: Character,
    verbose: boolean = true
  ): CombatResult | undefined {
    if (
      !this.next_action.available_actions.find(
        (av_action) => av_action.id === action.id
      )
    ) {
      throw new ActionNotAvailable();
    } else {
      const damage_taken = action.execute(target);
      this.current_index = (1 + this.current_index) % this.combat_queue.length;

      if (verbose) {
        console.log(
          `\n${this.next_action.who.name} usa ${action.name} contra ${target.name} causando ${damage_taken} de dano`
        );
      }
    }
    this.check_finish();

    if (verbose && this._result?.winner !== undefined) {
      console.log(`\n${this.result}`);
    }
    return this._result;
  }

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

  private get_available_actions() {
    const who = this.combat_queue[this.current_index];
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

  private get_allies_and_enemies(who: Character) {
    const is_from_group_1 = this.group_1.find((c) => c.id === who.id);
    if (is_from_group_1) {
      return { allies: this.group_1, enemies: this.group_2 };
    } else {
      return { allies: this.group_2, enemies: this.group_1 };
    }
  }

  public get result() {
    return `O ${
      this._result.winner === 0 ? "primeiro" : "segundo"
    } grupo é o vencedor`;
  }
}

export default Combat;
