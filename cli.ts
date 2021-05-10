import * as prompts from "prompts";
import {
  heal,
  Character,
  Combat,
  NPC,
  TurnState,
  damage,
  friendly,
  hostile,
  action_creator,
  EActionType,
  ECharacterType,
  EDamageType,
  EEquipmentType,
  ESkillType,
  IAction,
  IShield,
  IWeapon,
  blockingEffect,
  Player,
  EItemType,
  IPotion,
  use_item,
  fire_damage,
  pipe,
} from "./src/internal";

const sorTuzin = new Player({
  id: "1",
  name: "sorTuzin",
  label: "ST",
  description: "Jogador",
});

const javali = new NPC(
  { id: "2", name: "Javali", label: "JV", description: "Animal Selvagem" },
  ECharacterType.BOAR,
  {
    strategy: ({ available_actions, enemies }) => {
      return {
        action: available_actions[0],
        target: enemies[0],
      };
    },
  }
);
const sword: IWeapon = {
  id: "SWORD",
  name: "Espada",
  label: "EP",
  description: "Uma espada comum",
  type: EEquipmentType.WEAPON,
  related_skill: ESkillType.SWORDS,
  listed_damages: [
    {
      type: EDamageType.SLASH,
      value: 10,
    },
    {
      type: EDamageType.BLUNT,
      value: 5,
    },
  ],
  get available_actions() {
    return [
      action_creator({
        id: "SLASH",
        name: "Golpear",
        label: "GP",
        description: "Um corte violento",
        execute: damage(this.listed_damages, this.related_skill),
        get_available_targets: hostile(),
        related_skill: ESkillType.SWORDS,
        type: EActionType.PHYSICAL_ATTACK,
      }),
    ];
  },
};
const shield: IShield = {
  id: "SHIELD",
  name: "Escudo",
  label: "EC",
  description: "Um escudo comum",
  type: EEquipmentType.SHIELD,
  related_skill: ESkillType.SHIELDS,
  block_power: 5,
  available_actions: [
    action_creator({
      id: "BLOCK",
      name: "Bloquear",
      label: "BQ",
      description: "Você levanta seu escudo para bloquear o próximo ataque",
      execute: ({ target, turn_state }) => {
        turn_state.applyEffect(blockingEffect(turn_state), target);
        return true;
      },
      get_available_targets: friendly(),
      related_skill: ESkillType.SHIELDS,
      type: EActionType.HELP,
    }),
  ],
};
const healing_potion: IPotion = {
  id: "POTION",
  name: "Poção de cura",
  label: "PC",
  description: "Um frasco com um líquido vermelho",
  type: EItemType.POTION,
  available_actions: [
    action_creator({
      id: "HEAL",
      name: "Curar",
      label: "PC",
      description: "Cura 10 pontos de vida",
      execute: pipe(use_item("POTION"), heal(10)),
      get_available_targets: friendly(),
      type: EActionType.HEAL,
    }),
  ],
};
const molotov: IPotion = {
  id: "MOLOTOV",
  name: "Molotov",
  label: "MV",
  description: "Uma garrafa em chamas",
  type: EItemType.POTION,
  available_actions: [
    action_creator({
      id: "FIRE",
      name: "Incendiar",
      label: "IC",
      description: "Aplica 3 de dano de fogo por turno, por 3 turnos",
      execute: pipe(
        use_item("MOLOTOV"),
        fire_damage({ type: EDamageType.FIRE, value: 10 })
      ),
      get_available_targets: hostile(),
      type: EActionType.DOT,
    }),
  ],
};

sorTuzin.equip(sword);
sorTuzin.equip(shield);
sorTuzin.add_item_to_inventory(healing_potion);
sorTuzin.add_item_to_inventory(molotov, 2);

(async () => {
  const { combat, first_round } = new Combat([sorTuzin], [javali]).init();
  let round = first_round;
  let combat_done = round.done;
  do {
    if (!round.done) {
      const {
        who,
        available_actions,
        allies,
        enemies,
        active_effects,
      } = round.value as TurnState;

      console.log(`\n${who.name}\n`);
      if (active_effects.length) {
        console.log(`\nActive Effects:\n`);
        console.log(
          `${active_effects.map(
            (effect) =>
              `- ${
                [...allies, ...enemies].find((c) => c.id === effect.char_id)
                  ?.name
              }: ${effect.type} - ${
                effect.remaining_turns / (allies.length + enemies.length)
              }\n`
          )}`
        );
      }
      let action, chosen;
      do {
        ({ action } = (await prompts({
          type: "select",
          name: "action",
          message: "Escolha uma ação",
          choices: available_actions.map((action) => ({
            title: action.name,
            description: action.description,
            value: action,
          })),
        })) as { action: IAction });
        if ((action as IAction<EActionType.USE_ITEM>).get_child_actions) {
          const child_actions = (action as IAction<EActionType.USE_ITEM>).get_child_actions(
            who
          );
          ({ action } = (await prompts({
            type: "select",
            name: "action",
            message: "Escolha uma ação",
            choices: child_actions
              .map((action) => ({
                title: `${action.item.name} (${action.name})`,
                description: `${action.item.description} (${action.description})`,
                value: action,
              }))
              .concat({
                title: "Voltar",
                description: "Fecha o inventário",
                value: {
                  go_back: true,
                } as any,
              }),
          })) as { action: IAction });
        }
        if ((action as any).go_back) {
          chosen = false;
        } else {
          chosen = true;
        }
      } while (!chosen);
      const targets = action
        .get_available_targets({ allies, enemies })
        .map((target) => ({
          title: target.name,
          description: target.description,
          value: target,
        }));
      if (targets.length) {
        const { target } = (await prompts({
          type: "select",
          name: "target",
          message: "Escolha uma alvo",
          choices: targets,
        })) as { target: Character };
        round = combat.next({ action, target });
      } else {
        round = combat.next({ action, target: undefined });
      }
    }
    combat_done = round.done;
  } while (!combat_done);
  console.log(sorTuzin);
})();
