import {
  EActionType,
  ECharacterType,
  ICharacterDefaultValues,
} from "../models/utils";
import { damage } from "./common_executions";

const default_char_values: {
  [key in ECharacterType]: ICharacterDefaultValues;
} = {
  BOAR: {
    base_hp: 10,
    armor: 0,
    available_actions: [
      {
        id: "BITE",
        name: "Morder",
        description: "Mordida feroz",
        label: "MD",
        execute: damage(5),
        type: EActionType.PHYSICAL_ATTACK,
      },
    ],
  },
  PLAYER: {
    base_hp: 25,
    armor: 0,
    available_actions: [
      {
        id: "PUNCH",
        name: "Socar",
        description: "Um gancho de direita",
        label: "SC",
        execute: damage(3),
        type: EActionType.PHYSICAL_ATTACK,
      },
    ],
  },
};

export default default_char_values;
