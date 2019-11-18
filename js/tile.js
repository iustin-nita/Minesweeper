class Tile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.hasMine = false;
    this.danger = 0;
    this.currentState = "hidden";
  }

  // calculate danger for a tile
  calcDanger() {
    const currentDifficulty = difficulties[gameState.difficulty];

    for (let posx = this.x - 1; posx <= this.x + 1; posx++) {
      for (let posy = this.y - 1; posy <= this.y + 1; posy++) {
        // if it's the same tile or if it's out of bounds (width max/height max) => we do nothing
        if (posx == this.x && posy == this.y) {
          continue;
        }
        if (
          posx < 0 ||
          posx > currentDifficulty.width ||
          posy < 0 ||
          posy > currentDifficulty.height
        ) {
          continue;
        }

        // if it's a valid tile but not the tile we're calculating danger for itself, we check if the tile has a mine.
        // if so, we increase the danger level.
        let index = posy * cDiff.width + posx;
        if (grid[index].hasMine) {
          this.danger++;
        }
      }
    }
  }

  // mark a tile with a flag
  setFlag() {
    if (this.currentState == "hidden") {
      this.currentState = "flagged";
    } else if (this.currentState == "flagged") {
      this.currentState = "hidden";
    }
  }

  onClick() {
    if (this.currentState != "hidden") {
      return;
    }
    if (this.hasMine) {
      endGame();
    } else if (this.danger > 0) {
      this.currentState = "visible";
    } else {
      this.currentState = "visible";
      this.revealNeighbours();
    }
    checkState(); // check if the game is completed
  }

  revealNeighbours() {
    const currentDifficulty = difficulties[gameState.difficulty];

    for (let posx = this.x - 1; posx <= this.x + 1; posx++) {
      for (let posy = this.y - 1; posy <= this.y + 1; posy++) {
        // if it's the same tile or if it's out of bounds (width max/height max) => we do nothing
        if (posx == this.x && posy == this.y) {
          continue;
        }
        if (
          posx < 0 ||
          posx > currentDifficulty.width ||
          posy < 0 ||
          posy > currentDifficulty.height
        ) {
          continue;
        }

        // check if the current neighbour tile currentState is hidden.
        // if so, we set the currentState to visible,
        // and if it also has a danger level of 0 we also reveal its neighbours:
        let index = py * cDiff.width + px;
        if (grid[index].currentState == "hidden") {
          grid[index].currentState = "visible";
          if (grid[index].danger == 0) {
            grid[index].revealNeighbours();
          }
        }
      }
    }
  }
}
