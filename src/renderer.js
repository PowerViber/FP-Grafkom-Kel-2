import * as THREE from "three";

export function setupRenderer(domElement, width, height) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  domElement.appendChild(renderer.domElement);
  return renderer;
}
