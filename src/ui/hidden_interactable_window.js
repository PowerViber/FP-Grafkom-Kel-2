import * as THREE from "three";

// --- 1. SELECTION ---
const overlay = document.getElementById("inspector-overlay");
const container = document.getElementById("inspector-canvas-container");
const closeBtn = document.getElementById("close-inspector");
// Note: instructionText isn't used in logic, but good to have if you need to update text

// --- 2. STATE VARIABLES ---
let scene, camera, renderer, animationId;
let currentModel = null;
const audioLoader = new THREE.AudioLoader();
const listener = new THREE.AudioListener();
const sound = new THREE.Audio(listener);

// Dragging State
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// --- 3. STYLE INJECTION ---
const styles = `
    #inspector-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: none; 
        justify-content: center; align-items: center;
        z-index: 100;
        cursor: grab; /* Shows user this is draggable */
    }
    #inspector-overlay:active {
        cursor: grabbing;
    }
    .inspector-content {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 20px;
        border-radius: 15px;
        text-align: center;
        color: white;
        position: relative;
    }
    #inspector-canvas-container {
        width: 400px; height: 300px;
        background: transparent;
        /* Ensure canvas captures clicks */
        touch-action: none; 
    }
    #close-inspector {
        position: absolute; top: 10px; right: 10px;
        background: #ff4d4d; border: none; color: white;
        font-weight: bold; cursor: pointer; padding: 5px 10px; border-radius: 5px;
    }
    #inspector-instruction { margin-top: 10px; font-family: sans-serif; }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);


// --- 4. INITIALIZATION ---
if (container) {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, 400 / 300, 0.1, 100);
    camera.position.z = 5;
    camera.add(listener);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(2, 2, 5);
    scene.add(ambientLight);
    scene.add(dirLight);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(400, 300);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    if (closeBtn) closeBtn.addEventListener("click", hideInspector);
} else {
    console.error("Inspector elements not found in HTML.");
}


// --- 5. EXPORTED FUNCTIONS ---

export function showInspector(model, soundPath = null, customInteraction = null) {
    if (!overlay || !renderer) return;

    overlay.style.display = "flex";

    // IMPORTANT: Unlock mouse so we can drag
    if (document.exitPointerLock) {
        document.exitPointerLock();
    }

    // Clear previous
    if (currentModel) {
        scene.remove(currentModel);
        currentModel = null;
    }

    // Add new model
    if (model) {
        currentModel = model.clone();
        
        // Auto-center model
        const box = new THREE.Box3().setFromObject(currentModel);
        const center = box.getCenter(new THREE.Vector3());
        currentModel.position.sub(center); 
        
        scene.add(currentModel);
    }

    // Load Sound
    if (soundPath) {
        audioLoader.load(soundPath, (buffer) => {
            sound.setBuffer(buffer);
            sound.setVolume(0.5);
        });
    }

    // --- SETUP LISTENERS ---
    
    // Keyboard
    window.onInspectorKeydown = (e) => {
        if (e.key.toLowerCase() === "e") {
            if (sound.buffer && !sound.isPlaying) sound.play();
            if (customInteraction) customInteraction();
        }
    };
    window.addEventListener("keydown", window.onInspectorKeydown);

    // Mouse Dragging
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    animateInspector();
}

export function hideInspector() {
    if (!overlay) return;

    overlay.style.display = "none";
    cancelAnimationFrame(animationId);

    // Cleanup Keyboard
    if (window.onInspectorKeydown) {
        window.removeEventListener("keydown", window.onInspectorKeydown);
        window.onInspectorKeydown = null;
    }

    // Cleanup Mouse
    container.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);

    if (sound.isPlaying) sound.stop();
}

// --- DRAG LOGIC ---

function onMouseDown(e) {
    isDragging = true;
    previousMousePosition = {
        x: e.clientX,
        y: e.clientY
    };
}

function onMouseMove(e) {
    if (!isDragging || !currentModel) return;

    const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
    };

    // Rotate model based on mouse movement
    // x movement rotates around Y axis (spinning)
    // y movement rotates around X axis (tilting)
    currentModel.rotation.y += deltaMove.x * 0.01;
    currentModel.rotation.x += deltaMove.y * 0.01;

    previousMousePosition = {
        x: e.clientX,
        y: e.clientY
    };
}

function onMouseUp() {
    isDragging = false;
}

// Internal Animation Loop
function animateInspector() {
    animationId = requestAnimationFrame(animateInspector);
    
    // REMOVED auto-rotation so it doesn't fight with your mouse
    // if (currentModel) currentModel.rotation.y += 0.01; 
    
    renderer.render(scene, camera);
}