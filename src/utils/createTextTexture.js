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

  context.font = "Bold 60px 'Times New Roman'"; // More interesting Serif font
  context.fillStyle = color;
  context.textAlign = "center";
  context.textBaseline = "middle";

  // Add Glow/Shadow for interest
  context.shadowColor = "white";
  context.shadowBlur = 5;

  context.save();
  // context.translate(width, 0); // Removed mirror
  // context.scale(-1, 1); // Removed mirror
  context.fillText(text, width / 2, height / 2);

  context.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return texture;
}
