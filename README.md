# rpg-combat-engine

Engine de combate criado para o meu RPG usando typescript.

As regras implementadas foram inspiradas em experiências prévias com o gênero *turn based rpg* e em regras presentes no *Player's Handbook*, livro de regras básicas da 5a edição do rpg de mesa *Dungeons & Dragons*.

## Classe Combat

A classe *Combat* implementa a maior parte da lógica deste sistema, é nela que o sistema de turnos, rounds e ações é controlado. Essa classe recebe dois grupos de *Character*, outra classe do sistema, que implementa as funcionalidades básicas de um personagem, seja ele um *Player* ou um *NPC*.

O método init da classe *Combat* retorna um generator, que pode ser iterado, para enviar a escolha de ação e alvo dos jogadores de volta para a classe *Combat*, turno por turno.

NPCs devem implementar um método *strategy* descrevendo a estratégia do personagem em cada turno, este método é chamado pela classe *Combat* e deve retornar uma ação e um alvo, para cada turno do NPC durante a batalha.

## Ações

Cada round é composto por x turnos, onde x é o número de participantes do combate, cada participante tem uma ação por turno (por enquanto, já que pretendo adicionar bônus actions e reactions). A classe *Combat* não implementa ações, mas sim as executa, de forma declarativa.

Em cada turno a classe *Combat* vai retornar as possíveis ações para o participante da vez e, uma vez que ele faça sua escolha, o método *execute* daquela ação será chamado, e os efeitos colaterais daquela ação, são implementados pela própria ação.

Como exemplo, uma ação básica de ataque, que causa 10 de dano ao alvo: 
```typescript
// action_creator ajuda na correta predição do tipo da ação
action_creator({
  id: "SLASH",
  name: "Golpear",
  label: "GP",
  description: "Um corte violento",
  execute: ({ target }) => target.receive_damage(10),
  get_available_targets: ({ hostile }) => hostile,
  related_skill: ESkillType.SWORDS,
  type: EActionType.PHYSICAL_ATTACK,
})
```

Esta ação implementa duas funções importantes, ```execute``` e
```get_available_targets``` que são chamadas pela classe *Combat* e pela interface que queira saber os alvos disponíveis para aquela ação, respectivamente (como visto no arquivo *cli.ts*).

Assim que o participante escolher esta ação, e um alvo válido, a classe *Combat* chamará a função ```execute```, e consequentemente, o alvo sofrerá o dano.

Esta forma declarativa dá a liberdade de criar ações muito diversas, e totalmente agnósticas à implementação da classe *Combat*, como a ação abaixo, que ao invés de simplesmente causar dano ao alvo, ela aplica um efeito ao mesmo. Falarei mais dos efeitos nas próximas seções.

```typescript
action_creator({
  id: "BLOCK",
  name: "Bloquear",
  label: "BQ",
  description: "Você levanta seu escudo para bloquear o próximo ataque",
  execute: ({ target, turn_state }) => {
    turn_state.apply_effect(blockingEffect(turn_state), target.id);
    return true;
  },
  get_available_targets: pipe(friendly(), living),
  related_skill: ESkillType.SHIELDS,
  type: EActionType.HELP,
})
```

Como várias ações terão métodos ```execute``` parecidos, podemos criar algumas funções que serão reutilizáveis em várias ações, como a função *heal* abaixo, que recebe um valor de cura e retorna uma função, que quando chamada, cura o alvo:

```typescript
const heal =
  (healing: number) => ({ target }: IExecuteParams) => {
    target.receive_healing(healing);
    return healing;
  };
```

Podemos inclusive, usar o conceito de *pipe* da programação funcional, para compor um *execute* com várias destas funções reutilizáveis, como visto abaixo, onde além de curar o alvo, o item "POTION" também será usado: 

```typescript
action_creator({
  id: "HEAL",
  name: "Curar",
  label: "PC",
  description: "Cura 10 pontos de vida",
  execute: pipe(use_item("POTION"), heal(10)),
  get_available_targets: pipe(friendly(), living),
  type: EActionType.HEAL,
})
```

## Efeitos
Como visto acima, podemos aplicar efeitos aos participantes usando o método *apply_effect* retornado pela classe *Combat*, estes também são totalmente declarativos e podemos criá-los como quisermos, como visto abaixo:

```typescript
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
```

Este efeito de casting é aplicado quando o participante usa um feitiço, e implementa um método chamado ```action_after_end``` que é chamado pela classe *Combat* quando o efeito acaba (após o número de rounds presentes na propriedade duration terem passado).

Isso nos permite criar efeitos muito mais complexos, como visto no arquivo *effects.ts*, no efeito *concentration_effect*, que verifica se o caster já está se concentrando em algum outro efeito, e se sim, remove o mesmo antes de aplicar o novo.

## Spells
Spells são tratados como ações para a classe *Combat*, e são executados da mesma maneira, mas algumas regras específicas foram criadas para adaptá-los ao modo de *turn-based*.

Spells tem algumas propriedades além das de uma action comum, são elas: 
- mana_cost, que representa quanto de mana será usado para usar esse spell
- casting_time, que representa quantos turnos o participante ficará com o efeito de casting aplicado nele, não permitindo nenhuma outra ação.
- after_cast, que é uma função, tal como a ```execute``` implementando os efeitos colaterais deste spell, como causar dano ou aplicar um efeito em outro participante.
- components, que é um array podendo conter os componentes VERBAL, SOMATIC e MATERIAL, representando quais componentes são necesários para usar este feitiço, ~~feitiços com componente VERBAL não podem ser usados se o caster estiver silenciado, feitiços com componente SOMATIC não podem ser usados se o caster estiver preso de alguma forma~~ (WIP - Roadmap Conditions), feitiços com componente MATERIAL, exigem que o caster possua aqueles materiais em seu inventário, e são consumidos no uso.

## Mecânicas de Block e Damage 
Apesar de como dito acima, as ações implementarem suas próprias formas de computarem os danos e efeitos, algumas regras e fórmulas foram usadas na execution de damage, que é usada em qualquer situação em que o alvo sofrer algum ataque.

O dano causado segue a seguinte pipeline:

1 - Random + Skil: Um valor aletório, entre ```0.25 e 0.55 somado a 0.006 * (nível da skill relacionada)```

2 - Stagger Bonus: Duplicado o dano se o alvo estiver em efeito de STAGGERED. 

3 - Damage Type Bonus: Multiplica o dano pelo multiplicador de resistência ao tipo de dano
  
  - VERY_WEAK - 2 
  - WEAK - 1.5 
  - NEUTRAL - 1 
  - STRONG - 0.5 
  - VERY_STRONG - 0.25 
  - IMMUNE - 0 

4 - Blocking Penalty: Se o alvo estiver em efeito de BLOCKING, uma parte do dano é absorvido:
  - O valor absorvido é calculado através da fórmula: ```block_power * (1 + 0.005 * (nível da blocking skill))```
  - Se o dano for menor ou igual a duas vezes o valor absorvido, quem está bloqueando tem chance de acertar um parry, gerando um efeito de STAGGERED no alvo e absorvendo todo o dano.

    - A chance de parry é calculada através da fórmula ```random_between(0.009 * (nível da blocking skill), 1)```
  - Se o dano for 4 vezes maior que o valor absorvido, quem está atacando aplica STAGGERED em quem está bloqueando
# Roadmap

Roadmap
- [x] DamageType and resistances/weaknesses
- [x] DoT
- [x] Spells
- [x] Block during casting
- [x] Concentration
- [x] Override tick damage
- [ ] Conditions
- [ ] Ação de Stealth com backstab bonus (Usando passive perception, terrain.hiding_multiplier, e facing_direction )
- [ ] Perks (como bomba de fumaça pra stealth altos, duplo hit pra unarmed)
- [ ] Bonus action & Reactions **
- [ ] Multitarget **

** Big refactor


