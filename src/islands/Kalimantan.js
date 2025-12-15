import * as THREE from "three";
import { createBlock } from "../utils/createBlock.js";
import { applyWallTexture, isWall } from "../utils/wallHelper.js";
import { registerSound } from "../utils/audioManager.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createClickableObject } from "../utils/createClickableObject.js";
import MANDAU_CONTENT from "../content/kalimantan_mandau.js";
import SAPEK_CONTENT from "../content/kalimantan_sapek.js";
import SHIELD_CONTENT from "../content/kalimantan_shield.js";
import REBAB_CONTENT from "../content/kalimantan_rebab.js";

let kalimantanBackgroundMusic = null;

export function createKalimantan(clickableObjectsArray) {
  const kalimantanBlock = createBlock("Kalimantan");

  // Ganti jadi audio yang sesuai daerah kalian
  kalimantanBackgroundMusic = new Audio("./src/assets/kalimantan_bgm.mp3");
  kalimantanBackgroundMusic.loop = true;
  //Ganti volume default daerah kalian disini
  registerSound(kalimantanBackgroundMusic, 0.3);
  kalimantanBackgroundMusic.preload = "auto";

  // Add error handler to prevent crashes
  kalimantanBackgroundMusic.addEventListener("error", (e) => {
    console.error("Error loading Kalimantan background music:", e);
  });

  // Store reference in userData
  kalimantanBlock.userData.backgroundMusic = kalimantanBackgroundMusic;

  const zPositions = [
    {
      z: 30,
      model: "./src/assets/kalimantan_mandau.glb",
      content: MANDAU_CONTENT,
      name: "Kalimantan-Mandau",
      modelTransform: {
        scale: { x: 15, y: 15, z: 15 },
        position: { x: 0, y: 0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 2, z: Math.PI / 4 },
      },
    },
    {
      z: 10,
      model: "./src/assets/kalimantan_sapek_guitar.glb",
      content: SAPEK_CONTENT,
      name: "Kalimantan-Sapek",
      modelTransform: {
        scale: { x: 0.4, y: 0.4, z: 0.4 },
        position: { x: -0.5, y: 0.7, z: 0 },
        rotation: { x: 0, y: 0, z: -Math.PI / 2 + Math.PI / 8 },
      },
    },
    {
      z: -10,
      model: "./src/assets/kalimantan_tameng_dayak_shield.glb",
      content: SHIELD_CONTENT,
      name: "Kalimantan-Shield",
      modelTransform: {
        scale: { x: 0.2, y: 0.2, z: 0.2 },
        position: { x: 0, y: 0.8, z: 0 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
      },
    },
    {
      z: -30,
      model: "./src/assets/kalimantan_rebab_adr_kltn_cheisa_25.glb",
      content: REBAB_CONTENT,
      name: "Kalimantan-Rebab",
      modelTransform: {
        scale: { x: 0.016, y: 0.016, z: 0.016 },
        position: { x: 0, y: 0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
      },
    },
  ];

  const xPosition = -7;

  zPositions.forEach(({ z }) => {
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitbox.position.set(xPosition, 2.5, z);
    kalimantanBlock.add(hitbox);
  });

  const loader = new GLTFLoader();

  loader.load("./src/assets/display_case.glb", (gltf) => {
    const baseModel = gltf.scene;

    zPositions.forEach(({ z, model, content, name, modelTransform }) => {
      const displayCase = baseModel.clone();
      displayCase.scale.set(3.5, 3.5, 3.5);
      displayCase.position.set(xPosition, 0, z);

      createClickableObject(model, content, clickableObjectsArray)
        .then((artifact) => {
          // Individual scaling and positioning for each artifact loaded from config
          if (modelTransform) {
            const { scale, position: mPos, rotation } = modelTransform;
            if (scale) artifact.scale.set(scale.x, scale.y, scale.z);
            if (mPos) artifact.position.set(mPos.x, mPos.y, mPos.z);
            if (rotation)
              artifact.rotation.set(rotation.x, rotation.y, rotation.z);
          }

          artifact.name = name;
          displayCase.add(artifact);
        })
        .catch((error) =>
          console.error(`Failed to load and wrap ${name}`, error)
        );

      kalimantanBlock.add(displayCase);
    });
  });

  const textureLoader = new THREE.TextureLoader();

  textureLoader.load(
    "./src/assets/wallpaper.jpg",
    (baseTexture) => {
      baseTexture.flipY = false;
      baseTexture.encoding = THREE.sRGBEncoding;
      baseTexture.wrapS = THREE.RepeatWrapping;
      baseTexture.wrapT = THREE.RepeatWrapping;

      kalimantanBlock.traverse((child) => {
        if (isWall(child)) {
          applyWallTexture(child, baseTexture);
        }
      });
    },
    undefined,
    (error) => {
      console.error("Error loading Kalimantan wall texture:", error);
    }
  );

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

// Export functions to control background music
export function playKalimantanMusic() {
  if (kalimantanBackgroundMusic && kalimantanBackgroundMusic.paused) {
    // Only play if audio is ready to prevent lag
    if (kalimantanBackgroundMusic.readyState >= 2) {
      // HAVE_CURRENT_DATA or higher
      kalimantanBackgroundMusic.play().catch((err) => {
        console.log("Sumatra music play failed:", err);
      });
    }
  }
}

export function pauseKalimantanMusic() {
  if (kalimantanBackgroundMusic && !kalimantanBackgroundMusic.paused) {
    kalimantanBackgroundMusic.pause();
  }
}
