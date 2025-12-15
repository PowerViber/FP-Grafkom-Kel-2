import * as THREE from "three";

export function createTextTexture(
  text,
  width = 512,
  height = 128,
  color = "white",
  background = "transparent"
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  context.font = "Bold 60px Arial";
  context.fillStyle = color;
  context.textAlign = "center";
  context.textBaseline = "middle";

  context.save();
  context.translate(width, 0);
  context.scale(-1, 1);
  context.fillText(text, width / 2, height / 2);

  context.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return texture;
}
