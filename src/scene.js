import * as THREE from "three";

export function setupScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(0, 10, 0);
  scene.add(directionalLight);

  return scene;
}
