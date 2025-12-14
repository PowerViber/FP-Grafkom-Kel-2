import * as THREE from "three";
import { createBlock } from "../utils/createBlock.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const textureLoader = new THREE.TextureLoader();

export function createPapua() {
  const papuaBlock = createBlock("Papua"); // Olive Green Floor

  // TODO: Add decorations for Papua here, relative to the block's center (0, H/2, 0).
  // 1. Define the positions you want
  const zPositions = [35, 10, -25];
  const xPosition = -7;

  zPositions.forEach((z) => {
    // --- HITBOX ---
    // Create a separate hitbox for each model
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ visible: false })
    );

    // Make sure the hitbox matches the model's position
    hitbox.position.set(xPosition, 0, z);
    papuaBlock.add(hitbox);
  });

  const loader = new GLTFLoader();

  loader.load(
    "./src/assets/display_case.glb",
    (gltf) => {
      const baseModel = gltf.scene;

      // 2. Loop through each Z position
      zPositions.forEach((z) => {
        // --- VISUAL MODEL ---
        // We use .clone() so we don't have to download the file 3 times
        const modelClone = baseModel.clone();
        modelClone.scale.set(3.5, 3.5, 3.5);
        modelClone.position.set(xPosition, 0, z);

        if (z === 35) {
          loader.load(
            "./src/assets/african_drum.glb",
            (drumGltf) => {
              const drum = drumGltf.scene;

              drum.scale.set(0.3, 0.3, 0.3); // Scale relative to parent scale
              drum.position.set(0, 0.5, 0); // Adjust Y to sit on surface

              modelClone.add(drum);
            },
            undefined,
            (err) => console.error("Error loading Drum:", err)
          );

          loader.load(
            "./src/assets/curtain_fabric.glb",
            (fabricGltf) => {
              const fabric = fabricGltf.scene;

              // Modify fabric and add it to scene
              fabric.scale.set(0.05, 0.05, 0.05);
              fabric.position.set(-10.5, 0, z);
              fabric.rotation.y = Math.PI / 2;
              papuaBlock.add(fabric);

              // Add texture to fabric
              const fabricTexture = textureLoader.load(
                "./src/assets/curtain_texture_1.jpg"
              );
              fabricTexture.flipY = false;
              fabric.traverse((child) => {
                if (child.isMesh) {
                  child.material.map = fabricTexture;
                  child.material.needsUpdate = true;
                }
              });
            },
            undefined,
            (err) => console.error("Error loading Fabric:", err)
          );
        }

        if (z === 10) {
          loader.load(
            "./src/assets/sea_shell.glb",
            (seaShellGltf) => {
              const sea_shell = seaShellGltf.scene;

              sea_shell.scale.set(5, 5, 5); // Scale relative to parent scale
              sea_shell.position.set(0, 0.5, 0); // Adjust Y to sit on surface
              sea_shell.rotation.y = Math.PI;

              modelClone.add(sea_shell);
            },
            undefined,
            (err) => console.error("Error loading sea_shell:", err)
          );
        }

        papuaBlock.add(modelClone);
      });
    },
    undefined,
    (error) => {
      console.error("Error loading GLB:", error);
    }
  );

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

  papuaBlock.traverse((child) => {
    if (child.isMesh && child.userData && child.userData.isWalkable) {
      if (child.material) {
        child.material.map = floorTexture;
        child.material.needsUpdate = true;
      }
    }
  });

  return papuaBlock;
}
