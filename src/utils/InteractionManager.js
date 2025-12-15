// src/utils/InteractionManager.js
import * as THREE from "three";

export class InteractionManager {
  constructor(camera, scene, renderer) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.interactiveObjects = []; // Stores { mesh, callback }

    // Bind event
    window.addEventListener("pointerdown", (e) => this.onPointerDown(e));
  }

  register(mesh, onInteract) {
    // Add mesh to registry with its specific callback
    this.interactiveObjects.push({ mesh, onInteract });
  }

  onPointerDown(event) {
    if (document.pointerLockElement) {
        // If FPS mode is on, we always raycast from the CENTER of the screen
        this.pointer.x = 0;
        this.pointer.y = 0;
    } else {
        // Standard mouse click
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    // Calculate pointer position in normalized device coordinates (-1 to +1)
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    // Filter out just the meshes for intersection check
    const meshes = this.interactiveObjects.map((obj) => obj.mesh);
    const intersects = this.raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hitObject = intersects[0].object;
      
      // Find the corresponding callback for the hit object
      const found = this.interactiveObjects.find((obj) => obj.mesh === hitObject);
      if (found && found.onInteract) {
        found.onInteract(); // Trigger the passed function
      }
    }
  }
}