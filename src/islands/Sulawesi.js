import * as THREE from "three";
import { createBlock } from "../utils/createBlock.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createClickableObject } from "../utils/createClickableObject.js";
import BADIK_CONTENT from "../content/sulawesi_badik.js";
import KECAPI_CONTENT from "../content/sulawesi_kecapi.js";
import TORAJA_CONTENT from "../content/sulawesi_adat_toraja.js";

export function createSulawesi(clickableObjectsArray) {
  const sulawesiBlock = createBlock("Sulawesi");

  // Tag walls for texturing
  sulawesiBlock.children.forEach((child) => {
    if (child.isMesh && !child.userData.isWalkable) {
      child.userData.isWall = true;
    }
  });

  const zPositions = [
    {
      z: 0,
      model: "./src/assets/sulawesi_badik.glb",
      content: BADIK_CONTENT,
      name: "Sulawesi-Badik",
    },
    {
      z: 35,
      model: "./src/assets/sulawesi_kecapi.glb",
      content: KECAPI_CONTENT,
      name: "Sulawesi-Kecapi",
    },
    {
      z: -35,
      model: "./src/assets/sulawesi_adat_toraja.glb",
      content: TORAJA_CONTENT,
      name: "Sulawesi-Toraja",
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

            artifact.rotation.set(-Math.PI / 2, 0, 0);
            artifact.scale.set(15, 15, 15);
            artifact.position.set(0, 1.0, 0.35);

            console.log("Badik loaded:", artifact);
          } else if (name.includes("Kecapi")) {
            // Rotate to match Badik (extending right)
            artifact.rotation.set(0, 0, 0);
            artifact.scale.set(0.05, 0.05, 0.05);
            // Position to sit inside the case
            artifact.position.set(0, 0.5, 0);

            artifact.traverse((child) => {
              if (child.isMesh) {
                child.material.side = THREE.DoubleSide;
                child.material.transparent = false;
                child.material.opacity = 1;
                child.material.depthWrite = true;
                // Disable glass-like effects
                if (child.material.transmission) child.material.transmission = 0;
                child.material.metalness = 0.3;
                child.material.roughness = 0.7;
              }
            });
          } else if (name.includes("Toraja")) {
            artifact.scale.set(3.0, 3.0, 3.0);
            artifact.position.set(0, 0.8, 0);
            artifact.rotation.y = Math.PI / 2;
            artifact.traverse((child) => {
              if (child.isMesh) {
                child.material.side = THREE.DoubleSide;
              }
            });
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

  const wallTextureLoader = new THREE.TextureLoader();
  wallTextureLoader.load(
    "./src/assets/sulawesi_batik_toraja.jpg",
    (baseTexture) => {
      baseTexture.flipY = false;
      baseTexture.encoding = THREE.sRGBEncoding;
      baseTexture.wrapS = THREE.RepeatWrapping;
      baseTexture.wrapT = THREE.RepeatWrapping;

      const REPEAT_UNIT_WIDTH = 10;
      const REPEAT_UNIT_HEIGHT = 10;

      sulawesiBlock.traverse((child) => {
        if (child.isMesh && child.userData && child.userData.isWall) {
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
      console.error("Error loading Sulawesi wall texture:", error);
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
