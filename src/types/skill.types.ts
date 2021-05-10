export enum ESkillType {
  SWORDS = "SWORDS",
  SHIELDS = "SHIELDS",
  UNARMED = "UNARMED",
  SPELL_CASTING = "SPELL_CASTING",
}
export interface ISkill {
  type: ESkillType;
  level: number;
  xp: number;
}
