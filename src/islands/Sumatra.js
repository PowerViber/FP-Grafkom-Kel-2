import * as THREE from "three";
import { createBlock } from "../utils/createBlock.js";

export function createSumatra() {
  const sumatraBlock = createBlock("Sumatra");

  const textureLoader = new THREE.TextureLoader();

  const REPEAT_UNIT_WIDTH = 10;
  const REPEAT_UNIT_HEIGHT = 10;

  textureLoader.load(
    "./src/assets/sumatra_kain_songket.jpg",
    (baseTexture) => {
      baseTexture.flipY = false;
      baseTexture.encoding = THREE.sRGBEncoding;
      baseTexture.wrapS = THREE.RepeatWrapping;
      baseTexture.wrapT = THREE.RepeatWrapping;

      sumatraBlock.traverse((child) => {
        if (child.isMesh && child.userData && !child.userData.isWalkable) {
          const geometry = child.geometry;
          if (!geometry.boundingBox) {
            geometry.computeBoundingBox();
          }
          const size = geometry.boundingBox.getSize(new THREE.Vector3());

          const wallHeight = size.y;
          const wallLength = Math.max(size.x, size.z);

          const repeatS = wallLength / REPEAT_UNIT_WIDTH;
          const repeatT = wallHeight / REPEAT_UNIT_HEIGHT;

          const uniqueTexture = baseTexture.clone();
          uniqueTexture.repeat.set(repeatS, repeatT);

          child.material = new THREE.MeshPhongMaterial({ map: uniqueTexture });
          child.material.needsUpdate = true;
        }
      });
    },
    undefined,
    (error) => {
      console.error("Error loading Sumatra wall texture:", error);
    }
  );

  textureLoader.load(
    "./src/assets/jawa_floor_texture.jpg",
    (floorTexture) => {
      floorTexture.flipY = false;
      floorTexture.encoding = THREE.sRGBEncoding;
      floorTexture.wrapS = THREE.RepeatWrapping;
      floorTexture.wrapT = THREE.RepeatWrapping;
      floorTexture.repeat.set(4, 4);

      sumatraBlock.traverse((child) => {
        if (child.isMesh && child.userData && child.userData.isWalkable) {
          if (child.material) {
            child.material.map = floorTexture;
            child.material.needsUpdate = true;
          }
        }
      });
    },
    undefined,
    (error) => {
      console.error("Error loading Sumatra floor texture:", error);
    }
  );

  return sumatraBlock;
}
