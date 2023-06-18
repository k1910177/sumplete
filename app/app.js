let examplegrid = document.getElementById("winning-sumplete-example-grid");
examplegrid.style.height = examplegrid.offsetWidth + "px";

let examplerow1 = document.getElementById("example-row-1");
examplerow1.style.height = examplerow1.offsetWidth / 4 + "px";

let examplerow2 = document.getElementById("example-row-2");
examplerow2.style.height = examplerow2.offsetWidth / 4 + "px";

let examplenumbers = document.querySelectorAll(".example-numbers .number");
for (let i = 0; i < examplenumbers.length; i++) {
  examplenumbers[i].style.height = examplenumbers[i].offsetWidth + "px";
}

const puzzles = {
  3: [100000],
  4: [100000],
  5: [100000],
  6: [100000, 53100],
  7: [100000, 100000, 4100, 100000],
  8: [100000, 100000, 100000, 100000],
  9: [43000, 100000, 100000, 46900, 100000],
};
const levels = ["easy", "medium", "hard", "expert", "master"];

gridsize = 4;
numbersize = gridsize - 1;
document.getElementById("size").value = numbersize;
sizechanged();

const loadgame = document.getElementById("loadgame");
let undoStack = Array();
let existing = false;

if (localStorage.getItem("loadgame") !== null) {
  loadgame.innerHTML = localStorage
    .getItem("loadgame")
    .replace(/<style[^>]*>[^<]*<\/style>/g, "");
  let gridElement = document.getElementById("grid");
  if (gridElement == null || gridElement.childNodes.length < 4) {
    generate(3, 1);
  } else {
    let newClasses = loadgame.getElementsByClassName("new");
    if (newClasses.length > 0) {
      newClasses[0].parentNode.removeChild(newClasses[0]);
    }
  }

  let controlClasses = document.getElementsByClassName("controls");
  let completeClasses = document.getElementsByClassName("complete");
  let revealedClasses = document.getElementsByClassName("revealed");
  if (
    controlClasses.length == 0 ||
    controlClasses[0].getElementsByTagName("button").length < 6 ||
    completeClasses.length == 0 ||
    revealedClasses.length == 0 ||
    loadgame.innerHTML.indexOf("Errors") != -1
  ) {
    loadgame.innerHTML =
      gridElement.outerHTML +
      '<div class="controls"><button id="mistakes">Check</button> <button id="hint">Hint</button> <button id="restart">Clear</button> <button id="reveal">Reveal</button> <button id="undo" disabled>Undo</button> <button id="remove" class="hidden">Remove Mistakes</button> </div> <h2 class="complete hidden">Puzzle solved! Well done</h2> <h2 class="revealed hidden">Better luck next time!</h2>';
  }

  document.getElementById("undo").disabled = true;

  numbersize = document.querySelectorAll("#grid .hanswer").length;
  gridsize = numbersize + 1;
  document.getElementById("size").value = numbersize;
  document.getElementById("grid").setAttribute("data-size", numbersize);
  sizechanged();
  if (document.getElementById("savedlevel") != null) {
    document.getElementById("level").value =
      document.getElementById("savedlevel").value;
  }
  if (numbersize > 5) {
    document.getElementById("instructions").classList.add("hidden");
    document.body.classList.add("hide-instructions");
  }

  let puzzlenumel = document.getElementById("puzzlenum");
  if (puzzlenumel && puzzlenumel.innerHTML) {
    document.getElementById("h1").innerHTML =
      "Sumplete: " + puzzlenumel.innerHTML;
  }

  existing = true;

  gridElement.style.height = gridElement.offsetWidth + "px";
} else {
  generate(3, 1);
  document.getElementById("feedbacklink").classList.add("hidden");
  //document.getElementById('intro-modal').classList.remove('hidden');
}

let lastUpdateVersion = localStorage.getItem("update-version");
let updateModal = document.getElementById("update-modal");
let updateVersion = updateModal.getAttribute("data-update");
if (updateVersion != lastUpdateVersion) {
  localStorage.setItem("update-version", updateVersion);
  if (existing) {
    updateModal.classList.remove("hidden");
  }
}

function sizechanged() {
  document.getElementById("level").innerHTML = "";

  let chosensize = parseInt(document.getElementById("size").value);
  let maxlevels = puzzles[chosensize].length;
  for (let i = 0; i < maxlevels; i++) {
    let opt = document.createElement("option");
    opt.value = i + 1;
    opt.innerText = levels[i];
    document.getElementById("level").appendChild(opt);
  }

  document.getElementById("level").style.display = maxlevels == 1 ? "none" : "";
}

function generate(ns, level) {
  let xhr = new XMLHttpRequest();
  let pn = Math.floor(Math.random() * puzzles[ns][level - 1]) + 1;
  let pf = pn - (pn % 100) + 1;
  xhr.open(
    "GET",
    "https://data.sumplete.com/" + ns + "/" + level + "/" + pf + ".txt",
    true
  );
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      let puzzlelines = xhr.responseText.split(/\n/);
      for (let i = 0; i < puzzlelines.length; i++) {
        let z = puzzlelines[i].split(/\:/);
        if (z[0] == pn) {
          let y = z[1].split(/;/);
          let numberGrid = y[0].split(",");
          let rowSums = y[1].split(",");
          let colSums = y[2].split(",");
          let statusGrid = y[3].split(",");
          updateboard(pn, ns, level, numberGrid, statusGrid, rowSums, colSums);
          break;
        }
      }
    }
  };
  xhr.send();
}

function updateboard(pn, ns, level, numberGrid, statusGrid, rowSums, colSums) {
  numbersize = ns;
  gridsize = numbersize + 1;

  undoStack = Array();

  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  for (let i = 0; i < gridsize * gridsize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    grid.appendChild(cell);
  }

  for (let i = 0; i <= numbersize - 1; i++) {
    for (let j = 0; j <= numbersize - 1; j++) {
      let indexA = i * numbersize + j;
      let index = i * gridsize + j;
      let cell = grid.children[index];
      cell.textContent = numberGrid[indexA];
      cell.classList.add("number");
      if (statusGrid[indexA] == 1) {
        cell.classList.add("solution");
      }
    }
  }

  for (let i = 0; i <= numbersize - 1; i++) {
    let index = i * gridsize + (gridsize - 1);
    let cell = grid.children[index];
    cell.textContent = rowSums[i];
    cell.classList.add("hanswer");
  }

  for (let j = 0; j <= numbersize - 1; j++) {
    let index = numbersize * gridsize + j;
    let cell = grid.children[index];
    cell.textContent = colSums[j];
    cell.classList.add("vanswer");
  }

  if (numbersize > 5) {
    document.getElementById("instructions").classList.add("hidden");
    document.body.classList.add("hide-instructions");
  } else {
    document.getElementById("instructions").classList.remove("hidden");
    document.body.classList.remove("hide-instructions");
  }

  grid.style.height = grid.offsetWidth + "px";
  const cellWidth = "calc(100% / " + gridsize + ")";
  Array.from(grid.children).forEach((cell) => {
    cell.style.width = cellWidth;
    cell.style.height = cellWidth;
  });

  document.getElementById("grid").setAttribute("data-size", numbersize);

  const savedLevel = document.createElement("input");
  savedLevel.type = "hidden";
  savedLevel.id = "savedlevel";
  savedLevel.value = document.getElementById("level").value;
  document.getElementById("grid").appendChild(savedLevel);

  let puzzlenumel = document.getElementById("puzzlenum");
  if (puzzlenumel == null) {
    puzzlenumel = document.createElement("div");
    puzzlenumel.id = "puzzlenum";
    grid.parentNode.insertBefore(puzzlenumel, grid);
  }

  puzzlenumel.innerHTML =
    numbersize +
    "x" +
    numbersize +
    " " +
    levels[level - 1].charAt(0).toUpperCase() +
    levels[level - 1].slice(1) +
    " #" +
    pn;
  document.getElementById("h1").innerHTML =
    "Sumplete: " + puzzlenumel.innerHTML;

  check();
}

// Check rows and columns
function check() {
  const grid = document.getElementById("grid");

  // Check rows
  for (let i = 0; i < gridsize - 1; i++) {
    let sum = 0;
    for (let j = 0; j < gridsize - 1; j++) {
      let index = i * gridsize + j;
      let cell = grid.children[index];
      if (!cell.classList.contains("delete")) {
        sum += parseInt(cell.textContent);
      }
    }
    let index = i * gridsize + (gridsize - 1);
    let cell = grid.children[index];
    if (sum == parseInt(cell.textContent)) {
      cell.classList.add("correct");
    } else {
      cell.classList.remove("correct");
    }
  }
  // Check columns
  for (let j = 0; j < gridsize - 1; j++) {
    let sum = 0;
    for (let i = 0; i < gridsize - 1; i++) {
      let index = i * gridsize + j;
      let cell = grid.children[index];
      if (!cell.classList.contains("delete")) {
        sum += parseInt(cell.textContent);
      }
    }
    let index = numbersize * gridsize + j;
    let cell = grid.children[index];
    if (sum == parseInt(cell.textContent)) {
      cell.classList.add("correct");
    } else {
      cell.classList.remove("correct");
    }
  }
  // Check if puzzle complete
  const correctCells = document.querySelectorAll("#grid .correct");
  if (correctCells.length == numbersize * 2) {
    (() => verify())();
    Array.from(document.querySelectorAll("#grid .number:not(.delete)")).forEach(
      (cell) => cell.classList.add("circle")
    );
    document.querySelector(".complete").classList.remove("hidden");
    document.querySelector(".new").classList.remove("hidden");
    document.querySelector(".controls").classList.add("hidden");
  }

  localStorage.setItem("loadgame", loadgame.innerHTML);
}

// Number clicks
const grid = document.getElementById("grid");
touchendonly = false;
touchmoved = false;
touchendonly = false;

grid.addEventListener(
  "touchstart",
  function (e) {
    touchmoved = false;
    touchendonly = true;
  },
  { passive: true }
);

grid.addEventListener(
  "touchmove",
  function (e) {
    touchmoved = true;
  },
  { passive: true }
);

grid.addEventListener(
  "touchend",
  function (e) {
    if (!touchmoved) {
      numberClick(e);
    }
  },
  { passive: true }
);

grid.addEventListener("click", function (e) {
  if (!touchendonly) {
    numberClick(e);
  }
});

function numberClick(e) {
  const target = e.target;
  if (!target.classList.contains("number")) {
    const grid = document.getElementById("grid");
    if (target.classList.contains("vanswer")) {
      let column = 0;
      let t = target.previousSibling;
      while (t.classList.contains("vanswer")) {
        column++;
        t = t.previousSibling;
      }

      if (target.classList.contains("correct")) {
        for (let i = 0; i <= numbersize - 1; i++) {
          let index = i * gridsize + column;
          let cell = grid.children[index];
          if (
            !cell.classList.contains("delete") &&
            !cell.classList.contains("circle")
          ) {
            let undoActions = Array();
            cell.classList.add("circle");
            undoActions.push("remove", "circle");
            undoStack.push(cell, undoActions);
          }
        }
      } else {
        let sum = 0;
        for (let i = 0; i <= numbersize - 1; i++) {
          let index = i * gridsize + column;
          let cell = grid.children[index];
          if (cell.classList.contains("circle")) {
            sum += parseInt(cell.textContent);
          }
        }

        deleteRemainder =
          sum ==
          parseInt(grid.children[numbersize * gridsize + column].textContent);

        if (deleteRemainder) {
          for (let i = 0; i <= numbersize - 1; i++) {
            let index = i * gridsize + column;
            let cell = grid.children[index];
            if (
              !cell.classList.contains("delete") &&
              !cell.classList.contains("circle")
            ) {
              let undoActions = Array();
              cell.classList.add("delete");
              undoActions.push("remove", "delete");
              undoStack.push(cell, undoActions);
            }
          }
        }
      }

      check();
    } else if (target.classList.contains("hanswer")) {
      let row = 0;
      let t = target.previousSibling;
      while (t != null) {
        if (t.classList.contains("hanswer")) {
          row++;
        }
        t = t.previousSibling;
      }

      if (target.classList.contains("correct")) {
        for (let i = 0; i <= numbersize - 1; i++) {
          let index = row * gridsize + i;
          let cell = grid.children[index];
          if (
            !cell.classList.contains("delete") &&
            !cell.classList.contains("circle")
          ) {
            let undoActions = Array();
            cell.classList.add("circle");
            undoActions.push("remove", "circle");
            undoStack.push(cell, undoActions);
          }
        }
      } else {
        let sum = 0;
        for (let i = 0; i <= numbersize - 1; i++) {
          let index = row * gridsize + i;
          let cell = grid.children[index];
          if (cell.classList.contains("circle")) {
            sum += parseInt(cell.textContent);
          }
        }

        deleteRemainder =
          sum ==
          parseInt(grid.children[row * gridsize + (gridsize - 1)].textContent);

        if (deleteRemainder) {
          for (let i = 0; i <= numbersize - 1; i++) {
            let index = row * gridsize + i;
            let cell = grid.children[index];
            if (
              !cell.classList.contains("delete") &&
              !cell.classList.contains("circle")
            ) {
              let undoActions = Array();
              cell.classList.add("delete");
              undoActions.push("remove", "delete");
              undoStack.push(cell, undoActions);
            }
          }
        }
      }

      check();
    }

    return;
  }

  if (
    !document.querySelector(".complete").classList.contains("hidden") ||
    !document.querySelector(".revealed").classList.contains("hidden")
  ) {
    return;
  }

  if (target.classList.contains("hint")) {
    return;
  }

  let undoActions = Array();

  // Set state of cell
  if (target.classList.contains("mistake")) {
    target.classList.remove("mistake");
    if (target.classList.contains("delete")) {
      target.classList.remove("delete");
      undoActions.push("add", "delete");
    } else if (target.classList.contains("circle")) {
      target.classList.remove("circle");
      undoActions.push("add", "circle");
    }
  } else if (target.classList.contains("delete")) {
    target.classList.remove("delete");
    undoActions.push("add", "delete");
    target.classList.add("circle");
    undoActions.push("remove", "circle");
  } else if (target.classList.contains("circle")) {
    target.classList.remove("circle");
    undoActions.push("add", "circle");
  } else {
    target.classList.add("delete");
    undoActions.push("remove", "delete");
  }

  undoStack.push(target, undoActions);
  document.getElementById("undo").disabled = false;

  // Hide remove if no more mistakes
  const mistakes = document.querySelectorAll("#grid .mistake");
  if (mistakes.length == 0) {
    document.getElementById("remove").classList.add("hidden");
  }

  check();
}

// Show mistakes
document.getElementById("undo").addEventListener("click", function () {
  if (undoStack.length < 2) {
    document.getElementById("undo").disabled = true;
    return;
  }

  undoActions = undoStack.pop();
  target = undoStack.pop();

  for (let i = undoActions.length - 2; i >= 0; i -= 2) {
    if (undoActions[i] == "add") {
      target.classList.add(undoActions[i + 1]);
    } else if (undoActions[i] == "remove") {
      target.classList.remove(undoActions[i + 1]);
    }
    target.classList.remove("mistake");
  }

  document.getElementById("undo").disabled = undoStack.length == 0;

  // Hide remove if no more mistakes
  const mistakes = document.querySelectorAll("#grid .mistake");
  if (mistakes.length == 0) {
    document.getElementById("remove").classList.add("hidden");
  }

  check();
});

// Show mistakes
document.getElementById("mistakes").addEventListener("click", function () {
  const grid = document.getElementById("grid");
  Array.from(grid.querySelectorAll(".solution.delete")).forEach((cell) =>
    cell.classList.add("mistake")
  );
  Array.from(grid.querySelectorAll(".circle:not(.solution)")).forEach((cell) =>
    cell.classList.add("mistake")
  );
  if (grid.querySelectorAll(".mistake").length > 0) {
    document.getElementById("remove").classList.remove("hidden");
  } else {
    undoStack = Array();
    document.getElementById("undo").disabled = true;
  }
  localStorage.setItem("loadgame", loadgame.innerHTML);
});

// Show hint
document.getElementById("hint").addEventListener("click", function () {
  const grid = document.getElementById("grid");
  const availableCells = Array.from(
    grid.querySelectorAll(".number:not(.solution):not(.hint):not(.delete)")
  );
  const randomIndex = Math.floor(Math.random() * availableCells.length);
  availableCells[randomIndex].classList.add("hint", "delete");
  check();
});

// Remove mistakes
document.getElementById("remove").addEventListener("click", function () {
  const grid = document.getElementById("grid");
  Array.from(grid.querySelectorAll(".mistake")).forEach((cell) =>
    cell.classList.remove("mistake", "circle", "delete")
  );
  document.getElementById("remove").classList.add("hidden");
  check();
});

// Reveal solution
document.getElementById("reveal").addEventListener("click", function () {
  if (confirm("Are you sure you want to reveal the solution to this puzzle?")) {
    const grid = document.getElementById("grid");
    Array.from(grid.querySelectorAll(".number")).forEach((cell) =>
      cell.classList.remove("circle", "delete", "mistake")
    );
    Array.from(grid.querySelectorAll(".solution")).forEach((cell) =>
      cell.classList.add("circle")
    );
    Array.from(grid.querySelectorAll(".number:not(.solution)")).forEach(
      (cell) => cell.classList.add("delete")
    );
    grid
      .querySelectorAll(".hanswer")
      .forEach((cell) => cell.classList.add("correct"));
    grid
      .querySelectorAll(".vanswer")
      .forEach((cell) => cell.classList.add("correct"));
    document.querySelector(".revealed").classList.remove("hidden");
    document.querySelector(".new").classList.remove("hidden");
    document.querySelector(".controls").classList.add("hidden");
    localStorage.setItem("loadgame", loadgame.innerHTML);
  }
});

// Restart puzzle
document.getElementById("restart").addEventListener("click", function () {
  if (confirm("Are you sure you want to restart this puzzle?")) {
    undoStack = Array();
    document.getElementById("undo").disabled = true;

    const grid = document.getElementById("grid");
    Array.from(grid.children).forEach((cell) =>
      cell.classList.remove("hint", "correct", "circle", "delete", "mistake")
    );
    document.querySelector(".complete").classList.add("hidden");
    document.querySelector(".revealed").classList.add("hidden");
    document.querySelector(".controls").classList.remove("hidden");
    check();
  }
});

// New puzzle
document.getElementById("new").addEventListener("click", function () {
  localStorage.removeItem("loadgame");
  document.getElementById("grid").innerHTML = "";
  document.querySelector(".complete").classList.add("hidden");
  document.querySelector(".revealed").classList.add("hidden");
  document.querySelector(".controls").classList.remove("hidden");
  generate(
    parseInt(document.getElementById("size").value),
    parseInt(document.getElementById("level").value)
  );
});

function modalClose() {
  let modals = document.querySelectorAll(".modal");
  for (let i = 0; i < modals.length; i++) {
    modals[i].classList.add("hidden");
  }
}

let modalCloses = document.querySelectorAll(".modal .close");
for (let i = 0; i < modalCloses.length; i++) {
  modalCloses[i].addEventListener("click", function () {
    modalClose();
  });
}
