import { Character } from "../../internal";

export const living = (chars: Character[]) =>
  chars.filter((char) => char.current_hp > 0);

export const hostile =
  () => (targets: { allies: Character[]; enemies: Character[] }) => {
    return targets.enemies;
  };

export const friendly =
  () => (targets: { allies: Character[]; enemies: Character[] }) => {
    return targets.allies;
  };

export const dead =
  () => (targets: { allies: Character[]; enemies: Character[] }) => {
    return [...targets.allies, ...targets.enemies].filter(
      (char) => char.current_hp <= 0
    );
  };
