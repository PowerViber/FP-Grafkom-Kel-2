import * as THREE from "three";

export const isWall = (child) => {
  return (
    child.isMesh &&
    (!child.userData || !child.userData.isWalkable) &&
    child.geometry.type === "BoxGeometry" &&
    child.material.visible !== false
  );
};

const REPEAT_UNIT_WIDTH = 10;
const REPEAT_UNIT_HEIGHT = 10;

export const applyWallTexture = (child, baseTexture) => {
  const geometry = child.geometry;
  if (!geometry.boundingBox) {
    geometry.computeBoundingBox();
  }
  const size = geometry.boundingBox.getSize(new THREE.Vector3());
  const wallHeight = size.y;
  const wallLength = Math.max(size.x, size.z);

  const repeatS = wallLength / REPEAT_UNIT_WIDTH;
  const repeatT = wallHeight / REPEAT_UNIT_HEIGHT;

  const uniqueTexture = baseTexture.clone();
  uniqueTexture.repeat.set(repeatS, repeatT);

  child.material = new THREE.MeshPhongMaterial({ map: uniqueTexture });
  child.material.needsUpdate = true;
};
