export const ISLAND_WIDTH = 20;
export const ISLAND_HEIGHT = 10;
export const ISLAND_DEPTH = 80;

export const SEPARATOR_BEND_SPAN = 2 * ISLAND_WIDTH;
export const SEPARATOR_BEND_THICKNESS = 20;

export const SEPARATOR_WIDTH = 20;
export const SEPARATOR_HEIGHT = 10;
export const SEPARATOR_DEPTH = 40;

export const WALL_THICKNESS = 1;

export const CAMERA_Y_OFFSET = 6.5;
export const PLAYER_SPEED = 5;
export const PLAYER_HEIGHT = ISLAND_HEIGHT;
export const COLLISION_PADDING = 0.2;

const ISLAND = { W: ISLAND_WIDTH, H: ISLAND_HEIGHT, D: ISLAND_DEPTH };
const SEP_SPAN = SEPARATOR_BEND_SPAN;
const SEP_THICK = SEPARATOR_BEND_THICKNESS;

const HALF_ISLAND_W = ISLAND.W / 2;
const HALF_ISLAND_D = ISLAND.D / 2;
const HALF_SEP_SPAN = SEP_SPAN / 2;
const HALF_SEP_THICK = SEP_THICK / 2;

const tempPositions = {};
let currentZ = 0;
let currentX = 0;

// --- 1. Sumatra (X=0) ---
currentZ = -HALF_ISLAND_D;
currentX = 0;
tempPositions.Sumatra = {
  x: currentX,
  y: ISLAND.H / 2,
  z: currentZ,
};

// --- 2. Separator Sumatra-Jawa ---
currentZ = tempPositions.Sumatra.z - HALF_ISLAND_D - HALF_SEP_THICK;
currentX = HALF_SEP_SPAN - HALF_ISLAND_W;
tempPositions.SeparatorSumatraJawa = {
  x: currentX,
  y: ISLAND.H / 2,
  z: currentZ,
};

// --- 3. Jawa ---
currentZ =
  tempPositions.SeparatorSumatraJawa.z - HALF_SEP_THICK - HALF_ISLAND_D;
currentX = HALF_SEP_SPAN;
tempPositions.Jawa = {
  x: currentX,
  y: ISLAND.H / 2,
  z: currentZ,
};

// --- 4. Separator Jawa-Kalimantan ---
currentZ = tempPositions.Jawa.z - HALF_ISLAND_D - HALF_SEP_THICK;
currentX = HALF_SEP_SPAN - HALF_ISLAND_W;
tempPositions.SeparatorJawaKalimantan = {
  x: currentX,
  y: ISLAND.H / 2,
  z: currentZ,
};

// --- 5. Kalimantan ---
currentZ =
  tempPositions.SeparatorJawaKalimantan.z - HALF_SEP_THICK - HALF_ISLAND_D;
currentX = 0;
tempPositions.Kalimantan = {
  x: currentX,
  y: ISLAND.H / 2,
  z: currentZ,
};

// --- 6. Separator Kalimantan-Sulawesi ---
currentZ = tempPositions.Kalimantan.z - HALF_ISLAND_D - HALF_SEP_THICK;
currentX = HALF_SEP_SPAN - HALF_ISLAND_W;
tempPositions.SeparatorKalimantanSulawesi = {
  x: currentX,
  y: ISLAND.H / 2,
  z: currentZ,
};

// --- 7. Sulawesi ---
currentZ =
  tempPositions.SeparatorKalimantanSulawesi.z - HALF_SEP_THICK - HALF_ISLAND_D;
currentX = HALF_SEP_SPAN;
tempPositions.Sulawesi = {
  x: currentX,
  y: ISLAND.H / 2,
  z: currentZ,
};

// --- 8. Separator Sulawesi-Papua ---
currentZ = tempPositions.Sulawesi.z - HALF_ISLAND_D - HALF_SEP_THICK;
currentX = HALF_SEP_SPAN - HALF_ISLAND_W;
tempPositions.SeparatorSulawesiPapua = {
  x: currentX,
  y: ISLAND.H / 2,
  z: currentZ,
};

// --- 9. Papua ---
currentZ =
  tempPositions.SeparatorSulawesiPapua.z - HALF_SEP_THICK - HALF_ISLAND_D;
currentX = 0;
tempPositions.Papua = {
  x: currentX,
  y: ISLAND.H / 2,
  z: currentZ,
};

export const POSITIONS = tempPositions;

export const ISLAND_BLOCKS = [
  "Sumatra",
  "Jawa",
  "Kalimantan",
  "Sulawesi",
  "Papua",
  "SeparatorSumatraJawa",
  "SeparatorJawaKalimantan",
  "SeparatorKalimantanSulawesi",
  "SeparatorSulawesiPapua",
];
