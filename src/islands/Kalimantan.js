import * as THREE from "three";
import { createBlock } from "../utils/createBlock.js";
import { applyWallTexture, isWall } from "../utils/wallHelper.js";
import { registerSound } from "../utils/audioManager.js";

let kalimantanBackgroundMusic = null;

export function createKalimantan() {
  const kalimantanBlock = createBlock("Kalimantan");

   // Ganti jadi audio yang sesuai daerah kalian
  kalimantanBackgroundMusic = new Audio("./src/assets/sumatra_pariaman.mp3");
  kalimantanBackgroundMusic.loop = true;
  //Ganti volume default daerah kalian disini
  registerSound(kalimantanBackgroundMusic, 0.3);
  kalimantanBackgroundMusic.preload = "auto";
  
  // Add error handler to prevent crashes
  kalimantanBackgroundMusic.addEventListener('error', (e) => {
    console.error('Error loading Kalimantan background music:', e);
  });

  // Store reference in userData
  kalimantanBlock.userData.backgroundMusic = kalimantanBackgroundMusic;

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
    if (kalimantanBackgroundMusic.readyState >= 2) { // HAVE_CURRENT_DATA or higher
      kalimantanBackgroundMusic.play().catch(err => {
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