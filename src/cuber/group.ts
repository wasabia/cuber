import * as THREE from "three";
import Cubelet from "./cubelet";
import { TwistAction } from "./twister";
import Cube from "./cube";
import { DURATION } from "../common/define";
import { tweener } from "./tweener";

export default class Group extends THREE.Group {
  cube: Cube;
  cubelets: Cubelet[];
  name: string;
  indices: number[];
  axis: THREE.Vector3;

  _angle: number;
  set angle(angle) {
    this.setRotationFromAxisAngle(this.axis, angle);
    this._angle = angle;
    this.updateMatrix();
    this.cube.dirty = true;
  }
  get angle() {
    return this._angle;
  }

  constructor(cube: Cube, name: string, indices: number[], axis: THREE.Vector3) {
    super();
    this.cube = cube;
    this._angle = 0;
    this.cubelets = [];
    this.name = name;
    this.indices = indices;
    this.axis = axis;
    this.matrixAutoUpdate = false;
    this.updateMatrix();
  }

  hold() {
    this.angle = 0;
    for (let i of this.indices) {
      let cubelet = this.cube.cubelets[i];
      this.cubelets.push(cubelet);
      this.cube.remove(cubelet);
      this.add(cubelet);
    }
    this.cube.lock = true;
  }

  drop() {
    this.angle = Math.round(this.angle / (Math.PI / 2)) * (Math.PI / 2);
    while (true) {
      let cubelet = this.cubelets.pop();
      if (undefined === cubelet) {
        break;
      }
      this.rotate(cubelet);
      this.remove(cubelet);
      this.cube.add(cubelet);
      this.cube.cubelets[cubelet.index] = cubelet;
    }
    this.cube.lock = false;
    this.angle = 0;
  }

  twist(angle = this.angle, callback: Function | null = null) {
    angle = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
    let delta = angle - this.angle;
    if (delta === 0) {
      this.drop();
      if (callback) {
        callback();
      }
    } else {
      var duration = DURATION * Math.min(1, Math.abs(delta) / (Math.PI / 2));
      tweener.tween(this.angle, angle, duration, (value: number) => {
        this.angle = value;
        if (this.angle === angle || this.angle === 0) {
          this.drop();
          if (callback) {
            callback();
          }
        }
      });
    }
  }

  rotate(cubelet: Cubelet) {
    cubelet.rotateOnWorldAxis(this.axis, this.angle);
    cubelet.vector = cubelet.vector.applyAxisAngle(this.axis, this.angle);
    cubelet.updateMatrix();
  }
}
