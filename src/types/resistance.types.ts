import { EDamageType } from "../internal";

export enum EResistanceMultipler {
  VERY_WEAK = 2,
  WEAK = 1.5,
  NEUTRAL = 1,
  STRONG = 0.5,
  VERY_STRONG = 0.25,
  IMMUNE = 0,
}

export type IResistances = {
  [damage_type in EDamageType]?: EResistanceMultipler;
};
