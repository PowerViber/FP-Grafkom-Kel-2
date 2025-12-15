import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/**
 * Creates a picture frame with an auto-fitted image and adds it to the scene.
 * * @param {THREE.Object3D} parent - The block or scene to add the frame to.
 * @param {Object} config - Configuration object.
 * @param {string} config.image - Path to the image texture (e.g., './src/assets/pattern.jpg').
 * @param {string} [config.frameModel] - Path to the frame GLB (default provided).
 * @param {Object} [config.position] - {x, y, z} coordinates.
 * @param {Object} [config.rotation] - {x, y, z} rotation in radians.
 * @param {number} [config.scale=5] - Scale factor for the frame.
 * @param {string} [config.modalContent] - HTML content for the popup modal.
 * @param {Array} [config.clickableObjects] - Array to register interactive meshes.
 */
export function createPictureFrame(parent, config) {
  const {
    image,
    frameModel = "./src/assets/picture_frame.glb",
    position = { x: 0, y: 0, z: 0 },
    rotation = { x: 0, y: 0, z: 0 },
    scale = 5,
    modalContent = "<p>No description available.</p>",
    clickableObjects = null,
    textureRotation = 0,
  } = config;

  const gltfLoader = new GLTFLoader();
  const textureLoader = new THREE.TextureLoader();

  gltfLoader.load(
    frameModel,
    (gltf) => {
      const frame = gltf.scene;

      const box = new THREE.Box3().setFromObject(frame);
      const size = new THREE.Vector3();
      box.getSize(size);

      const imageWidth = size.x * 0.85;
      const imageHeight = size.y * 0.8;
      const imageGeometry = new THREE.PlaneGeometry(imageWidth, imageHeight);

      textureLoader.load(
        image,
        (tex) => {
          tex.encoding = THREE.sRGBEncoding;
          tex.center.set(0.5, 0.5);
          if (textureRotation) {
            tex.rotation = textureRotation;
          }

          const planeAspect = imageWidth / imageHeight;
          // If texture is rotated 90 degrees, swap its aspect ratio for calculation
          let imageAspect = tex.image.width / tex.image.height;
          if (Math.abs(textureRotation - Math.PI / 2) < 0.1 || Math.abs(textureRotation + Math.PI / 2) < 0.1) {
            imageAspect = 1 / imageAspect;
          }

          if (planeAspect > imageAspect) {
            tex.repeat.set(1, imageAspect / planeAspect);
          } else {
            tex.repeat.set(planeAspect / imageAspect, 1);
          }

          const imageMaterial = new THREE.MeshBasicMaterial({ map: tex });
          const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);

          const centerY = (box.max.y + box.min.y) / 2;
          imageMesh.position.set(0, centerY, size.z / 2 + 0.02);

          frame.add(imageMesh);
        },
        undefined,
        (err) => console.error(`Error loading texture ${image}:`, err)
      );

      frame.position.set(position.x, position.y, position.z);
      frame.rotation.set(rotation.x, rotation.y, rotation.z);
      frame.scale.set(scale, scale, scale);

      frame.traverse((child) => {
        if (child.isMesh) {
          child.userData.isClickable = true;
          child.userData.modalContent = modalContent;
          if (clickableObjects) {
            clickableObjects.push(child);
          }
        }
      });

      parent.add(frame);
    },
    undefined,
    (err) => console.error(`Error loading frame model ${frameModel}:`, err)
  );
}
