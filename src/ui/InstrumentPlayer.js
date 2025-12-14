import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class InstrumentPlayer {
    constructor() {
        this.overlay = document.getElementById("instrument-player-overlay");
        this.closeBtn = document.getElementById("btn-close-instrument");
        this.strings = document.querySelectorAll("#kecapi-strings .string");
        this.modelContainer = document.getElementById("kecapi-model-container");

        this.audioContext = null;

        // Three.js Components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.requestAnimationFrameId = null;
        this.model = null;

        this.initThreeJS();
        this.bindEvents();
    }

    initThreeJS() {
        if (!this.modelContainer) return;

        // 1. Scene
        this.scene = new THREE.Scene();
        // Transparent background is handled by renderer alpha:true, 
        // but scene background can be null 

        // 2. Camera
        const width = this.modelContainer.clientWidth || 300;
        const height = this.modelContainer.clientHeight || 600;
        // Orthographic camera might be better for this 2D-like view, or perspective
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(0, 5, 0); // Top down
        this.camera.lookAt(0, 0, 0);

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.modelContainer.appendChild(this.renderer.domElement);

        // 4. Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 10, 5);
        this.scene.add(dirLight);

        // 5. Load Model
        const loader = new GLTFLoader();
        loader.load("./src/assets/sulawesi_kecapi.glb", (gltf) => {
            this.model = gltf.scene;

            // Normalize Scale
            // We need to fit it in view. Let's make it roughly length 4.
            // Assuming the model is roughly centered.
            this.model.scale.set(10, 10, 10);

            // Position - adjusting based on likely pivot
            // We want it vertical presumably? Or matching the container which is tall
            // Let's rotate it to be vertical if it's horizontal
            // Standard view: Kecapi is long.
            this.model.rotation.y = -Math.PI / 2; // Adjust as needed

            this.scene.add(this.model);
        }, undefined, (err) => console.error("Error loading instrument model:", err));
    }

    bindEvents() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener("click", () => this.close());
        }

        this.strings.forEach((str) => {
            str.addEventListener("mousedown", (e) => this.playNote(e.target.dataset.note));
            str.addEventListener("mouseenter", (e) => {
                if (e.buttons === 1) { // Click and drag support
                    this.playNote(e.target.dataset.note);
                }
            });
        });

        window.addEventListener("resize", () => this.onResize());
    }

    onResize() {
        if (!this.modelContainer || !this.camera || !this.renderer) return;
        const width = this.modelContainer.clientWidth;
        const height = this.modelContainer.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    ensureAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    playNote(note) {
        this.ensureAudioContext();

        // Simple frequency map for a pentatonic scale
        const frequencies = {
            "C4": 261.63,
            "D4": 293.66,
            "E4": 329.63,
            "G4": 392.00,
            "A4": 440.00
        };

        const freq = frequencies[note];
        if (!freq) return;

        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        osc.type = "triangle"; // Sounds a bit like a plucked string
        osc.frequency.value = freq;

        // Envelope for a plucked sound
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.05); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.5); // Decay

        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 1.5);

        // Visual feedback
        this.animateString(note);

        // Optional: Animate 3D model slightly
        if (this.model) {
            // Maybe a tiny shake?
            this.model.position.y += 0.05;
            setTimeout(() => { if (this.model) this.model.position.y -= 0.05; }, 50);
        }
    }

    animateString(note) {
        const string = document.querySelector(`.string[data-note="${note}"]`);
        if (string) {
            string.classList.add("bg-white", "scale-x-150");
            setTimeout(() => {
                string.classList.remove("bg-white", "scale-x-150");
            }, 100);
        }
    }

    animate() {
        if (!this.overlay || this.overlay.style.display === "none") return;

        if (this.renderer && this.scene && this.camera) {
            // Subtle idle animation
            if (this.model) {
                this.model.rotation.y += 0.001;
            }
            this.renderer.render(this.scene, this.camera);
        }

        this.requestAnimationFrameId = requestAnimationFrame(() => this.animate());
    }

    open() {
        if (this.overlay) {
            this.overlay.style.display = "flex";
            this.onResize(); // Ensure size is correct on open
            this.animate();
        }
    }

    close() {
        if (this.overlay) {
            this.overlay.style.display = "none";
            if (this.requestAnimationFrameId) {
                cancelAnimationFrame(this.requestAnimationFrameId);
            }
        }
    }
}
