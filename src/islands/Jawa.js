import * as THREE from "three";
import { createBlock } from "../utils/createBlock.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createClickableObject } from "../utils/createClickableObject.js";
import SARON_CONTENT from "../content/jawa_saron.js";
import KENDANG_CONTENT from "../content/jawa_kendang.js";
import KERIS_CONTENT from "../content/jawa_keris.js";

export function createJawa(clickableObjectsArray) {
  const jawaBlock = createBlock("Jawa");

  const zPositions = [
    {
      z: 35,
      model: "./src/assets/jawa_kendang.glb",
      content: KENDANG_CONTENT,
      name: "Jawa-Kendang",
    },
    {
      z: 0,
      model: "./src/assets/jawa_keris.glb",
      content: KERIS_CONTENT,
      name: "Jawa-Keris",
    },
    {
      z: -35,
      model: "./src/assets/jawa_saron_degung.glb",
      content: SARON_CONTENT,
      name: "Jawa-Saron",
    },
  ];

  const xPosition = -7;

  zPositions.forEach(({ z }) => {
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitbox.position.set(xPosition, 2.5, z);
    jawaBlock.add(hitbox);
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
          if (name.includes("Kendang")) {
            artifact.scale.set(0.1, 0.1, 0.1);
            artifact.position.set(0, 0.5, 0);
            artifact.rotation.y = Math.PI / 2;
          } else if (name.includes("Keris")) {
            artifact.scale.set(0.5, 0.5, 0.5);
            artifact.position.set(0, 0.5, 0.28);
            artifact.rotation.y = Math.PI / 2;
          } else if (name.includes("Saron")) {
            artifact.scale.set(0.5, 0.5, 0.5);
            artifact.position.set(0, 0.6, 0);
          }

          artifact.name = name;
          displayCase.add(artifact);
        })
        .catch((error) =>
          console.error(`Failed to load and wrap ${name}`, error)
        );

      jawaBlock.add(displayCase);
    });
  });

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

  jawaBlock.traverse((child) => {
    if (child.isMesh && child.userData && child.userData.isWalkable) {
      if (child.material) {
        child.material.map = floorTexture;
        child.material.needsUpdate = true;
      }
    }
  });

  return jawaBlock;
}
