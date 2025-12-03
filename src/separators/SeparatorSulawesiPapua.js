import * as THREE from "three";
import { createBlock } from "../utils/createBlock.js";
import {
  SEPARATOR_BEND_SPAN,
  SEPARATOR_BEND_THICKNESS,
  WALL_THICKNESS,
} from "../constants.js";
import { createTextTexture } from "../utils/createTextTexture.js";

export function createSeparatorSulawesiPapua() {
  const separatorBlock = createBlock("SeparatorSulawesiPapua");

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

  const sulawesiTexture = createTextTexture(
    "SULAWESI",
    TEXTURE_WIDTH,
    TEXTURE_HEIGHT,
    "white",
    "blue"
  );

  const planeMatRight = new THREE.MeshBasicMaterial({
    map: sulawesiTexture,
    side: THREE.DoubleSide,
    transparent: false,
  });
  const textMeshRight = new THREE.Mesh(planeGeo, planeMatRight);
  textMeshRight.name = "WelcomeSignSulawesi";

  textMeshRight.position.set(
    xPositionRight - WALL_THICKNESS / 2 - 0.1,
    5,
    zPosition
  );
  textMeshRight.rotation.y = Math.PI / 2;
  separatorBlock.add(textMeshRight);

  const papuaTexture = createTextTexture(
    "PAPUA",
    TEXTURE_WIDTH,
    TEXTURE_HEIGHT,
    "black",
    "lime"
  );

  const planeMatLeft = new THREE.MeshBasicMaterial({
    map: papuaTexture,
    side: THREE.DoubleSide,
    transparent: false,
  });
  const textMeshLeft = new THREE.Mesh(planeGeo, planeMatLeft);
  textMeshLeft.name = "WelcomeSignPapua";

  textMeshLeft.position.set(
    xPositionLeft + WALL_THICKNESS / 2 + 0.1,
    5,
    zPosition
  );
  textMeshLeft.rotation.y = -Math.PI / 2;
  separatorBlock.add(textMeshLeft);

  const textureLoader = new THREE.TextureLoader();
  const floorTexture = textureLoader.load(
    "./src/assets/floor_texture.jpg",
    (tex) => {
      tex.flipY = false;
      tex.encoding = THREE.sRGBEncoding;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(8, 2);
    }
  );

  separatorBlock.traverse((child) => {
    if (child.isMesh && child.userData && child.userData.isWalkable) {
      if (child.material) {
        child.material.map = floorTexture;
        child.material.needsUpdate = true;
      }
    }
  });

  return separatorBlock;
}
