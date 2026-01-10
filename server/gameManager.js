export const rooms = {};

export function createRoom(roomId) {
  rooms[roomId] = {
    players: [],
    drawerIndex: 0,

    // game state
    word: null,
    started: false,
    turnActive: false, // ⭐ IMPORTANT
    roundOver: false, // ⭐ IMPORTANT
    roundReady: {}, // ⭐ IMPORTANT

    // settings
    customWords: [],
    roundTime: 60,
    totalRounds: 3,
    currentRound: 1,

    // scoring
    scores: {},

    // timers (server-controlled)
    _turnTimer: null,
    _revealTimeout: null,
    timeLeft: null,

    // word history
    usedWords: [],
  };
}

export function getNextDrawer(room) {
  room.drawerIndex = (room.drawerIndex + 1) % room.players.length;
  return room.players[room.drawerIndex];
}

export const WORDS = [
  "apple",
  "car",
  "tree",
  "phone",
  "dog",
  "house",
  "pizza",
  "river",
  "chair",
  "bottle",
  "laptop",
  "mountain",
  "train",
  "camera",
  "doctor",
  "bridge",
  "flower",
  "rocket",
  "banana",
  "window",
  "castle",
  "forest",
  "planet",
  "bottle",
  "laptop",
  "mountain",
  "train",
  "camera",
  "doctor",
  "bridge",
  "flower",
  "rocket",
  "banana",
  "window",
  "castle",
  "forest",
  "planet",
  "river",
  "island",
  "airplane",
  "school",
  "hospital",
  "beach",

  // Fun / Game-friendly
  "ghost",
  "pirate",
  "robot",
  "alien",
  "ninja",
  "wizard",
  "monster",
  "dragon",
  "zombie",
  "superhero",

  // Objects
  "key",
  "hammer",
  "ladder",
  "scissors",
  "backpack",
  "toothbrush",
  "umbrella",
  "camera",
  "remote",
  "guitar",

  // Nature
  "volcano",
  "waterfall",
  "rainbow",
  "cloud",
  "snowman",
  "tornado",
  "earthquake",
  "desert",
  "ocean",

  // Food
  "burger",
  "sandwich",
  "ice cream",
  "cake",
  "donut",
  "noodles",
  "taco",
  "cheese",
  "chocolate",

  // Actions (drawable)
  "running",
  "jumping",
  "sleeping",
  "swimming",
  "dancing",
  "singing",
  "reading",
  "cooking",
  "painting",
  "climbing",
];

export async function pickWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}
