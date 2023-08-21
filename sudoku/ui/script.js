async function myFetch(loc, body){
    try{
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
        return {error: await response.text()};
      }
    }catch(e){
      return {error: await 'Could not communicate with the server.  Is it running?', off: true}
    }
  }
    function regionSize(n) {
      let sn = Math.floor(Math.sqrt(n)) - 1;
      while (n % ++sn != 0 && sn < n) {}
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
      if (coordsEq(coords,selectedCoords)) {
        tdElt.classList.remove('selected');
        selectedCoords = undefined;
      }
      else {
        tdElt.classList.add('selected');
        if (selectedCoords) {
          const [r,c] = selectedCoords;
          boardTdElts[r][c].classList.remove('selected');
        }
        selectedCoords = coords;
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
          tdElt.style.width = `min(${80 / n}vh, ${80 / n}vw)`;
          tdElt.style.height = `min(${80 / n}vh, ${80 / n}vw)`;
          // to show the coordiantes on each cell:
          // tdElt.innerText = `${j*sh+k}_${p}`;
          const [r,c] = [j*sh+k, p];
          tdElt.addEventListener('click', () => toggleEltSelect(tdElt, [r,c]));
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
    myFetch('/victory_check', {board, checkCoords}).then(r => toggleVictory(r.victory === true));
  }
  
  document.addEventListener('keypress', async (ev) => {
    const key = ev.key;
    const v = parseInt(key);
    if (isNaN(v) || selectedCoords === undefined || v > N || v < 0) return;
    const [r,c] = selectedCoords;
    boardTdElts[r][c].innerText = v == 0 ? "" : v;
    board[r][c] = v;
    toggleEltSelect(boardTdElts[r][c], selectedCoords);
    await victoryCheck([r, c]);
  })
  
  function badUpload(reason) {
    console.log('bad');
  }
  
  const fileElt = document.getElementById('file-upload');
  let loadedBoard = undefined;
  fileElt.addEventListener('change', async (ev) => {
    // parse the JSON and load the level
    const reader = new FileReader();
    const file = ev.target.files[0];
  
    reader.addEventListener('load', ev => {
      // make a new board
      loadedBoard = JSON.parse(ev.target.result);
      if (!(loadedBoard instanceof Array)) return badUpload('json file must be a 2D array');
      const n = loadedBoard.length;
      // make sure all the values are numbers
      for (let r = 0; r < n; r++)
        for (let c = 0; c < n; c++)
          if (isNaN(loadedBoard[r][c])) return badUpload(`Bad element at r=${r},c=${c}`);
  
      useBoard();
    })
  
    reader.readAsText(file);
  })
  
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
  
  function isPerfectSquare(n){
      for (let i=0; i<=n/2; i++){
          if (Math.pow(i, 2) == n){
              return true;
          }
      }
      return false;
  }
  function myFunction(l){
  const lenInpElt = l;
  document.getElementById('create-btn').addEventListener('click', () => {
    const n = lenInpElt;
    try{
    if (isPerfectSquare(n)){
      makeBoard(n && n > 1 ? n : 9);
    }else{
      alert('board size must be a perfect square bigger than 1!');
    }
    }catch(e){
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
    if (solvedBoard === null){
      alert('could not solve this board!');
      stopLoading();
      return;
    }
    if (solvedBoard.error){
        if (solvedBoard.off === true){
          alert('could not communicate with the server!  is it running?');
        }else{
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
      $navLinks.forEach( el => {
        if(window.location.pathname == el.getAttribute("href")){
           el.className += " current";
        }
      })
    }
    });
