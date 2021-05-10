import { IAction, IResistances, ISkill } from "../internal";

export interface IRecord {
  id: string;
  name: string;
  label: string;
  description: string;
}

export enum ECharacterType {
  PLAYER = "PLAYER",
  BOAR = "BOAR",
}

export interface ICharacterDefaultValues {
  base_hp: number;
  armor: number;
  available_actions: IAction[];
  skills: ISkill[];
  resistances: IResistances;
}
