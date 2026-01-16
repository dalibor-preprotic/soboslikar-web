"use strict";

/** Python parse_number: trim + zamjena , u . + float */
function parseNumber(s) {
  const t = (s ?? "").trim().replace(",", ".");
  if (t === "") throw new Error("Prazan unos.");
  const v = Number(t);
  if (!Number.isFinite(v)) throw new Error("Unos mora biti broj.");
  return v;
}

function pos(v, name) {
  if (v <= 0) throw new Error(`${name} mora biti veća od 0.`);
}

const STEPS = {
  ROOM_W: "ROOM_W",
  ROOM_L: "ROOM_L",
  ROOM_H: "ROOM_H",
  OPEN_W: "OPEN_W",
  OPEN_H: "OPEN_H",
  NO_PARKET_W: "NO_PARKET_W",
  NO_PARKET_L: "NO_PARKET_L",
  PRICE_PAINT: "PRICE_PAINT",
  PRICE_PARKET: "PRICE_PARKET",
};

const ui = {
  promptLine1: document.getElementById("promptLine1"),
  promptLine2: document.getElementById("promptLine2"),
  display: document.getElementById("display"),
  calcView: document.getElementById("calcView"),
  finalView: document.getElementById("finalView"),
  finalText: document.getElementById("finalText"),
  restartBtn: document.getElementById("restartBtn"),
};

const state = {
  paint_total: 0.0,
  floor_total: 0.0,

  room_w: null,
  room_l: null,
  room_h: null,
  open_w: null,
  no_parquet_w: null,

  painter_price: null,
  parquet_price: null,

  step: STEPS.ROOM_W,
};

function setPrompt(a, b = "") {
  ui.promptLine1.textContent = a;
  ui.promptLine2.textContent = b;
}

function updatePrompt() {
  switch (state.step) {
    case STEPS.ROOM_W:
      setPrompt("Unesi širinu prostorije (m).", "Unesi 0 za kraj unosa prostorija:");
      break;
    case STEPS.ROOM_L:
      setPrompt("Unesi dužinu prostorije (m):");
      break;
    case STEPS.ROOM_H:
      setPrompt("Unesi visinu prostorije (m):");
      break;
    case STEPS.OPEN_W:
      setPrompt("Otvori: unesi širinu (m).", "Unesi 0 za kraj otvora u prostoriji:");
      break;
    case STEPS.OPEN_H:
      setPrompt("Otvori: unesi visinu (m):");
      break;
    case STEPS.NO_PARKET_W:
      setPrompt("Područje bez parketa – širina (m):", "Unesi 0 ako nema (ili nema više):");
      break;
    case STEPS.NO_PARKET_L:
      setPrompt("Područje bez parketa – dužina (m):");
      break;
    case STEPS.PRICE_PAINT:
      setPrompt("Cijena soboslikar (€/m²):");
      break;
    case STEPS.PRICE_PARKET:
      setPrompt("Cijena parketar (€/m²):");
      break;
  }
}

function clearDisplay() {
  ui.display.value = "";
  ui.display.focus();
}

function addChar(ch) {
  ui.display.value = (ui.display.value ?? "") + ch;
  ui.display.focus();
}

function backspace() {
  ui.display.value = (ui.display.value ?? "").slice(0, -1);
  ui.display.focus();
}

function resetState() {
  state.paint_total = 0.0;
  state.floor_total = 0.0;

  state.room_w = state.room_l = state.room_h = null;
  state.open_w = null;
  state.no_parquet_w = null;

  state.painter_price = null;
  state.parquet_price = null;

  state.step = STEPS.ROOM_W;
  clearDisplay();
  updatePrompt();
  showCalc();
}

function showCalc() {
  ui.finalView.classList.add("hidden");
  ui.calcView.classList.remove("hidden");
}

function showFinal() {
  ui.calcView.classList.add("hidden");
  ui.finalView.classList.remove("hidden");

  const paint = Math.max(0, state.paint_total);
  const floor = Math.max(0, state.floor_total);

  const pc = paint * state.painter_price;
  const fc = floor * state.parquet_price;
  const total = pc + fc;

  ui.finalText.textContent =
`OBRAČUN
────────────────────
Površina bojanje: ${paint.toFixed(2)} m²
Površina parket:  ${floor.toFixed(2)} m²

Ukupno soboslikar: ${pc.toFixed(2)} €
Ukupno parketar:   ${fc.toFixed(2)} €
────────────────────
SVEUKUPNO: ${total.toFixed(2)} €`;
}

function ok() {
  let x;
  try {
    x = parseNumber(ui.display.value);
  } catch (e) {
    alert("Neispravan unos: Unos mora biti broj.");
    return;
  }

  try {
    if (state.step === STEPS.ROOM_W) {
      if (x === 0) {
        state.step = STEPS.NO_PARKET_W;
      } else {
        pos(x, "Širina");
        state.room_w = x;
        state.step = STEPS.ROOM_L;
      }

    } else if (state.step === STEPS.ROOM_L) {
      pos(x, "Dužina");
      state.room_l = x;
      state.step = STEPS.ROOM_H;

    } else if (state.step === STEPS.ROOM_H) {
      pos(x, "Visina");
      state.room_h = x;

      // isto kao u Pythonu: zidovi + strop (w*l)
      state.paint_total += 2 * (state.room_w + state.room_l) * x + state.room_w * state.room_l;
      state.floor_total += state.room_w * state.room_l;

      state.step = STEPS.OPEN_W;

    } else if (state.step === STEPS.OPEN_W) {
      if (x === 0) {
        state.step = STEPS.ROOM_W;
      } else {
        pos(x, "Širina otvora");
        state.open_w = x;
        state.step = STEPS.OPEN_H;
      }

    } else if (state.step === STEPS.OPEN_H) {
      pos(x, "Visina otvora");
      state.paint_total = Math.max(0, state.paint_total - state.open_w * x);
      state.step = STEPS.OPEN_W;

    } else if (state.step === STEPS.NO_PARKET_W) {
      if (x === 0) {
        state.step = STEPS.PRICE_PAINT;
      } else {
        pos(x, "Širina");
        state.no_parquet_w = x;
        state.step = STEPS.NO_PARKET_L;
      }

    } else if (state.step === STEPS.NO_PARKET_L) {
      pos(x, "Dužina");
      state.floor_total = Math.max(0, state.floor_total - state.no_parquet_w * x);
      state.step = STEPS.NO_PARKET_W;

    } else if (state.step === STEPS.PRICE_PAINT) {
      if (x < 0) throw new Error("Cijena ne smije biti negativna.");
      state.painter_price = x;
      state.step = STEPS.PRICE_PARKET;

    } else if (state.step === STEPS.PRICE_PARKET) {
      if (x < 0) throw new Error("Cijena ne smije biti negativna.");
      state.parquet_price = x;
      showFinal();
      clearDisplay();
      return;
    }

    clearDisplay();
    updatePrompt();
  } catch (e) {
    alert("Neispravan unos: " + e.message);
  }
}

// Klikovi na tipkovnici
document.querySelector(".pad").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const key = btn.getAttribute("data-key");
  const action = btn.getAttribute("data-action");

  if (key) addChar(key);
  if (action === "clear") clearDisplay();
  if (action === "back") backspace();
  if (action === "ok") ok();
});

// Tipkovnica
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); ok(); }
  if (e.key === "Escape") { e.preventDefault(); clearDisplay(); }
  if (e.key === "Backspace" && document.activeElement !== ui.display) {
    e.preventDefault();
    backspace();
  }
});

ui.restartBtn.addEventListener("click", resetState);

// init
resetState();
