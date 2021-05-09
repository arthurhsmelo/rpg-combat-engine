import {
  Character,
  Record,
  TurnState,
  ActArguments,
  ECharacterType,
} from "../internal";

type StrategyType = (turn_state: TurnState) => ActArguments;
export interface IArtificalIntelligence {
  strategy: StrategyType;
}
export class NPC extends Character {
  public strategy: StrategyType;

  constructor(
    record: Record,
    type: ECharacterType,
    ai: IArtificalIntelligence
  ) {
    super(record, type);
    this.strategy = ai.strategy;
  }
}
