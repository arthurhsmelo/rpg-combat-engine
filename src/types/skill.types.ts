export enum ESkillType {
  SWORDS = "SWORDS",
  SHIELDS = "SHIELDS",
  UNARMED = "UNARMED",
}
export interface ISkill {
  type: ESkillType;
  level: number;
  xp: number;
}
