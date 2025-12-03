import * as THREE from "three";
import { createBlock } from "../utils/createBlock.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export function createJawa() {
  const jawaBlock = createBlock("Jawa");

  // Decorations for Jawa: display cases with kendang, keris, and saron.
  const zPositions = [35, 0, -35];
  const xPosition = -7;

  zPositions.forEach((z) => {
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitbox.position.set(xPosition, 0, z);
    jawaBlock.add(hitbox);
  });

  const loader = new GLTFLoader();

  loader.load(
    "./src/assets/display_case.glb",
    (gltf) => {
      const baseModel = gltf.scene;

      zPositions.forEach((z) => {
        const modelClone = baseModel.clone();
        modelClone.scale.set(3.5, 3.5, 3.5);
        modelClone.position.set(xPosition, 0, z);

        // Add specific objects depending on Z position
        if (z === 35) {
          loader.load(
            "./src/assets/jawa_kendang.glb",
            (kendangGltf) => {
              const kendang = kendangGltf.scene;
              kendang.scale.set(0.1, 0.1, 0.1);
              kendang.position.set(0, 0.5, 0);
              kendang.rotation.y = Math.PI / 2;
              modelClone.add(kendang);
            },
            undefined,
            (err) => console.error("Error loading Kendang:", err)
          );
        }

        if (z === 0) {
          loader.load(
            "./src/assets/jawa_keris.glb",
            (kerisGltf) => {
              const keris = kerisGltf.scene;
              keris.scale.set(0.5, 0.5, 0.5);
              keris.position.set(0, 0.5, 0.28);
              keris.rotation.y = Math.PI / 2;
              modelClone.add(keris);
            },
            undefined,
            (err) => console.error("Error loading Keris:", err)
          );
        }

        if (z === -35) {
          loader.load(
            "./src/assets/jawa_saron_degung.glb",
            (saronGltf) => {
              const saron = saronGltf.scene;
              saron.scale.set(0.5, 0.5, 0.5);
              saron.position.set(0, 0.6, 0);
              modelClone.add(saron);
            },
            undefined,
            (err) => console.error("Error loading Saron:", err)
          );
        }

        jawaBlock.add(modelClone);
      });
    },
    undefined,
    (error) => {
      console.error("Error loading GLB:", error);
    }
  );

  // Apply curtain texture to the floor mesh of the Jawa block
  const textureLoader = new THREE.TextureLoader();
  const curtainTexture = textureLoader.load(
    "./src/assets/jawa_floor_texture.jpg",
    (tex) => {
      tex.flipY = false;
      tex.encoding = THREE.sRGBEncoding;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 8);
    }
  );

  jawaBlock.traverse((child) => {
    if (child.isMesh && child.userData && child.userData.isWalkable) {
      if (child.material) {
        child.material.map = curtainTexture;
        child.material.needsUpdate = true;
      }
    }
  });

  return jawaBlock;
}
