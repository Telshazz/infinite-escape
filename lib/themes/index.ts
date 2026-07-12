import type { Theme } from '../types';
import { atlantis } from './atlantis';
import { pirate } from './pirate';
import { zombie } from './zombie';
import { wonderland } from './wonderland';
import { space } from './space';
import { castle } from './castle';
import { corporate } from './corporate';

export const THEMES: Theme[] = [
  atlantis,
  pirate,
  zombie,
  wonderland,
  space,
  castle,
  corporate,
];

export const getTheme = (id: string): Theme =>
  THEMES.find((t) => t.id === id) ?? THEMES[0];

export const getThemeByName = (name: string): Theme =>
  THEMES.find((t) => t.name === name) ?? THEMES[0];
