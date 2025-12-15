// src/utils/ModelInspector.js
import * as THREE from "three";

export class ModelInspector {
  constructor() {
    this.overlay = document.getElementById("inspector-overlay");
    this.container = document.getElementById("inspector-canvas-container");
    this.closeBtn = document.getElementById("close-inspector");
    
    // Setup generic sound
    this.audioLoader = new THREE.AudioLoader();
    this.listener = new THREE.AudioListener();
    this.sound = new THREE.Audio(this.listener);

    // Close Event
    this.closeBtn.addEventListener("click", () => this.close());
    
    // Key Event (E to Interact)
    window.addEventListener("keydown", (e) => {
      if (this.isOpen && (e.key === "e" || e.key === "E")) {
        this.triggerInteraction();
      }
    });

    // 3D Setup for the Popup (Mini Scene)
    this.initScene();
    this.isOpen = false;
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 400 / 300, 0.1, 100);
    this.camera.position.z = 5;
    
    // Add lights to the mini scene
    const light = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(light);
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(2, 2, 5);
    this.scene.add(dirLight);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(400, 300);
    this.renderer.setClearColor(0x000000, 0); // Transparent background
    this.container.appendChild(this.renderer.domElement);
  }

  // CALL THIS FUNCTION TO OPEN THE POPUP
  open(modelClone, soundPath) {
    this.isOpen = true;
    this.overlay.style.display = "flex";
    
    // Clear previous model
    this.scene.children = this.scene.children.filter(c => c.isLight || c.isCamera); 
    
    // Add new model
    this.currentModel = modelClone.clone();
    this.currentModel.scale.set(1, 1, 1); // Reset scale for viewer
    this.currentModel.position.set(0, 0, 0);
    this.scene.add(this.currentModel);

    // Load Sound
    if(soundPath) {
        this.audioLoader.load(soundPath, (buffer) => {
            this.sound.setBuffer(buffer);
            this.sound.setVolume(0.5);
        });
    }

    this.animate();
  }

  close() {
    this.isOpen = false;
    this.overlay.style.display = "none";
  }

  triggerInteraction() {
    console.log("Interaction Triggered!");
    if (this.sound.buffer) {
        if(this.sound.isPlaying) this.sound.stop();
        this.sound.play();
    }
    // Add visual feedback (e.g., small jump)
    if(this.currentModel) this.currentModel.position.y += 0.5;
    setTimeout(() => { if(this.currentModel) this.currentModel.position.y -= 0.5; }, 200);
  }

  animate() {
    if (!this.isOpen) return;

    requestAnimationFrame(() => this.animate());

    // Auto rotate or allow user control here
    if (this.currentModel) {
      this.currentModel.rotation.y += 0.01;
    }

    this.renderer.render(this.scene, this.camera);
  }
}