import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { registerSound } from "../utils/audioManager.js";

let inspectScene, inspectCamera, inspectRenderer, inspectControls;
let currentAudio = null;
let inspectModel = null;
let currentInteractiveConfig = null;

const modalContainer = document.getElementById("inspect-modal-container");
const container3D = document.getElementById("inspect-3d-container");
const titleEl = document.getElementById("inspect-title");
const subtitleEl = document.getElementById("inspect-subtitle");
const audioBtn = document.getElementById("inspect-audio-btn");

export function showInspectMode(
  modelPath,
  title,
  subtitle,
  audioPath,
  scale = 1,
  interactiveConfig = null
) {
  if (!modalContainer) return;

  // Set title and subtitle
  titleEl.textContent = title;
  subtitleEl.textContent = subtitle;
  currentInteractiveConfig = interactiveConfig;

  // Setup audio button
  if (audioPath) {
    audioBtn.classList.remove("hidden");
    currentAudio = new Audio(audioPath);
    registerSound(currentAudio, 1.0);

    if (
      currentInteractiveConfig &&
      (currentInteractiveConfig.type === "kecapi" ||
        currentInteractiveConfig.type === "jalappa" ||
        currentInteractiveConfig.type === "puikpuik")
    ) {
      // Hide main button, interaction is via clicking model
      audioBtn.classList.add("hidden");
    } else {
      audioBtn.onclick = () => {
        if (currentAudio.paused) {
          currentAudio.play();
          audioBtn.textContent = " Stop Sound";
        } else {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          audioBtn.textContent = " Play Sound";
        }
      };
    }
  } else {
    audioBtn.classList.add("hidden");
    currentAudio = null;
  }

  // Show modal
  modalContainer.style.display = "block";

  // Initialize THREE.js scene
  initInspectScene(modelPath, scale);

  window.addEventListener("keydown", onKeyDown);
}

function onKeyDown(event) {
  if (event.key === "Escape") {
    closeInspectMode();
  }
}

function initInspectScene(modelPath, customScale = 1) {
  // Create scene
  inspectScene = new THREE.Scene();
  inspectScene.background = new THREE.Color(0x808080);

  // Create camera
  const width = window.innerWidth;
  const height = window.innerHeight;
  inspectCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  inspectCamera.position.set(0, 2, 5);

  // Create renderer
  inspectRenderer = new THREE.WebGLRenderer({ antialias: true });
  inspectRenderer.setSize(width, height);
  inspectRenderer.setPixelRatio(window.devicePixelRatio);
  container3D.appendChild(inspectRenderer.domElement);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  inspectScene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
  directionalLight.position.set(5, 10, 7);
  inspectScene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight2.position.set(-5, 5, -5);
  inspectScene.add(directionalLight2);

  // Add OrbitControls for rotation
  inspectControls = new OrbitControls(
    inspectCamera,
    inspectRenderer.domElement
  );
  inspectControls.enableDamping = true;
  inspectControls.dampingFactor = 0.05;
  inspectControls.enableZoom = true;
  inspectControls.enablePan = false;

  if (currentInteractiveConfig && currentInteractiveConfig.type === "kecapi") {
    inspectControls.enableRotate = false;
    inspectControls.enableZoom = false;

    inspectCamera.position.set(0, 3, 2);
    inspectControls.target.set(0, 0, 0);
    inspectControls.update();
  }

  // Load model
  const loader = new GLTFLoader();
  loader.load(
    modelPath,
    (gltf) => {
      inspectModel = gltf.scene;

      // Center the model
      const box = new THREE.Box3().setFromObject(inspectModel);
      const center = box.getCenter(new THREE.Vector3());
      inspectModel.position.sub(center);

      // Scale to fit
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = (3 / maxDim) * customScale;
      inspectModel.scale.multiplyScalar(scale);

      if (
        currentInteractiveConfig &&
        currentInteractiveConfig.type === "kecapi"
      ) {
        inspectModel.rotation.y = -Math.PI / 2;
        inspectModel.position.x -= 0.75;
      }

      if (
        currentInteractiveConfig &&
        currentInteractiveConfig.type === "jalappa"
      ) {
        inspectModel.rotation.y = -Math.PI / 2;
        const box = new THREE.Box3().setFromObject(inspectModel);
        const center = box.getCenter(new THREE.Vector3());

        center.x -= 0.35;

        inspectControls.target.copy(center);
        inspectControls.update();
      }

      if (
        currentInteractiveConfig &&
        currentInteractiveConfig.type === "puikpuik"
      ) {
        inspectModel.rotation.z = -Math.PI / 2;

        const box = new THREE.Box3().setFromObject(inspectModel);
        const center = box.getCenter(new THREE.Vector3());

        center.y += box.getSize(new THREE.Vector3()).y * 0.25;

        inspectControls.target.copy(center);
        inspectControls.update();
      }

      inspectScene.add(inspectModel);
      animateInspect();
    },
    undefined,
    (error) => {
      console.error("Error loading inspect model:", error);
    }
  );

  // Handle window resize
  window.addEventListener("resize", onInspectResize);

  inspectRenderer.domElement.addEventListener("click", onInspectClick);
}

function onInspectClick(event) {
  if (!inspectModel) return;

  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  // Calculate mouse position
  const rect = inspectRenderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, inspectCamera);

  const intersects = raycaster.intersectObject(inspectModel, true);

  if (intersects.length > 0) {
    // Interactive Logic for Kecapi
    if (
      currentInteractiveConfig &&
      currentInteractiveConfig.type === "kecapi"
    ) {
      const point = intersects[0].point;

      // Determine major axis
      const box = new THREE.Box3().setFromObject(inspectModel);
      const size = box.getSize(new THREE.Vector3());
      const min = box.min;
      const maxDim = Math.max(size.x, size.y, size.z);

      // Normalize click position along the major axis (0 to 1)
      let relativePos = 0;
      if (maxDim === size.x) {
        relativePos = (point.x - min.x) / size.x;
      } else if (maxDim === size.y) {
        relativePos = (point.y - min.y) / size.y;
      } else {
        relativePos = (point.z - min.z) / size.z;
      }

      // Clamp 0-1
      relativePos = Math.max(0, Math.min(1, relativePos));

      // Map to zones
      const zones = currentInteractiveConfig.zones || 8;
      const zoneIndex = Math.floor(relativePos * zones);

      // Play specific file from map
      if (
        currentInteractiveConfig.audioMap &&
        currentInteractiveConfig.audioMap[zoneIndex]
      ) {
        const audioSrc = currentInteractiveConfig.audioMap[zoneIndex];
        const noteAudio = new Audio(audioSrc);
        noteAudio.play().catch((e) => console.error("Audio play failed", e));
      }
    }
    // Interactive Logic for Jalappa and Puikpuik
    else if (
      currentInteractiveConfig &&
      (currentInteractiveConfig.type === "jalappa" ||
        currentInteractiveConfig.type === "puikpuik")
    ) {
      // Simple percussion/trigger
      if (currentAudio) {
        const noteAudio = currentAudio.cloneNode();
        noteAudio.play().catch((e) => console.error("Audio play failed", e));
      }
    }
    // Default Logic (Toggle main audio)
    else {
      const audioBtn = document.getElementById("inspect-audio-btn");
      if (currentAudio) {
        if (currentAudio.paused) {
          currentAudio.play();
          if (audioBtn) audioBtn.textContent = " Stop Sound";
        } else {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          if (audioBtn) audioBtn.textContent = " Play Sound";
        }
      }
    }
  }
}

function animateInspect() {
  requestAnimationFrame(animateInspect);

  if (inspectControls) {
    inspectControls.update();
  }

  if (inspectRenderer && inspectScene && inspectCamera) {
    inspectRenderer.render(inspectScene, inspectCamera);
  }
}

function onInspectResize() {
  if (inspectCamera && inspectRenderer) {
    inspectCamera.aspect = window.innerWidth / window.innerHeight;
    inspectCamera.updateProjectionMatrix();
    inspectRenderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export function closeInspectMode() {
  // Stop and cleanup audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  // Cleanup THREE.js resources
  if (inspectRenderer) {
    container3D.removeChild(inspectRenderer.domElement);
    inspectRenderer.dispose();
    inspectRenderer = null;
  }

  if (inspectControls) {
    inspectControls.dispose();
    inspectControls = null;
  }

  if (inspectModel) {
    inspectScene.remove(inspectModel);
    inspectModel = null;
  }

  if (inspectScene) {
    inspectScene = null;
  }

  if (inspectCamera) {
    inspectCamera = null;
  }

  // Remove resize listener
  window.removeEventListener("resize", onInspectResize);
  window.removeEventListener("keydown", onKeyDown);

  if (inspectRenderer && inspectRenderer.domElement) {
    inspectRenderer.domElement.removeEventListener("click", onInspectClick);
  }

  // Hide modal
  if (modalContainer) {
    modalContainer.style.display = "none";
  }

  // Reset button text
  audioBtn.textContent = " Play Sound";
}
