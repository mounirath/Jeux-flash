import React from 'react';
import Snake from './Snake';
import Game2048 from './Game2048';
import Memory from './Memory';
import Mole from './Mole';
import Reflex from './Reflex';
import Turbo from './Turbo';
import { GameProps } from './types';

export const GAME_COMPONENTS: Record<string, React.ComponentType<GameProps>> = {
  snake: Snake,
  '2048': Game2048,
  memory: Memory,
  mole: Mole,
  reflex: Reflex,
  turbo: Turbo,
};
