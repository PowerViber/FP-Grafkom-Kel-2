import * as THREE from "three";
import { setupScene } from "./scene.js";
import { setupCamera } from "./camera.js";
import { setupRenderer } from "./renderer.js";
import { FPSController } from "./controls/FPSController.js";
import { setMasterVolume } from "./utils/audioManager.js";
import { POSITIONS, ISLAND_DEPTH, CAMERA_Y_OFFSET } from "./constants.js";

import {
  createSumatra,
  playSumatraMusic,
  pauseSumatraMusic,
} from "./islands/Sumatra.js";
import { createJawa, playJawaMusic, pauseJawaMusic } from "./islands/Jawa.js";
import {
  createKalimantan,
  playKalimantanMusic,
  pauseKalimantanMusic,
} from "./islands/Kalimantan.js";
import {
  createSulawesi,
  playSulawesiMusic,
  pauseSulawesiMusic,
} from "./islands/Sulawesi.js";
import {
  createPapua,
  playPapuaMusic,
  pausePapuaMusic,
} from "./islands/Papua.js";

import { createSeparatorSumatraJawa } from "./separators/SeparatorSumatraJawa.js";
import { createSeparatorJawaKalimantan } from "./separators/SeparatorJawaKalimantan.js";
import { createSeparatorKalimantanSulawesi } from "./separators/SeparatorKalimantanSulawesi.js";
import { createSeparatorSulawesiPapua } from "./separators/SeparatorSulawesiPapua.js";

import { showModal, hideModal } from "./ui/modal.js";
import { closeInspectMode } from "./ui/inspectMode.js";

let camera, scene, renderer, controller;
const clock = new THREE.Clock();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let clickableMeshes = [];
let allCollidableMeshes = [];
let currentSection = null; // Track which section the player is in

let hoveredObject = null;
const HOVER_COLOR = 0xffff00;

function init() {
  const container = document.body;

  scene = setupScene();
  camera = setupCamera(window.innerWidth / window.innerHeight);
  renderer = setupRenderer(container, window.innerWidth, window.innerHeight);

  window.addEventListener("resize", onWindowResize, false);

  renderer.domElement.addEventListener("mousedown", onMouseDown, false);

  allCollidableMeshes = composeMuseum(scene, clickableMeshes);

  controller = new FPSController(
    camera,
    renderer.domElement,
    allCollidableMeshes
  );
  scene.add(controller.controls.getObject());

  const instructions = document.getElementById("instructions");
  const blocker = document.getElementById("blocker");

  controller.controls.addEventListener("lock", function () {
    blocker.style.display = "none";
    controller.enabled = true;
  });

  controller.controls.addEventListener("unlock", function () {
    blocker.style.display = "flex";
    controller.enabled = false;
  });

  instructions.addEventListener("click", function () {
    controller.controls.lock();
  });

  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");
  const closeSettingsBtn = document.getElementById("close-settings");
  const volumeSlider = document.getElementById("volume-slider");
  const speedSlider = document.getElementById("speed-slider");

  // Open Settings
  settingsBtn.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");
    // Optional: Pause game/unlock controls if needed
    if (controller) controller.controls.unlock();
  });

  // Close Settings
  closeSettingsBtn.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
    if (controller) controller.controls.lock(); // Go back to game
  });

  // Slider Logic
  volumeSlider.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    setMasterVolume(value); // This updates ALL sounds instantly!
  });

  speedSlider.addEventListener("input", (e) => {
    const newSpeed = parseFloat(e.target.value);

    if (controller) {
      controller.moveSpeed = newSpeed;
    }
  });

  const teleportBtns = document.querySelectorAll(".teleport-btn");
  teleportBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const islandName = e.target.getAttribute("data-island");
      const targetPos = POSITIONS[islandName];

      if (targetPos && controller) {
        // Calculate Entrance Position
        const spawnX = targetPos.x;
        const spawnY = CAMERA_Y_OFFSET;
        // Enter slightly into the island
        const spawnZ = targetPos.z + ISLAND_DEPTH / 2 - 5;

        // Teleport the player
        controller.controls.getObject().position.set(spawnX, spawnY, spawnZ);

        // Stop movement momentum
        if (controller.velocity) {
          controller.velocity.set(0, 0, 0);
        }

        console.log(`Teleported to ${islandName}`);

        // Close modal and lock controls
        if (settingsModal) settingsModal.classList.add("hidden");
        controller.controls.lock();
      }
    });
  });

  animate();
}

/**
 * Composes the entire museum structure, positioning each block.
 * @param {THREE.Scene} scene - The main Three.js scene.
 * @param {Array<THREE.Mesh>} clickableMeshes - Array to store interactive meshes.
 * @returns {Array<THREE.Mesh>} An array of meshes that should be used for collision detection.
 */
function composeMuseum(scene, clickableMeshes) {
  const collidableMeshes = [];

  const blockCreators = [
    { name: "Sumatra", creator: createSumatra },
    { name: "SeparatorSumatraJawa", creator: createSeparatorSumatraJawa },
    { name: "Jawa", creator: createJawa },
    { name: "SeparatorJawaKalimantan", creator: createSeparatorJawaKalimantan },
    { name: "Kalimantan", creator: createKalimantan },
    {
      name: "SeparatorKalimantanSulawesi",
      creator: createSeparatorKalimantanSulawesi,
    },
    { name: "Sulawesi", creator: createSulawesi },
    { name: "SeparatorSulawesiPapua", creator: createSeparatorSulawesiPapua },
    { name: "Papua", creator: createPapua },
  ];

  blockCreators.forEach(({ name, creator }) => {
    const block = creator(clickableMeshes);

    const { x, y, z } = POSITIONS[name];
    block.position.set(x, y, z);

    scene.add(block);

    block.children.forEach((child) => {
      if (child.geometry && child.geometry.type === "BoxGeometry") {
        collidableMeshes.push(child);
      }
    });
  });

  createMuseumRoof(scene);

  return collidableMeshes;
}

/**
 * Creates a single, large roof (ceiling) that covers the entire length and width
 * of the assembled museum by calculating the total structure bounds.
 * @param {THREE.Scene} scene - The main Three.js scene containing all blocks.
 */
function createMuseumRoof(scene) {
  const overallBox = new THREE.Box3().setFromObject(scene);

  const size = new THREE.Vector3();
  overallBox.getSize(size);

  const center = new THREE.Vector3();
  overallBox.getCenter(center);

  const ROOF_CEILING_HEIGHT = 15;
  const ROOF_THICKNESS = 0.5;

  const roofGeometry = new THREE.BoxGeometry(size.x, ROOF_THICKNESS, size.z);

  const roofMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.name = "MuseumRoof";

  roof.position.set(
    center.x,
    ROOF_CEILING_HEIGHT + ROOF_THICKNESS / 2,
    center.z
  );

  scene.add(roof);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseDown() {
  if (!controller || !controller.enabled) {
    return;
  }

  mouse.x = 0;
  mouse.y = 0;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(clickableMeshes, true);

  const clickableHit = intersects.find((i) => i.object.userData.isClickable);

  if (clickableHit) {
    const artifact = clickableHit.object;

    // Check for sound playback feature first
    if (artifact.userData.soundPath) {
      const audio = new Audio(artifact.userData.soundPath);
      audio.play().catch((err) => console.error("Error playing audio:", err));
      return; // Don't show modal if playing sound
    }

    controller.suppressInstructions = true;

    controller.controls.unlock();
    controller.enabled = false;

    // Pause current section music if clickable got hit
    if (currentSection === "Sumatra") pauseSumatraMusic();
    if (currentSection === "Jawa") pauseJawaMusic();
    if (currentSection === "Kalimantan") pauseKalimantanMusic();
    if (currentSection === "Sulawesi") pauseSulawesiMusic();
    if (currentSection === "Papua") pausePapuaMusic();

    // Pass inspect data to modal if available
    const inspectData = artifact.userData.inspectData
      ? {
          modelPath: artifact.userData.modelPath,
          ...artifact.userData.inspectData,
        }
      : null;

    showModal(artifact.userData.modalContent, inspectData);
  }
}

window.closeExhibitModal = function () {
  hideModal();

  if (controller) {
    controller.controls.lock();
    controller.enabled = true;

    // Resume Sumatra background music if player is in Sumatra section
    const playerZ = controller.controls.getObject().position.z;

    // Check Sumatra
    if (
      playerZ >= POSITIONS.Sumatra.z - 50 &&
      playerZ <= POSITIONS.Sumatra.z + 50
    ) {
      playSumatraMusic();
    }
    // Check Jawa
    else if (
      playerZ >= POSITIONS.Jawa.z - 50 &&
      playerZ <= POSITIONS.Jawa.z + 50
    ) {
      playJawaMusic();
    }
    // Check Kalimantan
    else if (
      playerZ >= POSITIONS.Kalimantan.z - 50 &&
      playerZ <= POSITIONS.Kalimantan.z + 50
    ) {
      playKalimantanMusic();
    }
    // Check Sulawesi
    else if (
      playerZ >= POSITIONS.Sulawesi.z - 50 &&
      playerZ <= POSITIONS.Sulawesi.z + 50
    ) {
      playSulawesiMusic();
    }
    // Check Papua
    else if (
      playerZ >= POSITIONS.Papua.z - 50 &&
      playerZ <= POSITIONS.Papua.z + 50
    ) {
      playPapuaMusic();
    }
  }
};

// Global function for inspect mode
window.closeInspectMode = function () {
  closeInspectMode();

  if (controller) {
    controller.controls.lock();
    controller.enabled = true;

    // Resume Sumatra background music if player is in Sumatra section
    const playerZ = controller.controls.getObject().position.z;

    // Check Sumatra
    if (
      playerZ >= POSITIONS.Sumatra.z - 50 &&
      playerZ <= POSITIONS.Sumatra.z + 50
    ) {
      playSumatraMusic();
    }
    // Check Jawa
    else if (
      playerZ >= POSITIONS.Jawa.z - 50 &&
      playerZ <= POSITIONS.Jawa.z + 50
    ) {
      playJawaMusic();
    }
    // Check Kalimantan
    else if (
      playerZ >= POSITIONS.Kalimantan.z - 50 &&
      playerZ <= POSITIONS.Kalimantan.z + 50
    ) {
      playKalimantanMusic();
    }
    // Check Sulawesi
    else if (
      playerZ >= POSITIONS.Sulawesi.z - 50 &&
      playerZ <= POSITIONS.Sulawesi.z + 50
    ) {
      playSulawesiMusic();
    }
    // Check Papua
    else if (
      playerZ >= POSITIONS.Papua.z - 50 &&
      playerZ <= POSITIONS.Papua.z + 50
    ) {
      playPapuaMusic();
    }
  }
};

function updateCrosshairInteraction(time) {
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

  const intersects = raycaster.intersectObjects(clickableMeshes, true);
  const clickableHit = intersects.find((i) => i.object.userData.isClickable);

  if (clickableHit) {
    const object = clickableHit.object;

    if (hoveredObject !== object) {
      if (hoveredObject) {
        resetObjectMaterial(hoveredObject);
      }

      hoveredObject = object;

      // Ensure material exists and has emissive property
      if (hoveredObject.material) {
        // If material doesn't have emissive, ensure it's added
        if (!hoveredObject.material.emissive) {
          // Convert to MeshStandardMaterial or MeshPhongMaterial if needed
          if (hoveredObject.material.isMeshBasicMaterial) {
            const oldMaterial = hoveredObject.material;
            hoveredObject.material = new THREE.MeshPhongMaterial({
              map: oldMaterial.map,
              color: oldMaterial.color,
              emissive: new THREE.Color(0x000000),
              emissiveIntensity: 0,
            });
          } else if (!hoveredObject.material.emissive) {
            hoveredObject.material.emissive = new THREE.Color(0x000000);
            hoveredObject.material.emissiveIntensity = 0;
          }
        }

        // Save original emissive color
        if (!hoveredObject.userData.originalEmissive) {
          hoveredObject.userData.originalEmissive =
            hoveredObject.material.emissive.clone();
        }

        // Apply hover color
        hoveredObject.material.emissive.setHex(HOVER_COLOR);
        hoveredObject.material.needsUpdate = true;
      }
    }

    // Apply pulse effect
    if (
      hoveredObject &&
      hoveredObject.material &&
      hoveredObject.material.emissive
    ) {
      const pulse = Math.sin(time * 5) * 0.1 + 0.3;
      hoveredObject.material.emissiveIntensity = pulse;
    }
  } else {
    if (hoveredObject) {
      resetObjectMaterial(hoveredObject);
      hoveredObject = null;
    }
  }
}

function resetObjectMaterial(object) {
  // Safety check: ensure object has material and emissive properties
  if (!object || !object.material || !object.material.emissive) {
    return;
  }

  if (object.userData.originalEmissive) {
    object.material.emissive.copy(object.userData.originalEmissive);
  } else {
    object.material.emissive.setHex(0x000000);
  }
  object.material.emissiveIntensity = 0;
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  if (controller && controller.enabled) {
    controller.update(delta);
    updateCrosshairInteraction(time);

    // Auto-play/pause Sumatra background music based on player position
    const playerZ = controller.controls.getObject().position.z;
    // Define the range for every island
    const inSumatra =
      playerZ >= POSITIONS.Sumatra.z - 50 &&
      playerZ <= POSITIONS.Sumatra.z + 50;
    const inJawa =
      playerZ >= POSITIONS.Jawa.z - 50 && playerZ <= POSITIONS.Jawa.z + 50;
    const inKalimantan =
      playerZ >= POSITIONS.Kalimantan.z - 50 &&
      playerZ <= POSITIONS.Kalimantan.z + 50;
    const inSulawesi =
      playerZ >= POSITIONS.Sulawesi.z - 50 &&
      playerZ <= POSITIONS.Sulawesi.z + 50;
    const inPapua =
      playerZ >= POSITIONS.Papua.z - 50 && playerZ <= POSITIONS.Papua.z + 50;

    // Check which section we are in
    let newSection = null;
    if (inSumatra) newSection = "Sumatra";
    else if (inJawa) newSection = "Jawa";
    else if (inKalimantan) newSection = "Kalimantan";
    else if (inSulawesi) newSection = "Sulawesi";
    else if (inPapua) newSection = "Papua";

    // If we changed sections (entered a new one or left one)
    if (newSection !== currentSection) {
      // 1. Stop the OLD music
      if (currentSection === "Sumatra") pauseSumatraMusic();
      if (currentSection === "Jawa") pauseJawaMusic();
      if (currentSection === "Kalimantan") pauseKalimantanMusic();
      if (currentSection === "Sulawesi") pauseSulawesiMusic();
      if (currentSection === "Papua") pausePapuaMusic();

      // 2. Start the NEW music
      if (newSection === "Sumatra") playSumatraMusic();
      if (newSection === "Jawa") playJawaMusic();
      if (newSection === "Kalimantan") playKalimantanMusic();
      if (newSection === "Sulawesi") playSulawesiMusic();
      if (newSection === "Papua") playPapuaMusic();

      // Update tracker
      currentSection = newSection;
    }
  }

  // Simple preview animation: rotate any model marked for preview.
  scene.traverse((obj) => {
    if (obj.userData && obj.userData.preview) {
      obj.rotation.y += delta * 0.5; // rotate slowly
    }
  });

  renderer.render(scene, camera);
}

init();
