"use strict";
const pickrPen = Pickr.create({
  el: ".color-picker-pen",
  theme: "monolith", // "classic" or 'monolith', or 'nano'
  default: "#000000",

  swatches: [
    "rgba(244, 67, 54, 1)",
    "rgba(233, 30, 99, 0.95)",
    "rgba(156, 39, 176, 0.9)",
    "rgba(103, 58, 183, 0.85)",
    "rgba(63, 81, 181, 0.8)",
    "rgba(33, 150, 243, 0.75)",
    "rgba(3, 169, 244, 0.7)",
    "rgba(0, 188, 212, 0.7)",
    "rgba(0, 150, 136, 0.75)",
    "rgba(76, 175, 80, 0.8)",
    "rgba(139, 195, 74, 0.85)",
    "rgba(205, 220, 57, 0.9)",
    "rgba(255, 235, 59, 0.95)",
    "rgba(255, 193, 7, 1)",
  ],

  components: {
    // Main components
    preview: false,
    opacity: true,
    hue: true,

    // Input / output Options
    interaction: {
      hex: false,
      rgba: false,
      hsla: false,
      hsva: false,
      cmyk: false,
      input: false,
      clear: true,
      save: true,
    },
  },
});

const pickrBackground = Pickr.create({
  el: ".color-picker-background",
  theme: "monolith", // "classic" or 'monolith', or 'nano'
  default: "#FFFFFF",

  swatches: [
    "rgba(244, 67, 54, 1)",
    "rgba(233, 30, 99, 0.95)",
    "rgba(156, 39, 176, 0.9)",
    "rgba(103, 58, 183, 0.85)",
    "rgba(63, 81, 181, 0.8)",
    "rgba(33, 150, 243, 0.75)",
    "rgba(3, 169, 244, 0.7)",
    "rgba(0, 188, 212, 0.7)",
    "rgba(0, 150, 136, 0.75)",
    "rgba(76, 175, 80, 0.8)",
    "rgba(139, 195, 74, 0.85)",
    "rgba(205, 220, 57, 0.9)",
    "rgba(255, 235, 59, 0.95)",
    "rgba(255, 193, 7, 1)",
  ],

  components: {
    // Main components
    preview: false,
    opacity: true,
    hue: true,

    // Input / output Options
    interaction: {
      hex: false,
      rgba: false,
      hsla: false,
      hsva: false,
      cmyk: false,
      input: false,
      clear: true,
      save: true,
    },
  },
});

const buttons = {
  draw: document.querySelector("#draw"),
  fill: document.querySelector("#fill"),
  sample: document.querySelector("#sample"),
  eraser: document.querySelector("#eraser"),
  ligthen: document.querySelector("#ligthen"),
  darken: document.querySelector("#darken"),
};

function restoreButtons() {
  for (const buttonKey in buttons) {
    buttons[buttonKey].style.background = "rgb(108, 108, 108)";
    buttons[buttonKey].style.color = "rgb(230, 214, 187)";
  }
  paint = false;
}

function updateFooter() {
  const footer = document.querySelector("footer");
  const paragraph = document.createElement("p");
  paragraph.textContent = `Copyright © ${new Date().getFullYear()} cramirez`;

  const anchor = document.createElement("a");
  anchor.setAttribute("href", "https://github.com/cramirez16");
  anchor.setAttribute("target", "_blank");

  const githubIcon = document.createElement("i");
  githubIcon.setAttribute("class", "fab fa-github");

  anchor.appendChild(githubIcon);
  footer.appendChild(paragraph);
  footer.appendChild(anchor);
}

function createCell(cellSize) {
  const cell = document.createElement("div");
  cell.style.width = `${cellSize}px`;
  cell.style.height = `${cellSize}px`;
  cell.style.border = "1px solid white";
}

function createBoard(numOfCells, cellSize) {
  const main = document.querySelector("main");

  for (let row = 0; row < numOfCells; row++) {
    const row = document.createElement("p");
    row.style.display = "flex";
    for (let col = 0; col < numOfCells; col++) {
      const cell = document.createElement("div");
      cell.style.width = `${cellSize}px`;
      cell.style.height = `${cellSize}px`;
      cell.style.border = "1px solid white";
      cell.setAttribute("class", `cell`);
      row.appendChild(cell);
    }
    main.appendChild(row);
  }
}

function removeBoardListener(boardCells) {
  boardCells.forEach((cell) => {
    cell.removeEventListener("mouseenter", drawEvents.mouseEnter);
    cell.removeEventListener("mousedown", drawEvents.mouseDown);
    cell.removeEventListener("mousedown", drawEvents.mouseUp);
    cell.removeEventListener("click", sampleEvents.mouseClick);
    cell.removeEventListener("mouseenter", eraserEvents.mouseEnter);
    cell.removeEventListener("mousedown", eraserEvents.mouseDown);
    cell.removeEventListener("mouseup", eraserEvents.mouseUp);
    cell.removeEventListener("mouseenter", lighterEvents.mouseEnter);
    cell.removeEventListener("mousedown", lighterEvents.mouseDown);
    cell.removeEventListener("mouseup", lighterEvents.mouseUp);
    cell.removeEventListener("mouseenter", darkerEvents.mouseEnter);
    cell.removeEventListener("mousedown", darkerEvents.mouseDown);
    cell.removeEventListener("mouseup", darkerEvents.mouseUp);
  });
}

function filling(boardCells) {
  removeBoardListener(boardCells);
  const gnd = document.querySelector(".container_background>.pickr>button");
  const pickerColorAttribute = gnd.getAttribute("style");
  const pickerFillColor = pickerColorAttribute.slice(
    pickerColorAttribute.indexOf("rgba"),
    pickerColorAttribute.length - 1
  );
  boardCells.forEach((cell) => (cell.style.background = pickerFillColor));
}

function updateAlphaChannel(target, option) {
  // option === true  -> inc bright / alpha channel
  // option === false -> dec bright / alpha channel
  let cellBackgroundColor = target.style.background;
  if (!cellBackgroundColor) return;
  if (!cellBackgroundColor.includes("rgba")) {
    cellBackgroundColor = cellBackgroundColor
      .replace("rgb", "rgba")
      .replace(")", ", 1)");
  }
  const alphaChannelStr = cellBackgroundColor.slice(
    cellBackgroundColor.lastIndexOf(",") + 1,
    cellBackgroundColor.length - 1
  );
  let alphaChannelNum =
    Math.round((Number(alphaChannelStr) + (option ? -0.1 : 0.1)) * 10) / 10;
  alphaChannelNum < 0
    ? (alphaChannelNum = 0)
    : alphaChannelNum > 1
    ? (alphaChannelNum = 1)
    : null;
  cellBackgroundColor = cellBackgroundColor.replace(
    `${alphaChannelStr})`,
    `${alphaChannelNum.toString()})`
  );
  target.style.background = cellBackgroundColor;
}

function drawing(target) {
  const gnd = document.querySelector(".container_pen>.pickr>button");
  const pickerColorAttribute = gnd.getAttribute("style");
  const pickerFillColor = pickerColorAttribute.slice(
    pickerColorAttribute.indexOf("rgba"),
    pickerColorAttribute.length - 1
  );
  target.style.background = pickerFillColor;
}

const drawEvents = {
  mouseEnter: (e) => {
    if (paint) {
      drawing(e.target);
    }
  },
  mouseDown: (e) => {
    paint = true;
    drawing(e.target);
  },
  mouseUp: () => {
    paint = false;
  },
};

function drawListen(boardCells) {
  removeBoardListener(boardCells);
  boardCells.forEach((cell) => {
    cell.addEventListener("mouseenter", drawEvents.mouseEnter);
    cell.addEventListener("mousedown", drawEvents.mouseDown);
    cell.addEventListener("mouseup", drawEvents.mouseUp);
  });
}

function sampling(target) {
  let sampledColor = target.style.background;
  if (!sampledColor) return;
  if (!sampledColor.includes("rgba")) {
    sampledColor = sampledColor.replace("rgb", "rgba").replace(")", ", 1)");
  }
  const gnd = document.querySelector(".container_pen>.pickr>button");
  gnd.setAttribute("style", sampledColor);
  const root = document.documentElement;
  root.style.setProperty("--pcr-color", sampledColor);
}

const sampleEvents = {
  mouseClick: (e) => {
    sampling(e.target);
  },
};

function sampleListen(boardCells) {
  removeBoardListener(boardCells);
  boardCells.forEach((cell) => {
    cell.addEventListener("click", sampleEvents.mouseClick);
  });
}

function erasing(target) {
  target.style.background = "";
}

const eraserEvents = {
  mouseEnter: (e) => {
    if (paint) {
      erasing(e.target);
    }
  },
  mouseDown: (e) => {
    paint = true;
    erasing(e.target);
  },
  mouseUp: () => {
    paint = false;
  },
};

function eraserListen(boardCells) {
  removeBoardListener(boardCells);
  boardCells.forEach((cell) => {
    cell.addEventListener("mouseenter", eraserEvents.mouseEnter);
    cell.addEventListener("mousedown", eraserEvents.mouseDown);
    cell.addEventListener("mouseup", eraserEvents.mouseUp);
  });
}

const lighterEvents = {
  mouseEnter: (e) => {
    if (paint) {
      updateAlphaChannel(e.target, true);
    }
  },
  mouseDown: (e) => {
    paint = true;
    updateAlphaChannel(e.target, true);
  },
  mouseUp: () => {
    paint = false;
  },
};

function lightenListen(boardCells) {
  removeBoardListener(boardCells);
  boardCells.forEach((cell) => {
    cell.addEventListener("mouseenter", lighterEvents.mouseEnter);
    cell.addEventListener("mousedown", lighterEvents.mouseDown);
    cell.addEventListener("mouseup", lighterEvents.mouseUp);
  });
}

const darkerEvents = {
  mouseEnter: (e) => {
    if (paint) {
      updateAlphaChannel(e.target, false);
    }
  },
  mouseDown: (e) => {
    paint = true;
    updateAlphaChannel(e.target, false);
  },
  mouseUp: () => {
    paint = false;
  },
};

function darkenListen(boardCells) {
  removeBoardListener(boardCells);
  boardCells.forEach((cell) => {
    cell.addEventListener("mouseenter", darkerEvents.mouseEnter);
    cell.addEventListener("mousedown", darkerEvents.mouseDown);
    cell.addEventListener("mouseup", darkerEvents.mouseUp);
  });
}

function buttonActiveStyle(buttonName) {
  buttons[buttonName].style.background = "rgb(140, 140, 140)";
  buttons[buttonName].style.color = "rgb(99, 226, 103)";
}

function buttonListen() {
  const boardCells = document.querySelectorAll("main>p>div");
  const menuButtons = {
    draw: () => {
      restoreButtons();
      buttonActiveStyle("draw");
      drawListen(boardCells);
    },
    fill: () => {
      restoreButtons();
      filling(boardCells);
    },
    sample: () => {
      restoreButtons();
      buttonActiveStyle("sample");
      sampleListen(boardCells);
    },
    eraser: () => {
      restoreButtons();
      buttonActiveStyle("eraser");
      eraserListen(boardCells);
    },
    ligthen: () => {
      restoreButtons();
      buttonActiveStyle("ligthen");
      lightenListen(boardCells);
    },
    darken: () => {
      restoreButtons();
      buttonActiveStyle("darken");
      darkenListen(boardCells);
    },
  };

  const butt = document.querySelector(".container");
  butt.addEventListener("click", (e) => {
    const action = e.target.getAttribute("id");
    if (!action) return;
    menuButtons[action]();
  });
}

function mainListen() {
  const main = document.querySelector("main");
  main.addEventListener("mouseup", () => {
    paint = false;
  });
  main.addEventListener("mousedown", () => {
    paint = true;
  });
}

let paint = false;

function main() {
  updateFooter();
  createBoard(16, 25);
  mainListen();
  buttonListen();
}

main();
