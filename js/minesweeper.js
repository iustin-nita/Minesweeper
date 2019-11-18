let ctx = null; //reference for the canvas

let gameTime = 0, // elapsed time in ms
  lastFrameTime = 0; // time when last run

let currentSecond = 0, // framerate
  frameCount = 0,
  frameLastSecond = 0;

let offsetX = 0, // pos of the game grid
  offsetY = 0;

let grid = []; // tiles

// position of the cursor and check if clicked
let mouseState = {
  x: 0,
  y: 0,
  click: null
};

let gameState = {
  difficulty: "easy",
  screen: "menu",
  newBest: false,
  timeTaken: 0,
  // tiles dimensions
  tileW: 20,
  tileH: 20
};
