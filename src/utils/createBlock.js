import * as THREE from "three";

import {
  ISLAND_WIDTH,
  ISLAND_HEIGHT,
  ISLAND_DEPTH,
  SEPARATOR_BEND_SPAN,
  SEPARATOR_BEND_THICKNESS,
  WALL_THICKNESS,
} from "../constants.js";

/**
 * Creates a 3D block (mesh) for a section of the museum.
 * @param {string} name - Name of the block (e.g., 'Sumatra').
 * @param {string} color - The base color of the floor.
 * @returns {THREE.Group} A group containing the floor and walls.
 */
export function createBlock(name, color = 0xaaaaaa) {
  let W, D;
  const isSeparator = name.includes("Separator");

  if (isSeparator) {
    W = SEPARATOR_BEND_SPAN;
    D = SEPARATOR_BEND_THICKNESS;
  } else {
    W = ISLAND_WIDTH;
    D = ISLAND_DEPTH;
  }

  const H = ISLAND_HEIGHT;

  const group = new THREE.Group();
  group.name = name;

  // --- Floor ---
  const floorGeometry = new THREE.PlaneGeometry(W, D);
  floorGeometry.rotateX(-Math.PI / 2);
  const floorMaterial = new THREE.MeshPhongMaterial({
    color: color,
    side: THREE.DoubleSide,
  });
  const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
  floorMesh.position.y = 0;
  group.add(floorMesh);

  floorMesh.userData.isWalkable = true;
  floorMesh.userData.blockDimensions = new THREE.Vector3(W, H, D);

  // --- Walls ---
  const wallThickness = WALL_THICKNESS;
  const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
  const wallHeight = H;

  const sideWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, D);

  const wallL = new THREE.Mesh(sideWallGeometry, wallMaterial);
  wallL.position.set(-W / 2 - wallThickness / 2, H / 2, 0);
  group.add(wallL);

  const wallR = new THREE.Mesh(sideWallGeometry, wallMaterial);
  wallR.position.set(W / 2 + wallThickness / 2, H / 2, 0);
  group.add(wallR);

  const halfWallWidth = W / 2;

  const halfEndWallGeometry = new THREE.BoxGeometry(
    halfWallWidth,
    wallHeight,
    wallThickness
  );

  const positionOffset = halfWallWidth / 2;

  if (name === "Sumatra" || name === "Papua") {
    const islandEndWallGeometry = new THREE.BoxGeometry(
      W + wallThickness,
      wallHeight,
      wallThickness
    );

    if (name === "Sumatra") {
      const wallF = new THREE.Mesh(islandEndWallGeometry, wallMaterial);
      wallF.position.set(0, H / 2, D / 2 + wallThickness / 2);
      group.add(wallF);
    }

    if (name === "Papua") {
      const wallB = new THREE.Mesh(islandEndWallGeometry, wallMaterial);
      wallB.position.set(0, H / 2, -D / 2 - wallThickness / 2);
      group.add(wallB);
    }
  }

  if (isSeparator) {
    const flipPosition =
      name.includes("JawaKalimantan") || name.includes("SulawesiPapua");

    let frontOffset;
    let backOffset;

    if (flipPosition) {
      frontOffset = -positionOffset;
      backOffset = positionOffset;
    } else {
      frontOffset = positionOffset;
      backOffset = -positionOffset;
    }

    const wallF = new THREE.Mesh(halfEndWallGeometry, wallMaterial);
    wallF.position.set(frontOffset, H / 2, D / 2 + wallThickness / 2);
    group.add(wallF);

    const wallB = new THREE.Mesh(halfEndWallGeometry, wallMaterial);
    wallB.position.set(backOffset, H / 2, -D / 2 - wallThickness / 2);
    group.add(wallB);
  }

  return group;
}
