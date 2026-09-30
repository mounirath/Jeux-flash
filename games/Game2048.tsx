import React, { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radius } from '../lib/theme';
import { Dir, useArrowKeys, useSwipe } from '../lib/input';
import { GameProps } from './types';

type Board = number[][];

const TILE_COLORS: Record<number, [string, string]> = {
  0: ['#1B1B3F', '#fff'],
  2: ['#3B3B75', '#fff'],
  4: ['#4F46A5', '#fff'],
  8: ['#7C3AED', '#fff'],
  16: ['#C026D3', '#fff'],
  32: ['#DB2777', '#fff'],
  64: ['#E11D48', '#fff'],
  128: ['#F97316', '#fff'],
  256: ['#F59E0B', '#fff'],
  512: ['#EAB308', '#1a1a1a'],
  1024: ['#84CC16', '#1a1a1a'],
  2048: ['#22D3EE', '#0A0A1F'],
};

const empty = (): Board => Array.from({ length: 4 }, () => [0, 0, 0, 0]);

function addTile(b: Board): Board {
  const cells: [number, number][] = [];
  b.forEach((row, r) => row.forEach((v, c) => v === 0 && cells.push([r, c])));
  if (!cells.length) return b;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  const nb = b.map((row) => [...row]);
  nb[r][c] = Math.random() < 0.9 ? 2 : 4;
  return nb;
}

function left(b: Board) {
  let gained = 0;
  const out = b.map((row) => {
    const t = row.filter(Boolean);
    const r: number[] = [];
    for (let i = 0; i < t.length; i++) {
      if (t[i] === t[i + 1]) {
        r.push(t[i] * 2);
        gained += t[i] * 2;
        i++;
      } else r.push(t[i]);
    }
    while (r.length < 4) r.push(0);
    return r;
  });
  return { board: out, gained };
}

const transpose = (b: Board): Board => b[0].map((_, c) => b.map((row) => row[c]));
const flip = (b: Board): Board => b.map((row) => [...row].reverse());

function move(b: Board, d: Dir) {
  if (d === 'left') return left(b);
  if (d === 'right') {
    const res = left(flip(b));
    return { board: flip(res.board), gained: res.gained };
  }
  if (d === 'up') {
    const res = left(transpose(b));
    return { board: transpose(res.board), gained: res.gained };
  }
  const res = left(flip(transpose(b)));
  return { board: transpose(flip(res.board)), gained: res.gained };
}

const same = (a: Board, b: Board) => a.every((row, r) => row.every((v, c) => v === b[r][c]));

const canMove = (b: Board) => (['left', 'right', 'up', 'down'] as Dir[]).some((d) => !same(b, move(b, d).board));

export default function Game2048({ onFinish }: GameProps) {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - 32, 400);
  const gap = 8;
  const tile = (boardSize - gap * 5) / 4;

  const [board, setBoard] = useState<Board>(() => addTile(addTile(empty())));
  const [score, setScore] = useState(0);
  const boardRef = useRef(board);
  const scoreRef = useRef(0);
  const done = useRef(false);

  const play = useCallback(
    (d: Dir) => {
      if (done.current) return;
      const res = move(boardRef.current, d);
      if (same(res.board, boardRef.current)) return;
      const nb = addTile(res.board);
      boardRef.current = nb;
      scoreRef.current += res.gained;
      setBoard(nb);
      setScore(scoreRef.current);
      if (!canMove(nb)) {
        done.current = true;
        const max = Math.max(...nb.flat());
        onFinish(scoreRef.current, `Meilleure tuile : ${max}`);
      }
    },
    [onFinish]
  );

  useArrowKeys(play);
  const pan = useSwipe(play, 24);

  const finishNow = () => {
    if (done.current) return;
    done.current = true;
    onFinish(scoreRef.current, `Meilleure tuile : ${Math.max(...boardRef.current.flat())}`);
  };

  const best = Math.max(...board.flat());

  return (
    <View style={styles.wrap} {...pan}>
      <View style={styles.hud}>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>SCORE</Text>
          <Text style={styles.hudValue}>{score}</Text>
        </View>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>TUILE MAX</Text>
          <Text style={styles.hudValue}>{best}</Text>
        </View>
      </View>

      <View style={[styles.board, { width: boardSize, height: boardSize, padding: gap / 2 }]}>
        {board.map((row, r) => (
          <View key={r} style={{ flexDirection: 'row' }}>
            {row.map((v, c) => {
              const [bg, fg] = TILE_COLORS[v] || ['#22D3EE', '#0A0A1F'];
              return (
                <View
                  key={c}
                  style={{
                    width: tile,
                    height: tile,
                    margin: gap / 2,
                    borderRadius: 10,
                    backgroundColor: bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {v > 0 && (
                    <Text
                      style={{
                        color: fg,
                        fontWeight: '900',
                        fontSize: v >= 1024 ? tile * 0.3 : v >= 128 ? tile * 0.36 : tile * 0.44,
                      }}
                    >
                      {v}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <Text style={styles.hint}>Glissez dans n’importe quelle direction</Text>
      <Pressable style={styles.endBtn} onPress={finishNow}>
        <Ionicons name="flag" size={16} color={colors.muted} />
        <Text style={styles.endText}>Terminer la partie</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', paddingTop: 8 },
  hud: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  hudItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hudLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  hudValue: { color: colors.text, fontSize: 22, fontWeight: '800' },
  board: {
    backgroundColor: '#0D0D29',
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.orange,
  },
  hint: { color: colors.muted, fontSize: 12, marginTop: 16 },
  endBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  endText: { color: colors.muted, fontWeight: '600' },
});
