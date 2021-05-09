import { EActionType } from "../internal";

export interface Verbose {
  action_result_label: string;
  action_result_unit: string;
}
export const verbose: { [key in EActionType]: Verbose } = {
  [EActionType.PHYSICAL_ATTACK]: {
    action_result_label: "causando",
    action_result_unit: "de dano",
  },
  [EActionType.HEAL]: {
    action_result_label: "curando",
    action_result_unit: "de hp",
  },
  [EActionType.HELP]: {
    action_result_label: "aplicando",
    action_result_unit: "de hp",
  },
  [EActionType.USE_ITEM]: {
    action_result_label: "ZZZ",
    action_result_unit: "ZzZ",
  },
  [EActionType.NULL]: {
    action_result_label: "ZZZ",
    action_result_unit: "ZzZ",
  },
};
export const common_verbose = {
  uses: "usa",
  on: "em",
};
