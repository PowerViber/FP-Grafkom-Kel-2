import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

/**
 * Loads a GLTF model and configures it for interaction, attaching story content.
 * @param {string} modelPath - Path to the GLB/GLTF file.
 * @param {string} htmlContent - The raw HTML string for the modal content.
 * @param {Array<THREE.Mesh>} clickableObjectsArray - The array to store the clickable mesh reference.
 * @returns {Promise<THREE.Object3D>} A Promise that resolves with the loaded model's scene.
 */
export function createClickableObject(
  modelPath,
  htmlContent,
  clickableObjectsArray
) {
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
          if (child.isMesh) {
            child.userData.isClickable = true;
            child.userData.modalContent = htmlContent;
            clickableObjectsArray.push(child);
          }
        });

        resolve(model);
      },
      undefined,
      (error) => {
        console.error(`Error loading model ${modelPath}:`, error);
        reject(error);
      }
    );
  });
}
