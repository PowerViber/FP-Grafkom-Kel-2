import * as THREE from "three";
import { createBlock } from "../utils/createBlock.js";

export function createKalimantan() {
  const kalimantanBlock = createBlock("Kalimantan"); // Brown/Orange Floor

  // TODO: Add decorations for Kalimantan here, relative to the block's center (0, H/2, 0).

  const textureLoader = new THREE.TextureLoader();
  const floorTexture = textureLoader.load(
    "./src/assets/floor_texture.jpg",
    (tex) => {
      tex.flipY = false;
      tex.encoding = THREE.sRGBEncoding;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 8);
    }
  );

  kalimantanBlock.traverse((child) => {
    if (child.isMesh && child.userData && child.userData.isWalkable) {
      if (child.material) {
        child.material.map = floorTexture;
        child.material.needsUpdate = true;
      }
    }
  });

  return kalimantanBlock;
}
