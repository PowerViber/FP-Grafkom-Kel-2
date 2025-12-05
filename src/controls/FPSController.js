import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import {
  PLAYER_SPEED,
  CAMERA_Y_OFFSET,
  COLLISION_PADDING,
} from "../constants.js";

export class FPSController {
  constructor(camera, domElement, collidableObjects) {
    this.camera = camera;
    this.domElement = domElement;
    this.collidableObjects = collidableObjects;

    this.controls = new PointerLockControls(this.camera, this.domElement);

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    this.raycaster = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, -1, 0),
      0,
      CAMERA_Y_OFFSET
    );

    // Position logging (prints to console periodically)
    this.posLogAccumulator = 0; // seconds
    this.posLogInterval = 0.5; // log every 0.5s
    this.enablePosLogging = true;
    this.suppressInstructions = false;

    this.bindEvents();
    this.setupPointerLock();
  }

  bindEvents() {
    document.addEventListener(
      "keydown",
      (event) => this.onKeyDown(event),
      false
    );
    document.addEventListener("keyup", (event) => this.onKeyUp(event), false);
  }

  setupPointerLock() {
    const blocker = document.getElementById("blocker");
    const instructions = document.getElementById("instructions");

    instructions.addEventListener("click", () => {
      this.controls.lock();
    });

    this.controls.addEventListener("lock", () => {
      instructions.style.display = "none";
      blocker.style.display = "none";
      this.suppressInstructions = false;
    });

    this.controls.addEventListener("unlock", () => {
      if (this.suppressInstructions) {
        // Keep the blocker hidden if we are just opening a modal
        blocker.style.display = "none";
        instructions.style.display = "none";
      } else {
        blocker.style.display = "block";
        instructions.style.display = "flex";
      }
    });
  }

  onKeyDown(event) {
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        this.moveForward = true;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.moveLeft = true;
        break;
      case "KeyS":
      case "ArrowDown":
        this.moveBackward = true;
        break;
      case "KeyD":
      case "ArrowRight":
        this.moveRight = true;
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        this.moveForward = false;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.moveLeft = false;
        break;
      case "KeyS":
      case "ArrowDown":
        this.moveBackward = false;
        break;
      case "KeyD":
      case "ArrowRight":
        this.moveRight = false;
        break;
    }
  }

  // How FPS collision works:
  // 1. Raycasting is used to check for obstacles in the direction of intended movement.
  // 2. Rays are cast from the camera position in the four movement directions (Fwd, Back, Left, Right).
  // 3. If a ray hits a collidable object (the walls) within a small distance (COLLISION_PADDING),
  //    that specific movement is prevented by setting the velocity for that axis to 0.

  checkCollision(position, direction, distance) {
    this.raycaster.set(position, direction);
    this.raycaster.near = 0;
    this.raycaster.far = distance + COLLISION_PADDING;

    const intersections = this.raycaster.intersectObjects(
      this.collidableObjects,
      true
    );

    return intersections.length > 0;
  }

  update(delta) {
    if (this.controls.isLocked === false) return;

    // Deceleration/Friction
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;

    // Determine the raw direction vector
    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    // Apply speed if keys are pressed
    if (this.moveForward || this.moveBackward)
      this.velocity.z -= this.direction.z * PLAYER_SPEED * 60.0 * delta;
    if (this.moveLeft || this.moveRight)
      this.velocity.x -= this.direction.x * PLAYER_SPEED * 60.0 * delta;

    // --- Collision Check ---
    const currentPos = this.controls.getObject().position;
    const forward = this.controls.getDirection(new THREE.Vector3(0, 0, 0));
    const right = new THREE.Vector3()
      .crossVectors(forward, new THREE.Vector3(0, 1, 0))
      .normalize();

    // Check Forward/Backward collision
    if (this.velocity.z !== 0) {
      const movementDir = new THREE.Vector3().copy(forward);
      movementDir.y = 0;
      movementDir.normalize();

      // Use the sign of velocity.z to determine if we're moving forward or backward
      if (this.velocity.z > 0) {
        // Moving Forward (negative Z in camera space)
        movementDir.multiplyScalar(-1);
      } else {
        // Moving Backward (positive Z in camera space)
      }

      if (
        this.checkCollision(
          currentPos,
          movementDir,
          Math.abs(this.velocity.z * delta)
        )
      ) {
        this.velocity.z = 0; // Stop forward/backward movement
      }
    }

    // Check Left/Right collision
    if (this.velocity.x !== 0) {
      const movementDir = new THREE.Vector3().copy(right);
      movementDir.y = 0;
      movementDir.normalize();

      // Use the sign of velocity.x to determine if we're moving right or left
      if (this.velocity.x < 0) {
        // Moving Right (positive X in camera space)
      } else {
        // Moving Left (negative X in camera space)
        movementDir.multiplyScalar(-1);
      }

      if (
        this.checkCollision(
          currentPos,
          movementDir,
          Math.abs(this.velocity.x * delta)
        )
      ) {
        this.velocity.x = 0;
      }
    }

    this.controls.moveRight(-this.velocity.x * delta);
    this.controls.moveForward(-this.velocity.z * delta);

    this.controls.getObject().position.y = CAMERA_Y_OFFSET;

    // Periodic console logging of current player position.
    if (this.enablePosLogging) {
      this.posLogAccumulator += delta;
      if (this.posLogAccumulator >= this.posLogInterval) {
        const p = this.controls.getObject().position;
        console.log(
          `Player position: x=${p.x.toFixed(2)}, y=${p.y.toFixed(
            2
          )}, z=${p.z.toFixed(2)}`
        );
        this.posLogAccumulator = 0;
      }
    }
  }
}
