export type Category = 'Arcade' | 'Réflexion' | 'Action' | 'Mémoire';

export const CATEGORIES: ('Tous' | Category)[] = ['Tous', 'Arcade', 'Réflexion', 'Action', 'Mémoire'];

export interface GameInfo {
  id: string;
  title: string;
  emoji: string;
  category: Category;
  description: string;
  howTo: string[];
  gradient: [string, string];
  duration: string;
  difficulty: 1 | 2 | 3;
  scoreLabel: string;
  topScore: number;
  plays: string;
}

export const GAMES: GameInfo[] = [
  {
    id: 'snake',
    title: 'Serpent Néon',
    emoji: '🐍',
    category: 'Arcade',
    description:
      "Le classique indémodable. Guidez votre serpent, avalez les pommes et évitez de vous mordre la queue. Plus vous mangez, plus ça accélère !",
    howTo: [
      'Glissez le doigt ou utilisez la croix directionnelle',
      'Sur ordinateur, utilisez les flèches du clavier',
      'Chaque pomme rapporte 10 points',
      'Les murs et votre corps sont mortels',
    ],
    gradient: ['#10B981', '#0E7490'],
    duration: '2-5 min',
    difficulty: 2,
    scoreLabel: 'points',
    topScore: 420,
    plays: '12,4 k',
  },
  {
    id: '2048',
    title: '2048 Flash',
    emoji: '🔢',
    category: 'Réflexion',
    description:
      'Fusionnez les tuiles identiques pour atteindre 2048. Simple à comprendre, difficile à maîtriser : chaque coup compte.',
    howTo: [
      'Glissez pour déplacer toutes les tuiles',
      'Deux tuiles identiques fusionnent en une seule',
      'Sur ordinateur, utilisez les flèches du clavier',
      'La partie se termine quand plus aucun coup n’est possible',
    ],
    gradient: ['#F59E0B', '#DC2626'],
    duration: '5-15 min',
    difficulty: 3,
    scoreLabel: 'points',
    topScore: 6800,
    plays: '9,1 k',
  },
  {
    id: 'memory',
    title: 'Memory Fruité',
    emoji: '🍓',
    category: 'Mémoire',
    description:
      'Retrouvez toutes les paires de fruits en un minimum de coups et de temps. Un excellent entraînement pour la mémoire visuelle.',
    howTo: [
      'Touchez deux cartes pour les retourner',
      'Si elles sont identiques, elles restent visibles',
      'Moins de coups et moins de temps = meilleur score',
    ],
    gradient: ['#EC4899', '#8B5CF6'],
    duration: '1-2 min',
    difficulty: 1,
    scoreLabel: 'points',
    topScore: 1350,
    plays: '7,7 k',
  },
  {
    id: 'mole',
    title: 'Tape-Taupe',
    emoji: '🐹',
    category: 'Action',
    description:
      'Les taupes sortent de terre, vous avez 30 secondes pour en attraper un maximum. Attention aux bombes et visez les taupes dorées !',
    howTo: [
      'Touchez les taupes dès qu’elles apparaissent (+10)',
      'La taupe dorée vaut +30',
      'Évitez les bombes : −20 points',
      'Le rythme s’accélère avec le temps',
    ],
    gradient: ['#A16207', '#EA580C'],
    duration: '30 s',
    difficulty: 2,
    scoreLabel: 'points',
    topScore: 380,
    plays: '8,3 k',
  },
  {
    id: 'reflex',
    title: 'Test de Réflexes',
    emoji: '⚡',
    category: 'Action',
    description:
      'Attendez que l’écran passe au vert puis touchez le plus vite possible. Cinq manches pour mesurer votre temps de réaction moyen.',
    howTo: [
      'Touchez l’écran pour lancer une manche',
      'Attendez qu’il devienne vert… sans anticiper !',
      'Touchez dès que vous voyez le vert',
      'Votre score dépend de votre moyenne sur 5 manches',
    ],
    gradient: ['#2563EB', '#22D3EE'],
    duration: '1 min',
    difficulty: 1,
    scoreLabel: 'points',
    topScore: 720,
    plays: '5,2 k',
  },
  {
    id: 'turbo',
    title: 'Turbo Clic',
    emoji: '🚀',
    category: 'Arcade',
    description:
      'Combien de fois pouvez-vous toucher le bouton en 10 secondes ? Un défi d’endurance pour vos doigts.',
    howTo: [
      'Touchez le bouton pour démarrer le chrono',
      'Tapez le plus vite possible pendant 10 secondes',
      'Chaque clic vaut 1 point',
    ],
    gradient: ['#F43F5E', '#FB923C'],
    duration: '10 s',
    difficulty: 1,
    scoreLabel: 'clics',
    topScore: 88,
    plays: '6,0 k',
  },
];

export const getGame = (id: string) => GAMES.find((g) => g.id === id) as GameInfo;

export const RIVALS = ['NovaKid', 'PixelQueen', 'Zorbax', 'LunaByte', 'MrTurbo'];

export function getLeaderboard(game: GameInfo, pseudo: string, best: number) {
  const ratios = [1, 0.84, 0.69, 0.52, 0.36];
  const rows = RIVALS.map((name, i) => ({
    name,
    score: Math.round(game.topScore * ratios[i]),
    me: false,
  }));
  if (best > 0) rows.push({ name: pseudo, score: best, me: true });
  rows.sort((a, b) => b.score - a.score);
  return rows.slice(0, 6).map((r, i) => ({ ...r, rank: i + 1 }));
}
