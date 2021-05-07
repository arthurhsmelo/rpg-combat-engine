import { damage } from "./consts/common_executions";
import Character, { NPC } from "./models/character";
import Combat from "./models/combat";
import {
  EActionType,
  ECharacterType,
  EEquipmentType,
  IWeapon,
} from "./models/utils";

const sorTuzin = new Character(
  { id: "1", name: "sorTuzin", label: "ST", description: "Jogador" },
  ECharacterType.PLAYER
);

const javali = new NPC(
  { id: "2", name: "Javali", label: "JV", description: "Animal Selvagem" },
  ECharacterType.BOAR,
  {
    strategy: (next_action) => {
      return next_action.act(
        next_action.available_actions[0],
        next_action.combat_state.enemies[0]
      );
    },
  }
);
const sword: IWeapon = {
  id: "SWORD",
  name: "Espada",
  label: "EP",
  description: "Uma espada comum",
  type: EEquipmentType.WEAPON,
  available_actions: [
    {
      id: "SLASH",
      name: "Golpear",
      label: "GP",
      description: "Um corte violento",
      execute: damage(10),
      type: EActionType.PHYSICAL_ATTACK,
    },
  ],
};
sorTuzin.equip(sword);

const combat = new Combat([sorTuzin], [javali]);
let next = combat.next();
