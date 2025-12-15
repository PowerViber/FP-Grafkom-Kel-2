export class AudioHelper {
    static play(audioPath) {
        // Create a new Audio object for each playback to allow overlapping sounds
        const audio = new Audio(audioPath);
        audio.play().catch((error) => {
            console.warn(`Could not play audio: ${audioPath}`, error);
        });
        return audio;
    }
}

// Convenience function
export function playInstrumentSound(instrumentName) {
    const path = `./src/assets/audio/sulawesi_${instrumentName}.mp3`;
    console.log(`Playing sound for: ${instrumentName} from ${path}`);
    return AudioHelper.play(path);
}
