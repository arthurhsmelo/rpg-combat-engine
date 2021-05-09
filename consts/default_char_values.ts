import {
  EActionType,
  ECharacterType,
  EDamageType,
  ESkillType,
  ICharacterDefaultValues,
  damage,
  friendly,
  hostile,
  Player,
  Character,
  action_creator,
  instanceOfItemWithActions,
  IAction,
  IActionWithChild,
} from "../internal";
import { IChildAction } from "../models/utils";

export const default_char_values: {
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
        execute: damage([{ type: EDamageType.BLUNT, value: 10 }]),
        get_available_targets: hostile(),
        type: EActionType.PHYSICAL_ATTACK,
      },
    ],
    skills: [],
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
        execute: damage(
          [{ type: EDamageType.BLUNT, value: 3 }],
          ESkillType.UNARMED
        ),
        get_available_targets: hostile(),
        related_skill: ESkillType.UNARMED,
        type: EActionType.PHYSICAL_ATTACK,
      },
      action_creator({
        id: "USE_ITEM",
        name: "Inventário",
        description: "Abre o inventário",
        label: "IN",
        execute: () => {
          return true;
        },
        get_child_actions: (who: Character) => {
          if (who instanceof Player) {
            return (who as Player).inventory.reduce<IChildAction[]>(
              (actions, item) => {
                if (instanceOfItemWithActions(item)) {
                  return actions.concat(
                    item.available_actions.map((action) => ({
                      ...action,
                      parent_action_id: "USE_ITEM",
                      item,
                    }))
                  );
                } else {
                  return actions;
                }
              },
              []
            );
          } else {
            return [];
          }
        },
        get_available_targets: friendly(),
        type: EActionType.USE_ITEM,
      }),
    ],
    skills: [
      {
        type: ESkillType.UNARMED,
        level: 0,
        xp: 0,
      },
    ],
  },
};
