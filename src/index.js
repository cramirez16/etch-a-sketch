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
    preview: true,
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
    preview: true,
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
  rubber: document.querySelector("#rubber"),
  ligthen: document.querySelector("#ligthen"),
  darken: document.querySelector("#darken"),
};

function restoreButtons() {
  for (const buttonKey in buttons) {
    buttons[buttonKey].style.background = "#FFFFFF";
  }
  setup = {
    paint: false,
    draw: false,
    rubber: false,
    ligthen: false,
    darken: false,
  };
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
    cell.removeEventListener("mouseenter", rubberEvents.mouseEnter);
    cell.removeEventListener("mousedown", rubberEvents.mouseDown);
    cell.removeEventListener("mouseup", rubberEvents.mouseUp);
    cell.removeEventListener("mouseenter", lighterEvents.mouseEnter);
    cell.removeEventListener("mousedown", lighterEvents.mouseDown);
    cell.removeEventListener("mouseup", lighterEvents.mouseUp);
    cell.removeEventListener("mouseenter", darkerEvents.mouseEnter);
    cell.removeEventListener("mousedown", darkerEvents.mouseDown);
    cell.removeEventListener("mouseup", darkerEvents.mouseUp);
  });
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

function rubbing(target) {
  target.style.background = "";
}

function lighting(target) {
  let sampledColor = target.style.background;
  if (!sampledColor) return;
  if (!sampledColor.includes("rgba")) {
    sampledColor = sampledColor.replace("rgb", "rgba").replace(")", ", 1)");
  }
  const alpha = sampledColor.slice(
    sampledColor.lastIndexOf(",") + 1,
    sampledColor.length - 1
  );
  let alphaNum = Math.floor((Number(alpha) - 0.1) * 10) / 10;
  if (alphaNum < 0) {
    alphaNum = 0;
  }
  sampledColor = sampledColor.replace(alpha, alphaNum.toString());
  target.style.background = sampledColor;
}

function darking(target) {
  let sampledColor = target.style.background;
  if (!sampledColor) return;
  if (!sampledColor.includes("rgba")) {
    return;
    //sampledColor = sampledColor.replace("rgb", "rgba").replace(")", ", 1)");
  }
  const alpha = sampledColor.slice(
    sampledColor.lastIndexOf(",") + 1,
    sampledColor.length - 1
  );
  let alphaNum = Math.floor((Number(alpha) + 0.1) * 10) / 10;
  if (alphaNum > 1) {
    alphaNum = 1;
  }
  sampledColor = sampledColor.replace(alpha, alphaNum.toString());
  target.style.background = sampledColor;
}

const drawEvents = {
  mouseEnter: (e) => {
    if (setup.paint) {
      drawing(e.target);
    }
  },
  mouseDown: (e) => {
    setup.paint = true;
    drawing(e.target);
  },
  mouseUp: () => {
    setup.paint = false;
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

const rubberEvents = {
  mouseEnter: (e) => {
    if (setup.paint) {
      rubbing(e.target);
    }
  },
  mouseDown: (e) => {
    setup.paint = true;
    rubbing(e.target);
  },
  mouseUp: () => {
    setup.paint = false;
  },
};

function rubberListen(boardCells) {
  removeBoardListener(boardCells);
  boardCells.forEach((cell) => {
    cell.addEventListener("mouseenter", rubberEvents.mouseEnter);
    cell.addEventListener("mousedown", rubberEvents.mouseDown);
    cell.addEventListener("mouseup", rubberEvents.mouseUp);
  });
}

const lighterEvents = {
  mouseEnter: (e) => {
    if (setup.paint) {
      lighting(e.target);
    }
  },
  mouseDown: (e) => {
    setup.paint = true;
    lighting(e.target);
  },
  mouseUp: () => {
    setup.paint = false;
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
    if (setup.paint) {
      darking(e.target);
    }
  },
  mouseDown: (e) => {
    setup.paint = true;
    darking(e.target);
  },
  mouseUp: () => {
    setup.paint = false;
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

function buttonListen(boardCells) {
  const menuButtons = {
    draw: () => {
      restoreButtons();
      buttons.draw.style.background = "aqua";
      drawListen(boardCells);
    },
    fill: () => {
      restoreButtons();
      filling(boardCells);
    },
    sample: () => {
      restoreButtons();
      buttons.sample.style.background = "aqua";
      sampleListen(boardCells);
    },
    rubber: () => {
      restoreButtons();
      buttons.rubber.style.background = "aqua";
      rubberListen(boardCells);
    },
    ligthen: () => {
      restoreButtons();
      buttons.ligthen.style.background = "aqua";
      lightenListen(boardCells);
    },
    darken: () => {
      restoreButtons();
      buttons.darken.style.background = "aqua";
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

let setup = {
  paint: false,
  draw: true,
  rubber: false,
  ligthen: false,
  darken: false,
};

function main() {
  updateFooter();
  createBoard(16, 25);
  const board = document.querySelectorAll("main>p>div");
  buttonListen(board);
}

main();
