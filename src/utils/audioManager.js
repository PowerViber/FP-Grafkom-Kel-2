// 1. Default Master Volume (1.0 = 100%)
let masterVolume = 0.5;

// 2. List to keep track of all sounds currently in the game
// Structure: { source: AudioObject, baseVolume: Number }
const activeSounds = [];

/**
 * Registers a sound so it can be controlled by the master volume.
 * @param {HTMLAudioElement} audioObj - The audio object (new Audio())
 * @param {number} baseVolume - The individual volume of this track (0.0 to 1.0)
 */
export function registerSound(audioObj, baseVolume = 1.0) {
  // Save the reference and its "intended" volume
  activeSounds.push({ source: audioObj, baseVolume: baseVolume });

  // Set initial volume immediately based on current master volume
  audioObj.volume = baseVolume * masterVolume;
}

/**
 * Updates the Global Volume and adjusts all registered sounds.
 * @param {number} value - New volume between 0.0 and 1.0
 */
export function setMasterVolume(value) {
  masterVolume = Math.max(0, Math.min(1, value)); // Clamp between 0 and 1

  // Loop through all sounds and update them
  activeSounds.forEach((sound) => {
    if (sound.source) {
      sound.source.volume = sound.baseVolume * masterVolume;
    }
  });
}

/**
 * Helper to play a sound safely
 */
export function playSound(audioObj) {
  if (audioObj.readyState >= 2) {
    audioObj.play().catch((e) => console.log("Audio play prevented:", e));
  }
}
