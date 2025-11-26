import * as THREE from "three";
import { CAMERA_Y_OFFSET, ISLAND_DEPTH, POSITIONS } from "./constants.js";

export function setupCamera(aspectRatio) {
  const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);

  // // Camera starts inside Sumatra block
  // camera.position.set(
  //   POSITIONS.Sumatra.x,
  //   CAMERA_Y_OFFSET,
  //   POSITIONS.Sumatra.z + ISLAND_DEPTH / 2 - 5
  // );

  // Camera starts inside Papua block
  camera.position.set(
    POSITIONS.Sumatra.x,
    CAMERA_Y_OFFSET,
    POSITIONS.Sumatra.z + ISLAND_DEPTH / 2 - 5
  );

  return camera;
}
