import * as THREE from "three";
import {
  SEPARATOR_BEND_SPAN,
  SEPARATOR_BEND_THICKNESS,
  WALL_THICKNESS,
} from "../constants.js";
import { createBlock } from "../utils/createBlock.js";
import { createTextTexture } from "../utils/createTextTexture.js";
import { applyWallTexture, isWall } from "../utils/wallHelper.js";

export function createSeparatorSumatraJawa() {
  const separatorBlock = createBlock("SeparatorSumatraJawa");

  const W = SEPARATOR_BEND_SPAN;
  const D = SEPARATOR_BEND_THICKNESS;

  const xPositionRight = W / 2 + WALL_THICKNESS / 2;
  const xPositionLeft = -W / 2 - WALL_THICKNESS / 2;
  const zPosition = 0;

  const planeWidth = D - 2;
  const planeHeight = 4;

  const TEXTURE_WIDTH = 512;
  const TEXTURE_HEIGHT = 128;

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

  const textureLoader = new THREE.TextureLoader();

  textureLoader.load(
    "./src/assets/wallpaper.jpg",
    (sumatraTex) => {
      sumatraTex.flipY = false;
      sumatraTex.encoding = THREE.sRGBEncoding;
      sumatraTex.wrapS = THREE.RepeatWrapping;
      sumatraTex.wrapT = THREE.RepeatWrapping;

      separatorBlock.traverse((child) => {
        if (isWall(child) && child.position.x < 0) {
          applyWallTexture(child, sumatraTex);
        }
      });
    },
    undefined,
    (err) => console.error("Error loading Sumatra texture:", err)
  );

  textureLoader.load(
    "./src/assets/wallpaper.jpg",
    (jawaTex) => {
      jawaTex.flipY = false;
      jawaTex.encoding = THREE.sRGBEncoding;
      jawaTex.wrapS = THREE.RepeatWrapping;
      jawaTex.wrapT = THREE.RepeatWrapping;

      separatorBlock.traverse((child) => {
        if (isWall(child) && child.position.x > 0) {
          applyWallTexture(child, jawaTex);
        }
      });
    },
    undefined,
    (err) => console.error("Error loading Jawa texture:", err)
  );

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
