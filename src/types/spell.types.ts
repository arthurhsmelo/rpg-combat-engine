import {
  ActionResult,
  EActionType,
  ESkillType,
  IBaseAction,
  IExecuteParams,
} from "../internal";

export enum ESpellComponent {
  VERBAL = "VERBAL",
  SOMATIC = "SOMATIC",
  MATERIAL = "MATERIAL",
}

export interface ISpell extends IBaseAction<EActionType.SPELL> {
  type: EActionType.SPELL;
  related_skill: ESkillType.SPELL_CASTING;
  mana_cost: number;
  casting_time: number;
  after_cast: (args: IExecuteParams) => ActionResult<EActionType.SPELL>;
  components: ESpellComponent[];
}

export interface IMaterial {
  item_id: string;
  quantity: number;
}
export interface ISpellWithMaterial extends ISpell {
  required_materials: IMaterial[];
}

export const instanceOfSpellWithMaterial = (
  object: Object
): object is ISpellWithMaterial => object.hasOwnProperty("required_materials");
