import queryString from "query-string";
import { paintLagopusTree, renderLagopusTree, resetCanvasSize } from "@triadica/lagopus/lib/render.mjs";
import { enableBloom, initializeCanvasTextures, initializeContext } from "@triadica/lagopus/lib/initialize.js";

import { compContainer } from "./app/container.mjs";
import { renderControl, startControlLoop } from "@triadica/touch-control";
import { onControlEvent } from "@triadica/lagopus/lib/control.mjs";
import { setupMouseEvents } from "@triadica/lagopus/lib/events.mjs";
import { Atom } from "@triadica/touch-control";
import { V3 } from "@triadica/lagopus/lib/primes.mjs";
import { atomClearColor } from "@triadica/lagopus/lib/global.mjs";
import { isMobile } from "./config.mjs";
import { setupRemoteControl } from "@triadica/lagopus/lib/remote-control.mjs";

let store = new Atom({
  position: [180, 80, 80] as V3,
});

let dispatch = (op: string, data: any) => {
  if (op === "drag") {
    store.deref().position = data;
    renderApp();
  } else {
    console.warn("dispatch", op, data);
  }
};

function renderApp() {
  let tree = compContainer(store.deref());

  renderLagopusTree(tree, dispatch);
}

window.onload = async () => {
  if (!isMobile) {
    // enableBloom();
  }

  await initializeContext();
  initializeCanvasTextures();
  atomClearColor.reset({ r: 0.4, g: 0.4, b: 0.4, a: 1.0 });
  let canvas = document.querySelector("canvas");
  renderApp();
  console.log("loaded");

  renderControl();
  startControlLoop(10, onControlEvent);

  window.onresize = () => {
    resetCanvasSize(canvas);
    initializeCanvasTextures();
    paintLagopusTree();
  };
  resetCanvasSize(canvas);

  window.__lagopusHandleCompilationInfo = (e, code) => {
    if (e.messages.length) {
      console.error(e);
    }
  };
  setupMouseEvents(canvas);

  const parsed = queryString.parse(location.search);

  if (parsed["remote-control"]) {
    setupRemoteControl((action) => {
      console.log("Action", action);
    });
  }
};

declare global {
  /** dirty hook for extracting error messages */
  var __lagopusHandleCompilationInfo: (info: GPUCompilationInfo, code: string) => void;
}
