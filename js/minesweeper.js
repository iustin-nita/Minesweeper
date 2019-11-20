// import { difficulties } from "./config";
let ctx = null; //reference for the canvas
console.log("test");

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

const difficulties = {
  easy: {
    name: "Easy",
    width: 10,
    height: 10,
    mines: 10,
    bestTime: 0,
    menuBox: [0, 0]
  },
  medium: {
    name: "Medium",
    width: 12,
    height: 12,
    mines: 20,
    bestTime: 0,
    menuBox: [0, 0]
  },
  hard: {
    name: "Hard",
    width: 15,
    height: 15,
    mines: 50,
    bestTime: 0,
    menuBox: [0, 0]
  }
};

let checkState = () => {
  for (let i in grid) {
    // if there is at least one tile which is not visible, it means that the game is no finished
    if (grid[i].hasMine == false && grid[i].state != "visible") {
      return;
    }
    // else it means that the game is won
    else {
      gameState.timeTaken = gameTime;
      const currentDiff = difficulties[gameState.difficulty];

      if (currentDiff.bestTime == 0 || gameTime < currentDiff.bestTime) {
        gameState.newBest = true;
        currentDiff.bestTime = gameTime;
      }

      gameState.screen = "win";
    }
  }
};

let startLevel = diff => {
  gameState.newBest = false;
  gameState.timeTaken = 0;
  gameState.difficulty = diff;
  gameState.screen = "playing";

  gameTime = 0;
  lastFrameTime = 0;

  grid.length = 0;

  let gameCanvas = document.getElementById("game");
  let currentDifficulty = difficulties[diff];

  offsetX = Math.floor(
    (gameCanvas.width - currentDifficulty.width * gameState.tileW) / 2
  );

  offsetY = Math.floor(
    (gameCanvas.height - currentDifficulty.height * gameState.tileH) / 2
  );

  for (let posy = 0; posy < currentDifficulty.height; posy++) {
    for (let posx = 0; posx < currentDifficulty.width; posx++) {
      let index = posy * currentDifficulty.width + posx;
      grid.push(new Tile(posx, posy));
    }
  }
  let minesPlaced = 0;
  while (minesPlaced < currentDifficulty.mines) {
    // place random mines
    let index = Math.floor(Math.random() * grid.length);

    if (grid[index].hasMine) {
      continue;
    }

    grid[index].hasMine = true;
    minesPlaced++;
  }

  for (var i in grid) {
    grid[i].calcDanger();
  }
};

let gameOver = () => {
  gameState.screen = "lose";
};
