import * as THREE from "three";
import {
  SEPARATOR_BEND_SPAN,
  SEPARATOR_BEND_THICKNESS,
  WALL_THICKNESS,
} from "../constants.js";
import { createBlock } from "../utils/createBlock.js";
import { createTextTexture } from "../utils/createTextTexture.js";

export function createSeparatorSumatraJawa() {
  const separatorBlock = createBlock("SeparatorSumatraJawa", 0x0aaaaa);

  const W = SEPARATOR_BEND_SPAN;
  const D = SEPARATOR_BEND_THICKNESS;

  const xPositionRight = W / 2 + WALL_THICKNESS / 2;
  const xPositionLeft = -W / 2 - WALL_THICKNESS / 2;
  const zPosition = 0;

  const planeWidth = D - 2; // e.g., 18 (This is the Z dimension in the world)
  const planeHeight = 4; // (This is the Y dimension in the world)

  // Use a ratio that matches the physical dimensions (18 width / 4 height = 4.5)
  // We need a texture size that matches this aspect ratio, e.g., 512 x 113.7 (or 512x128 for power of 2)
  const TEXTURE_WIDTH = 512;
  const TEXTURE_HEIGHT = 128; // Close enough to the 4.5 aspect ratio

  const planeGeo = new THREE.PlaneGeometry(planeWidth, planeHeight);

  const jawaTexture = createTextTexture(
    "JAWA",
    TEXTURE_WIDTH,
    TEXTURE_HEIGHT,
    "white",
    "blue"
  );

  const planeMatRight = new THREE.MeshBasicMaterial({
    map: jawaTexture,
    side: THREE.DoubleSide,
    transparent: false,
  });
  const textMeshRight = new THREE.Mesh(planeGeo, planeMatRight);
  textMeshRight.name = "WelcomeSignJawa";

  textMeshRight.position.set(
    xPositionRight - WALL_THICKNESS / 2 - 0.1,
    5,
    zPosition
  );
  textMeshRight.rotation.y = Math.PI / 2;
  separatorBlock.add(textMeshRight);

  const sumatraTexture = createTextTexture(
    "SUMATRA",
    TEXTURE_WIDTH,
    TEXTURE_HEIGHT,
    "black",
    "lime"
  );

  const planeMatLeft = new THREE.MeshBasicMaterial({
    map: sumatraTexture,
    side: THREE.DoubleSide,
    transparent: false,
  });
  const textMeshLeft = new THREE.Mesh(planeGeo, planeMatLeft);
  textMeshLeft.name = "WelcomeSignSumatra";

  textMeshLeft.position.set(
    xPositionLeft + WALL_THICKNESS / 2 + 0.1,
    5,
    zPosition
  );
  textMeshLeft.rotation.y = -Math.PI / 2;
  separatorBlock.add(textMeshLeft);

  return separatorBlock;
}
