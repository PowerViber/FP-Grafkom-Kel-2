import * as THREE from "three";
import { createTextTexture } from "./createTextTexture.js";

/**
 * Creates a framed sign with wood texture and semi-transparent background.
 * @param {string} text - The text to display
 * @param {number} width - Width of the sign (inner area)
 * @param {number} height - Height of the sign (inner area)
 * @param {string} imagePath - Path to the island image texture
 * @returns {THREE.Group} - The sign group containing frame, background, and text
 */
export function createFramedSign(text, width, height, imagePath) {
    const group = new THREE.Group();

    // 1. Frame Construction
    const frameThickness = 0.5;
    // ... (rest is unchanged until texture loading) ...
    const frameDepth = 0.5;
    const woodColor = 0x5c4033;
    const goldColor = 0xffd700;

    const woodMat = new THREE.MeshStandardMaterial({ color: woodColor, roughness: 0.9, name: 'wood' });
    const goldMat = new THREE.MeshStandardMaterial({ color: goldColor, roughness: 0.3, metalness: 0.8, name: 'gold' });

    // --- Outer Wood Frame ---
    const horizontalW = width + frameThickness * 2;
    const verticalH = height + frameThickness * 2;

    // Top Plank
    const top = new THREE.Mesh(new THREE.BoxGeometry(horizontalW, frameThickness, frameDepth), woodMat);
    top.position.set(0, height / 2 + frameThickness / 2, 0);
    top.userData = { isSignPart: true };
    group.add(top);

    // Bottom Plank
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(horizontalW, frameThickness, frameDepth), woodMat);
    bottom.position.set(0, -height / 2 - frameThickness / 2, 0);
    bottom.userData = { isSignPart: true };
    group.add(bottom);

    // Left Plank
    const left = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, verticalH, frameDepth), woodMat);
    left.position.set(-width / 2 - frameThickness / 2, 0, 0);
    left.userData = { isSignPart: true };
    group.add(left);

    // Right Plank
    const right = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, verticalH, frameDepth), woodMat);
    right.position.set(width / 2 + frameThickness / 2, 0, 0);
    right.userData = { isSignPart: true };
    group.add(right);

    // Iron Bolts
    const ironColor = 0x222222;
    const ironMat = new THREE.MeshStandardMaterial({ color: ironColor, roughness: 0.4, metalness: 0.8 });
    const boltSize = 0.15;
    const boltDepth = frameDepth + 0.1;

    const boltPositions = [
        { x: -width / 2 - frameThickness / 2, y: height / 2 + frameThickness / 2 },
        { x: width / 2 + frameThickness / 2, y: height / 2 + frameThickness / 2 },
        { x: -width / 2 - frameThickness / 2, y: -height / 2 - frameThickness / 2 },
        { x: width / 2 + frameThickness / 2, y: -height / 2 - frameThickness / 2 }
    ];

    boltPositions.forEach(pos => {
        const bolt = new THREE.Mesh(new THREE.BoxGeometry(boltSize, boltSize, boltDepth), ironMat);
        bolt.position.set(pos.x, pos.y, 0);
        bolt.userData = { isSignPart: true };
        group.add(bolt);
    });

    // Ambient Glow
    const light = new THREE.PointLight(0xffaa00, 1.0, 8);
    light.position.set(0, 0, 1.5);
    group.add(light);

    // 2. Background Layers
    // Layer A: "Glass" Backing
    const glassGeo = new THREE.PlaneGeometry(width, height);
    const glassMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.z = 0.05;
    group.add(glassMesh);

    // Layer B: Island Map Image
    const textureLoader = new THREE.TextureLoader();
    const mapTexture = textureLoader.load(imagePath || "./src/separators/pulau/pulau_jawa.jpg");

    const imageGeo = new THREE.PlaneGeometry(width, height);
    const imageMat = new THREE.MeshBasicMaterial({
        map: mapTexture,
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
    });
    const imageMesh = new THREE.Mesh(imageGeo, imageMat);
    imageMesh.position.z = 0.15;
    group.add(imageMesh);

    // 3. Text Overlay
    const textTexture = createTextTexture(text, 512, 128, "black", "rgba(0,0,0,0)");
    const textMat = new THREE.MeshBasicMaterial({
        map: textTexture,
        transparent: true,
        side: THREE.DoubleSide,
    });
    const textMesh = new THREE.Mesh(glassGeo, textMat);
    textMesh.position.z = 0.2;
    group.add(textMesh);

    return group;
}
