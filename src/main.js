import * as THREE from "three";
import { setupScene } from "./scene.js";
import { setupCamera } from "./camera.js";
import { setupRenderer } from "./renderer.js";
import { FPSController } from "./controls/FPSController.js";
import { POSITIONS } from "./constants.js";

import { createSumatra } from "./islands/Sumatra.js";
import { createJawa } from "./islands/Jawa.js";
import { createKalimantan } from "./islands/Kalimantan.js";
import { createSulawesi } from "./islands/Sulawesi.js";
import { createPapua } from "./islands/Papua.js";

import { createSeparatorSumatraJawa } from "./separators/SeparatorSumatraJawa.js";
import { createSeparatorJawaKalimantan } from "./separators/SeparatorJawaKalimantan.js";
import { createSeparatorKalimantanSulawesi } from "./separators/SeparatorKalimantanSulawesi.js";
import { createSeparatorSulawesiPapua } from "./separators/SeparatorSulawesiPapua.js";

let camera, scene, renderer, controller;
const clock = new THREE.Clock();

function init() {
  const container = document.body;

  scene = setupScene();
  camera = setupCamera(window.innerWidth / window.innerHeight);
  renderer = setupRenderer(container, window.innerWidth, window.innerHeight);

  window.addEventListener("resize", onWindowResize, false);

  const allCollidableMeshes = composeMuseum(scene);

  controller = new FPSController(
    camera,
    renderer.domElement,
    allCollidableMeshes
  );
  scene.add(controller.controls.getObject());

  animate();
}

/**
 * Composes the entire museum structure, positioning each block.
 * @param {THREE.Scene} scene - The main Three.js scene.
 * @returns {Array<THREE.Mesh>} An array of meshes that should be used for collision detection.
 */
function composeMuseum(scene) {
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
    const block = creator();

    const { x, y, z } = POSITIONS[name];
    block.position.set(x, y, z);

    scene.add(block);

    block.children.forEach((child) => {
      if (child.geometry.type === "BoxGeometry") {
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

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  controller.update(delta);

  // Simple preview animation: rotate any model marked for preview.
  scene.traverse((obj) => {
    if (obj.userData && obj.userData.preview) {
      obj.rotation.y += delta * 0.5; // rotate slowly
    }
  });

  renderer.render(scene, camera);
}

init();
