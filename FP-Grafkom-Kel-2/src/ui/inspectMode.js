import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

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

    // Pause background music if active
    if (window.bgMusicControls) {
        window.bgMusicControls.pause();
    }

    // Initialize THREE.js scene
    initInspectScene(modelPath);

    // Add Escape key listener
    window.addEventListener("keydown", onKeyDown);
}

function onKeyDown(event) {
    if (event.key === "Escape") {
        closeInspectMode();
    }
}

function initInspectScene(modelPath) {
    // Create scene
    inspectScene = new THREE.Scene();
    inspectScene.background = new THREE.Color(0x808080);

    // Create camera
    const width = window.innerWidth;
    const height = window.innerHeight;
    inspectCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    inspectCamera.position.set(0, 0, 5); // Front view

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
    inspectControls = new OrbitControls(inspectCamera, inspectRenderer.domElement);
    inspectControls.enableDamping = true;
    inspectControls.dampingFactor = 0.05;
    inspectControls.enableZoom = true;
    inspectControls.enablePan = false;
    inspectControls.target.set(0, 0, 0);
    inspectControls.update();

    // Load model
    const loader = new GLTFLoader();
    loader.load(
        modelPath,
        (gltf) => {
            inspectModel = gltf.scene;
            inspectScene.add(inspectModel);

            // Ensure matrices are updated for accurate box calculation
            inspectModel.updateMatrixWorld(true);

            // Calculate bounding box
            const box = new THREE.Box3().setFromObject(inspectModel);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            // Center the model by offsetting its position
            // We subtract the center vector to move the geometric center to (0,0,0)
            inspectModel.position.x -= center.x;
            inspectModel.position.y -= center.y;
            inspectModel.position.z -= center.z;

            // Normalize scale to fit within a standard view
            const maxDim = Math.max(size.x, size.y, size.z);
            const targetSize = 3; // Target size in scene units
            const scale = targetSize / maxDim;
            inspectModel.scale.setScalar(scale);

            // Adjust camera Z based on object size and FOV to ensure visibility
            const fov = inspectCamera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(targetSize / 2 / Math.tan(fov / 2));
            cameraZ *= 1.2; // Add 20% padding

            // Prevent camera from being too close or too far
            if (cameraZ < 2) cameraZ = 2;
            if (cameraZ > 10) cameraZ = 10;

            inspectCamera.position.set(0, 0, cameraZ);
            inspectCamera.lookAt(0, 0, 0);

            // Update controls
            if (inspectControls) {
                inspectControls.target.set(0, 0, 0);
                inspectControls.update();
            }

            animateInspect();
        },
        undefined,
        (error) => {
            console.error("Error loading inspect model:", error);
        }
    );

    // Handle window resize
    window.addEventListener("resize", onInspectResize);

    // Handle clicks on model
    inspectRenderer.domElement.addEventListener("click", onInspectClick);
}

function onInspectClick(event) {
    if (!currentAudio || !inspectModel) return;

    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    // Calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    const rect = inspectRenderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, inspectCamera);

    const intersects = raycaster.intersectObject(inspectModel, true);

    if (intersects.length > 0) {
        // Toggle audio
        const audioBtn = document.getElementById("inspect-audio-btn");
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

    // Resume tour controls
    if (window.returnToTour) {
        window.returnToTour();
    }

    // Resume background music if it was active
    if (window.bgMusicControls) {
        window.bgMusicControls.play();
    }
}

window.closeInspectMode = closeInspectMode;
