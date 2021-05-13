import {
  EActionType,
  ECharacterType,
  EDamageType,
  ESkillType,
  ICharacterDefaultValues,
  damage,
  hostile,
  Player,
  Character,
  action_creator,
  instanceOfItemWithActions,
  IChildAction,
  pipe,
  living,
} from "../internal";

export const default_char_values: {
  [key in ECharacterType]: ICharacterDefaultValues;
} = {
  BOAR: {
    base_hp: 50,
    armor: 0,
    available_actions: [
      {
        id: "BITE",
        name: "Morder",
        description: "Mordida feroz",
        label: "MD",
        execute: damage([{ type: EDamageType.BLUNT, value: 5 }]),
        get_available_targets: pipe(hostile(), living),
        type: EActionType.PHYSICAL_ATTACK,
      },
    ],
    skills: [],
    resistances: {},
  },
  PLAYER: {
    base_hp: 100,
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
        get_available_targets: pipe(hostile(), living),
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
        get_child_actions: (agent: Character) => {
          if (agent instanceof Player) {
            return (agent as Player).inventory.reduce<IChildAction[]>(
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
        get_available_targets: () => [],
        type: EActionType.USE_ITEM,
      }),
    ],
    skills: [],
    resistances: {},
  },
};
