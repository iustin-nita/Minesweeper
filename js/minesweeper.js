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
  click: null // [x,y, button] button = left/right mouse click
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
      grid.push(new Tile(posx, posy, currentDifficulty));
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

  for (let i in grid) {
    grid[i].calcDanger();
  }
};

let gameOver = () => {
  gameState.screen = "lose";
};

let updateGame = () => {
  if (gameState.screen == "menu") {
    //select difficulty in the menu
    if (mouseState.click != null) {
      for (let i in difficulties) {
        if (
          mouseState.y >= difficulties[i].menuBox[0] &&
          mouseState.y <= difficulties[i].menuBox[1]
        ) {
          startLevel(i);
          break;
        }
      }
      mouseState.click = null;
    }
  } else if (gameState.screen == "win " || gameState.screen == "lost") {
    if (mouseState.click != null) {
      gameState.screen = "menu";
      mouseState.click = null;
    }
  }
  // otherwise we are playing
  else {
    if (mouseState.click != null) {
      let cDiff = difficulties[gameState.difficulty];
      if (
        mouseState.click[0] > offsetX &&
        mouseState.click[0] < offsetX + cDiff.width * gameState.tileW &&
        mouseState.click[1] > offsetY &&
        mouseState.click[1] < offsetY + cDiff.height * gameState.tileH
      ) {
        const tile = [
          Math.floor((mouseState.click[0] - offsetX) / gameState.tileW),
          Math.floor((mouseState.click[1] - offsetY) / gameState.tileH)
        ];
        if (mouseState.click[2] == 1) {
          grid[tile[1] * cDiff.width + tile[0]].onClick();
        } else {
          grid[tile[1] * cDiff.width + tile[0]].setFlag();
        }

        // else is not on the grid
      } else if (mouseState.click[1] >= 380) {
        gameState.screen = "menu";
      }
      mouseState.click = null;
    }
  }
};

let drawMenu = () => {
  ctx.textAlign = "center";
  ctx.font = "bold 20pt sans-serif";
  ctx.fillStyle = "#000000";

  let y = 100;

  for (let d in difficulties) {
    let mouseOver = mouseState.y >= y - 20 && mouseState.y <= y + 10;

    if (mouseOver) {
      ctx.fillStyle = "#000099";
    }

    difficulties[d].menuBox = [y - 20, y + 10];
    ctx.fillText(difficulties[d].name, 150, y);
    y += 80;

    if (mouseOver) {
      ctx.fillStyle = "#000000";
    }
  }

  for (let d in difficulties) {
    if (difficulties[d].bestTime == 0) {
      ctx.fillText("No best time", 150, y);
    } else {
      let t = difficulties[d].bestTime;
      let bestTime = "";
      if (t / 1000 >= 60) {
        bestTime = Math.floor(t / 1000 / 60) + ":";
        t = t % 60000;
      }
      bestTime += Math.floor(t / 1000) + "." + (t % 1000);
      ctx.fillText("Best time   " + bestTime, 150, y);
    }
    y += 80;
  }
};

let drawPlaying = () => {
  let halfW = gameState.tileW / 2;
  let halfH = gameState.tileH / 2;

  let cDiff = difficulties[gameState.difficulty];

  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";

  ctx.fillStyle = "#000000";
  ctx.font = "12px sans-serif";
  ctx.fillText(cDiff.name, 150, 20);

  ctx.fillText("Return to menu", 150, 390);
  if (gameState.screen != "lost") {
    ctx.textAlign = "left";
    ctx.fillText("Mines: " + cDiff.mines, 10, 40);
    let whichT = gameState.screen == "won" ? gameState.timeTaken : gameTime;
    let t = "";
    if (gameTime / 1000 > 60) {
      t = Math.floor(whichT / 1000 / 60) + ":";
    }
    let s = Math.floor((whichT / 1000) % 60);
    t += s > 9 ? s : "0" + s;

    ctx.textAlign = "right";
    ctx.fillText("Time: " + t, 290, 40);
  }

  if (gameState.screen == "lost" || gameState.screen == "won") {
    ctx.textAlign = "center";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(
      gameState.screen == "lost" ? "Game Over" : "Cleared!",
      150,
      offsetY - 15
    );
  }

  ctx.strokeStyle = "#999999";
  ctx.strokeRect(
    offsetX,
    offsetY,
    cDiff.width * gameState.tileW,
    cDiff.height * gameState.tileH
  );

  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i in grid) {
    let px = offsetX + grid[i].x * gameState.tileW;
    let py = offsetY + grid[i].y * gameState.tileH;
    if (gameState.screen == "lost" && grid[i].hasMine) {
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(px, py, gameState.tileW, gameState.tileH);
      ctx.fillStyle = "#000000";
      ctx.fillText("x", px + halfW, py + halfH);
    } else if (grid[i].currentState == "visible") {
      ctx.fillStyle = "#dddddd";

      if (grid[i].danger) {
        ctx.fillStyle = "#000000";
        ctx.fillText(grid[i].danger, px + halfW, py + halfH);
      }
    } else {
      ctx.fillStyle = "#cccccc";
      ctx.fillRect(px, py, gameState.tileW, gameState.tileH);
      ctx.strokeRect(px, py, gameState.tileW, gameState.tileH);

      if (grid[i].currentState == "flagged") {
        ctx.fillStyle = "#0000cc";
        ctx.fillText("P", px + halfW, py + halfH);
      }
    }
  }
};

let drawGame = () => {
  if (ctx == null) {
    return;
  }

  // Frame & update related timing
  let currentFrameTime = Date.now();
  if (lastFrameTime == 0) {
    lastFrameTime = currentFrameTime;
  }
  let timeElapsed = currentFrameTime - lastFrameTime;
  gameTime += timeElapsed;

  updateGame();

  let sec = Math.floor(Date.now() / 1000);
  if (sec != currentSecond) {
    currentSecond = sec;
    framesLastSecond = frameCount;
    frameCount = 1;
  } else {
    frameCount++;
  }

  ctx.fillStyle = "#ddddee";
  ctx.fillRect(0, 0, 300, 400);

  if (gameState.screen == "menu") {
    drawMenu();
  } else {
    drawPlaying();
  }

  ctx.textAlign = "left";
  ctx.font = "10pt sans-serif";
  ctx.fillStyle = "#000000";
  ctx.fillText("Frames: " + framesLastSecond, 5, 15);
  lastFrameTime = currentFrameTime;

  requestAnimationFrame(drawGame);
};

let realPos = (x, y) => {
  let p = document.getElementById("game");

  do {
    x -= p.offsetLeft;
    y -= p.offsetTop;

    p = p.offsetParent;
  } while (p != null);

  return [x, y];
};

window.onload = function() {
  ctx = document.getElementById("game").getContext("2d");
  document.getElementById("game").addEventListener("click", e => {
    let pos = realPos(e.pageX, e.pageY);
    mouseState.click = [pos[0], pos[1], 1];
  });
  document.getElementById("game").addEventListener("mousemove", e => {
    let pos = realPos(e.pageX, e.pageY);
    mouseState.x = pos[0];
    mouseState.y = pos[1];
  });
  document.getElementById("game").addEventListener("contextmenu", e => {
    e.preventDefault();
    let pos = realPos(e.pageX, e.pageY);
    mouseState.click = [pos[0], pos[1], 2];
    return false;
  });

  requestAnimationFrame(drawGame);
};
