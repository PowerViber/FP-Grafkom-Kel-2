import { createBlock } from "../utils/createBlock.js";
import {
  SEPARATOR_BEND_SPAN,
  SEPARATOR_BEND_THICKNESS,
  WALL_THICKNESS,
} from "../constants.js";
import { createFramedSign } from "../utils/createFramedSign.js";
import { applyWallTexture, isWall } from "../utils/wallHelper.js";
import * as THREE from "three";

export function createSeparatorKalimantanSulawesi() {
  const separatorBlock = createBlock("SeparatorKalimantanSulawesi");

  const W = SEPARATOR_BEND_SPAN;
  const D = SEPARATOR_BEND_THICKNESS;

  const xPositionRight = W / 2 + WALL_THICKNESS / 2;
  const xPositionLeft = -W / 2 - WALL_THICKNESS / 2;
  const zPosition = 0;

  const planeWidth = D - 2;
  const planeHeight = 4;

  // SULAWESI SIGN (Right Side)
  const sulawesiSign = createFramedSign("SULAWESI", planeWidth, planeHeight, "./src/separators/pulau/pulau_sulawesi.jpg");
  sulawesiSign.position.set(
    xPositionRight - WALL_THICKNESS / 2 - 0.3,
    5,
    zPosition
  );
  sulawesiSign.rotation.y = -Math.PI / 2;
  separatorBlock.add(sulawesiSign);

  // KALIMANTAN SIGN (Left Side)
  const kalimantanSign = createFramedSign(
    "KALIMANTAN",
    planeWidth,
    planeHeight,
    "./src/separators/pulau/pulau_kalimantan.jpg"
  );
  kalimantanSign.position.set(
    xPositionLeft + WALL_THICKNESS / 2 + 0.3,
    5,
    zPosition
  );
  kalimantanSign.rotation.y = Math.PI / 2;
  separatorBlock.add(kalimantanSign);

  const textureLoader = new THREE.TextureLoader();

  textureLoader.load(
    "./src/assets/wallpaper.jpg",
    (kalimantanTex) => {
      kalimantanTex.flipY = false;
      kalimantanTex.encoding = THREE.sRGBEncoding;
      kalimantanTex.wrapS = THREE.RepeatWrapping;
      kalimantanTex.wrapT = THREE.RepeatWrapping;

      separatorBlock.traverse((child) => {
        if (isWall(child) && child.position.x < 0) {
          applyWallTexture(child, kalimantanTex);
        }
      });
    },
    undefined,
    (err) => console.error("Error loading Kalimantan texture:", err)
  );

  textureLoader.load(
    "./src/assets/wallpaper.jpg",
    (sulawesiTex) => {
      sulawesiTex.flipY = false;
      sulawesiTex.encoding = THREE.sRGBEncoding;
      sulawesiTex.wrapS = THREE.RepeatWrapping;
      sulawesiTex.wrapT = THREE.RepeatWrapping;

      separatorBlock.traverse((child) => {
        if (isWall(child) && child.position.x > 0) {
          applyWallTexture(child, sulawesiTex);
        }
      });
    },
    undefined,
    (err) => console.error("Error loading Sulawesi texture:", err)
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
