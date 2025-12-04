import * as THREE from "three";
import { createBlock } from "../utils/createBlock.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createClickableObject } from "../utils/createClickableObject.js";
import BADIK_CONTENT from "../content/sulawesi_badik.js"; 

export function createSulawesi(clickableObjectsArray) {
  const sulawesiBlock = createBlock("Sulawesi");

  const zPositions = [
    {
      z: 0,
      model: "./src/assets/sulawesi_badik.glb",
      content: BADIK_CONTENT,
      name: "Sulawesi-Badik",
    },
  ];

  const xPosition = -7;

  // Hitbox
  zPositions.forEach(({ z }) => {
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitbox.position.set(xPosition, 2.5, z);
    sulawesiBlock.add(hitbox);
  });

  const loader = new GLTFLoader();

  loader.load("./src/assets/display_case.glb", (gltf) => {
    const baseModel = gltf.scene;

    zPositions.forEach(({ z, model, content, name }) => {
      const displayCase = baseModel.clone();
      displayCase.scale.set(3.5, 3.5, 3.5);
      displayCase.position.set(xPosition, 0, z);

      createClickableObject(model, content, clickableObjectsArray)
        .then((artifact) => {
          if (name.includes("Badik")) {
            // --- AREA DEBUGGING ---
            
            artifact.rotation.set(0, 0, 0); 
            
            artifact.scale.set(15, 15, 15); 
            
            artifact.position.set(0, 0.2, 0);
            
            console.log("Badik loaded:", artifact);
          }

          artifact.name = name;
          displayCase.add(artifact);
        })
        .catch((error) =>
          console.error(`GAGAL MEMUAT ARTEFAK: ${name}`, error)
        );

      sulawesiBlock.add(displayCase);
    });
  });

  // Texture Lantai (Kode standar)
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

  sulawesiBlock.traverse((child) => {
    if (child.isMesh && child.userData && child.userData.isWalkable) {
      if (child.material) {
        child.material.map = floorTexture;
        child.material.needsUpdate = true;
      }
    }
  });

  return sulawesiBlock;
}
