import Vue from "vue";
import { Component } from "vue-property-decorator";

import Viewport from "../Viewport";
import cuber from "../../cuber";

@Component({
  template: require("./index.html"),
  components: {
    viewport: Viewport
  }
})
export default class Playground extends Vue {
  width: number = 0;
  height: number = 0;
  size: number = 0;
  viewport: Viewport;

  constructor() {
    super();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.size = Math.ceil(Math.min(this.width / 8, this.height / 12)) * 0.95;
    let view = this.$refs.viewport;
    if (view instanceof Viewport) {
      view.resize(this.width, this.height - this.size * 1.8);
    }
  }

  mounted() {
    this.resize();
    let view = this.$refs.viewport;
    if (view instanceof Viewport) {
      this.viewport = view;
    }
    this.shuffle();
    this.loop();
  }

  shuffled: boolean = false;
  completed: boolean = false;

  complete: boolean = false;
  start: number = 0;
  now: number = 0;
  get score() {
    let diff = this.now - this.start;
    let minute = Math.floor(diff / 1000 / 60);
    diff = diff % (1000 * 60);
    let second = Math.floor(diff / 1000);
    diff = diff % 1000;
    let ms = Math.floor(diff / 100);
    let time = (minute > 0 ? minute + ":" : "") + (Array(2).join("0") + second).slice(-2) + "." + ms;
    return time + "/" + cuber.history.moves;
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    this.viewport.draw();
    if (cuber.history.moves == 0) {
      this.start = 0;
      this.now = 0;
    } else {
      if (this.start == 0) {
        this.start = new Date().getTime();
      }
      if (!cuber.world.cube.complete) {
        this.now = new Date().getTime();
      } else {
        if (!this.complete) {
          cuber.controller.lock = true;
          this.completed = true;
          this.complete = true;
        }
      }
    }
  }

  shuffle() {
    this.complete = false;
    cuber.twister.twist("*");
    cuber.controller.lock = false;
    this.start = 0;
    this.now = 0;
  }

  get style() {
    return {
      "margin-left": ((this.size * 8) / 6) * 0.06 + "px",
      "margin-bottom": ((this.size * 8) / 6) * 0.1 + "px",
      width: ((this.size * 8) / 6) * 0.88 + "px",
      height: ((this.size * 8) / 6) * 0.88 + "px",
      "min-width": "0%",
      "min-height": "0%",
      "text-transform": "none"
    };
  }

  keys = ["backspace", "lock", "tune", "layers", "layer1", "layer2"];
  tap(key: string) {
    switch (key) {
      case "backspace":
        cuber.history.undo();
      default:
        break;
    }
  }
  disable(key: string) {
    switch (key) {
      case "backspace":
        return cuber.history.length == 0 || cuber.controller.lock;
      default:
        break;
    }
  }
}
