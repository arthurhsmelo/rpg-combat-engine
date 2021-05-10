import { Character } from "../../internal";

export const hostile = () => (targets: {
  allies: Character[];
  enemies: Character[];
}) => {
  return targets.enemies;
};

export const friendly = () => (targets: {
  allies: Character[];
  enemies: Character[];
}) => {
  return targets.allies;
};
