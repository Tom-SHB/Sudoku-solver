async function myFetch(loc, body) {
  try {
    const response = await fetch(loc, {
      method: 'POST',
      cache: 'no-cache',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (response.ok) {
      return await response.json();
    } else {
      return { error: await response.text() };
    }
  } catch (e) {
    return { error: await 'Could not communicate with the server.  Is it running?', off: true }
  }
}
function regionSize(n) {
  let sn = Math.floor(Math.sqrt(n)) - 1;
  while (n % ++sn != 0 && sn < n) { }
  return [n / sn, sn];
}
let selectedCoords = undefined;
let board;
let boardTdElts;
let N;

function coordsEq(c1, c2) {
  return c1 && c2 && c1[0] == c2[0] && c1[1] == c2[1];
}

function toggleEltSelect(tdElt, coords) {
  if (coordsEq(coords, selectedCoords)) {
    tdElt.classList.remove('selected');
    selectedCoords = undefined;
  } else {
    tdElt.classList.add('selected');
    if (selectedCoords) {
      const [r, c] = selectedCoords;
      boardTdElts[r][c].classList.remove('selected');
    }
    selectedCoords = coords;
  }

  // Проверка, если в клетке уже есть цифра, подсветить красным
  const [row, col] = coords;
  if (board[row][col] !== 0) {
    tdElt.classList.add('filled');
  } 
  else {
    // Если цифры нет, убрать подсветку
    tdElt.classList.remove('filled');
  }
}


function makeBoard(n) {
  console.log('making board');
  console.log(n);
  const boardElt = document.getElementById('board');
  // clear the board
  boardElt.innerHTML = "";
  const [sw, sh] = regionSize(n);
  N = n;

  // create the vertical borders for the regions
  for (let j = 0; j < n / sw; j++) {
    const colgroupElt = document.createElement('colgroup');
    boardElt.appendChild(colgroupElt);
    for (let k = 0; k < sw; k++) {
      const colElt = document.createElement('col');
      colgroupElt.appendChild(colElt);
    }
  }
  console.log('borders made');

  // create the js rep for the board
  boardTdElts = [];
  board = []
  for (let i = 0; i < n; i++) {
    board.push([]);
    boardTdElts.push([]);
    for (let j = 0; j < n; j++) {
      board[i].push(0);
      boardTdElts[i].push(undefined);
    }
  }


  // create the horizontal borders for the regions
  // and fill the board
  for (let j = 0; j < n / sh; j++) {
    const tbodyElt = document.createElement('tbody');
    boardElt.appendChild(tbodyElt);
    for (let k = 0; k < sh; k++) {
      const trElt = document.createElement('tr');
      tbodyElt.appendChild(trElt);
      for (let p = 0; p < n; p++) {
        const tdElt = document.createElement('td');
        tdElt.style.width = `min(${30 / n}vh, ${30 / n}vw)`;
        tdElt.style.height = `min(${30 / n}vh, ${30 / n}vw)`;
        // to show the coordiantes on each cell:
        // tdElt.innerText = `${j*sh+k}_${p}`;
        const [r, c] = [j * sh + k, p];
        tdElt.addEventListener('click', () => toggleEltSelect(tdElt, [r, c]));
        trElt.appendChild(tdElt);
        boardTdElts[r][c] = tdElt;
      }
    }
  }
}


const victoryElt = document.getElementById('victory')

function toggleVictory(val) {
  victoryElt.style.display = (val) ? "block" : "none"
}

async function victoryCheck(checkCoords) {
  myFetch('/victory_check', { board, checkCoords }).then(r => toggleVictory(r.victory === true));
}

document.addEventListener('keypress', async (ev) => {
  const key = ev.key;
  const v = parseInt(key);
  if (isNaN(v) || selectedCoords === undefined || v > N || v < 0) return;
  const [r, c] = selectedCoords;
  boardTdElts[r][c].innerText = v == 0 ? "" : v;
  board[r][c] = v;
  toggleEltSelect(boardTdElts[r][c], selectedCoords);
  await victoryCheck([r, c]);
})

function badUpload(reason) {
  console.log('bad');
}



// uses `loadedBoard` by default
function useBoard(newBoard) {
  if (newBoard === undefined)
    newBoard = loadedBoard;
  if (!newBoard) return;
  const n = newBoard.length;
  makeBoard(n);
  // fill the board with the loaded values
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const v = newBoard[r][c];
      board[r][c] = v;
      boardTdElts[r][c].innerText = v ? v : "";
    }
  // do a victory check
  victoryCheck();
}
document.getElementById('load-btn').addEventListener('click', useBoard);

function isPerfectSquare(n) {
  for (let i = 0; i <= n / 2; i++) {
    if (Math.pow(i, 2) == n) {
      return true;
    }
  }
  return false;
}
function myFunction(l) {

  const lenInpElt = l;
  document.getElementById('create-btn').addEventListener('click', () => {
    const n = lenInpElt;
    try {
      if (isPerfectSquare(n)) {
        makeBoard(n && n > 1 ? n : 9);
      } else {
        alert('board size must be a perfect square bigger than 1!');
      }
    } catch (e) {
      makeBoard(9);
    }
    toggleVictory(false);


  });
}

function startLoading() {
  document.getElementById('loadingContainer').style.display = "flex";
}

function stopLoading() {
  document.getElementById('loadingContainer').style.display = "none";
}

async function runSolver() {
  startLoading();
  const solvedBoard = await myFetch('/solve', board);
  console.log('solved', solvedBoard);
  if (solvedBoard === null) {
    alert('Ձեր մուտքագրաժ թվերը սխալ են');
    stopLoading();
    return;
  }
  if (solvedBoard.error) {
    if (solvedBoard.off === true) {
      alert('could not communicate with the server!  is it running?');
    } else {
      alert('an error occurred!  please check the terminal for more information');
    }
  }
  stopLoading();
  useBoard(solvedBoard);
}

document.getElementById('solve-btn').addEventListener('click', runSolver);

makeBoard(9);
stopLoading();

//Navbar   
document.addEventListener('DOMContentLoaded', () => {
  const $navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'), 0);

  if ($navLinks.length > 0) {
    $navLinks.forEach(el => {
      if (window.location.pathname == el.getAttribute("href")) {
        el.className += " current";
      }
    })
  }
});




class Sudoku {
  constructor(N, K) {
    this.N = N;
    this.K = K;
    this.SRN = Math.floor(Math.sqrt(N));
    this.mat = Array.from({ length: N }, () => Array.from({ length: N }, () => 0));
  }

  fillValues() {
    this.fillDiagonal();
    this.fillRemaining(0, this.SRN);
    this.removeKDigits();
  }

  fillDiagonal() {
    for (let i = 0; i < this.N; i += this.SRN) {
      this.fillBox(i, i);
    }
  }

  unUsedInBox(rowStart, colStart, num) {
    for (let i = 0; i < this.SRN; i++) {
      for (let j = 0; j < this.SRN; j++) {
        if (this.mat[rowStart + i][colStart + j] === num) {
          return false;
        }
      }
    }
    return true;
  }

  fillBox(row, col) {
    let num = 0;
    for (let i = 0; i < this.SRN; i++) {
      for (let j = 0; j < this.SRN; j++) {
        while (true) {
          num = this.randomGenerator(this.N);
          if (this.unUsedInBox(row, col, num)) {
            break;
          }
        }
        this.mat[row + i][col + j] = num;
      }
    }
  }

  randomGenerator(num) {
    return Math.floor(Math.random() * num + 1);
  }

  checkIfSafe(i, j, num) {
    return (
      this.unUsedInRow(i, num) &&
      this.unUsedInCol(j, num) &&
      this.unUsedInBox(i - (i % this.SRN), j - (j % this.SRN), num)
    );
  }

  unUsedInRow(i, num) {
    for (let j = 0; j < this.N; j++) {
      if (this.mat[i][j] === num) {
        return false;
      }
    }
    return true;
  }

  unUsedInCol(j, num) {
    for (let i = 0; i < this.N; i++) {
      if (this.mat[i][j] === num) {
        return false;
      }
    }
    return true;
  }

  fillRemaining(i, j) {
    if (i === this.N - 1 && j === this.N) {
      return true;
    }
    if (j === this.N) {
      i += 1;
      j = 0;
    }
    if (this.mat[i][j] !== 0) {
      return this.fillRemaining(i, j + 1);
    }
    for (let num = 1; num <= this.N; num++) {
      if (this.checkIfSafe(i, j, num)) {
        this.mat[i][j] = num;
        if (this.fillRemaining(i, j + 1)) {
          return true;
        }
        this.mat[i][j] = 0;
      }
    }
    return false;
  }

  printSudoku() {
    for (let i = 0; i < this.N; i++) {
      console.log(this.mat[i].join(" "));
    }
  }

  removeKDigits() {
    let count = this.K;
    while (count !== 0) {
      let i = Math.floor(Math.random() * this.N);
      let j = Math.floor(Math.random() * this.N);
      if (this.mat[i][j] !== 0) {
        count--;
        this.mat[i][j] = 0;
      }
    }
    return;
  }

  getBoardObject() {
    return  this.mat
  }

  saveBoardToJson() {
    const boardObject = this.getBoardObject();
    const jsonString = JSON.stringify(boardObject, null, 2);

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sudoku_board.json';
    a.click();
  }
}


function generate(n) {
  let N = 9;
  let K = n; 
  let sudoku = new Sudoku(N, K);
  sudoku.fillValues();
  sudoku.printSudoku();
  // sudoku.saveBoardToJson();
  let board = sudoku.getBoardObject()
  useBoard(board)
}

