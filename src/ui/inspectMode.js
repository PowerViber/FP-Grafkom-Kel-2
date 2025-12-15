import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { registerSound } from "../utils/audioManager.js";

let inspectScene, inspectCamera, inspectRenderer, inspectControls;
let currentAudio = null;
let inspectModel = null;

const modalContainer = document.getElementById("inspect-modal-container");
const container3D = document.getElementById("inspect-3d-container");
const titleEl = document.getElementById("inspect-title");
const subtitleEl = document.getElementById("inspect-subtitle");
const audioBtn = document.getElementById("inspect-audio-btn");

export function showInspectMode(modelPath, title, subtitle, audioPath) {
  if (!modalContainer) return;

  // Set title and subtitle
  titleEl.textContent = title;
  subtitleEl.textContent = subtitle;

  // Setup audio button
  if (audioPath) {
    audioBtn.classList.remove("hidden");
    currentAudio = new Audio(audioPath);
    registerSound(currentAudio, 1.0);
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
  } else {
    audioBtn.classList.add("hidden");
  }

  // Show modal
  modalContainer.style.display = "block";

  // Initialize THREE.js scene
  initInspectScene(modelPath);
}

function initInspectScene(modelPath) {
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
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  inspectScene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  inspectScene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
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
      const scale = 3 / maxDim;
      inspectModel.scale.multiplyScalar(scale);

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

  // Hide modal
  if (modalContainer) {
    modalContainer.style.display = "none";
  }

  // Reset button text
  audioBtn.textContent = " Play Sound";
}
