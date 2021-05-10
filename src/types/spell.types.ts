import {
  ActionResult,
  EActionType,
  ESkillType,
  fire_damage,
  IBaseAction,
  IExecuteParams,
  use_spell,
} from "../internal";
import { hostile } from "../utils/targets/targets";

export enum ESpellComponent {
  VERBAL = "VERBAL",
  SOMATIC = "SOMATIC",
  MATERIAL = "MATERIAL",
}

export interface ISpell extends IBaseAction<EActionType.SPELL> {
  type: EActionType.SPELL;
  related_skill?: ESkillType.SPELL_CASTING;
  mana_cost: number;
  casting_time: number;
  after_cast: (args: IExecuteParams) => ActionResult<EActionType.SPELL>;
  components: ESpellComponent[];
}

type MaterialID = string;
export interface ISpellWithMaterial extends ISpell {
  required_materials: MaterialID[];
}
