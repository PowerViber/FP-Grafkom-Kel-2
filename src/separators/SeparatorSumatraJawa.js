import { createBlock } from "../utils/createBlock.js";
import {
  SEPARATOR_BEND_SPAN,
  SEPARATOR_BEND_THICKNESS,
  WALL_THICKNESS,
} from "../constants.js";
import { createFramedSign } from "../utils/createFramedSign.js";
import { applyWallTexture, isWall } from "../utils/wallHelper.js";
import * as THREE from "three";

export function createSeparatorSumatraJawa() {
  const separatorBlock = createBlock("SeparatorSumatraJawa");

  const W = SEPARATOR_BEND_SPAN;
  const D = SEPARATOR_BEND_THICKNESS;

  const xPositionRight = W / 2 + WALL_THICKNESS / 2;
  const xPositionLeft = -W / 2 - WALL_THICKNESS / 2;
  const zPosition = 0;

  const planeWidth = D - 2;
  const planeHeight = 4;

  // JAWA SIGN (Right Side)
  const jawaSign = createFramedSign("JAWA", planeWidth, planeHeight, "./src/separators/pulau/pulau_jawa.jpg");
  jawaSign.position.set(
    xPositionRight - WALL_THICKNESS / 2 - 0.3,
    5,
    zPosition
  );
  jawaSign.rotation.y = -Math.PI / 2;
  separatorBlock.add(jawaSign);

  // SUMATRA SIGN (Left Side)
  const sumatraSign = createFramedSign("SUMATRA", planeWidth, planeHeight, "./src/separators/pulau/pulau_sumatra.jpg");
  sumatraSign.position.set(
    xPositionLeft + WALL_THICKNESS / 2 + 0.3,
    5,
    zPosition
  );
  sumatraSign.rotation.y = Math.PI / 2;
  separatorBlock.add(sumatraSign);

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
