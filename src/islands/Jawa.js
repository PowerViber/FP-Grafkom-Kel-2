import * as THREE from "three";
import { createBlock } from "../utils/createBlock.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createClickableObject } from "../utils/createClickableObject.js";
import SARON_CONTENT from "../content/jawa_saron.js";
import KENDANG_CONTENT from "../content/jawa_kendang.js";
import KERIS_CONTENT from "../content/jawa_keris.js";
import ANGKLUNG_CONTENT from "../content/jawa_angklung.js";
import KENONG_CONTENT from "../content/jawa_kenong.js";
import { applyWallTexture, isWall } from "../utils/wallHelper.js";
import { createPictureFrame } from "../utils/createPictureFrame.js";

// Global reference to background music
let jawaBackgroundMusic = null;

const ANGKLUNG_AUDIO_MAP = {
  Object_36: "./src/assets/jawa_angklung_audio/c4.mp3", // c4
  Object_41: "./src/assets/jawa_angklung_audio/d4.mp3", // d4
  Object_31: "./src/assets/jawa_angklung_audio/e4.mp3", // e4
  Object_26: "./src/assets/jawa_angklung_audio/f4.mp3", // e4
  Object_21: "./src/assets/jawa_angklung_audio/g4.mp3", // f4
  Object_6: "./src/assets/jawa_angklung_audio/a4.mp3", // g4
  Object_11: "./src/assets/jawa_angklung_audio/b4.mp3", // a4
  Object_16: "./src/assets/jawa_angklung_audio/c5.mp3", // c5
};

export function createJawa(clickableObjectsArray) {
  const jawaBlock = createBlock("Jawa");

  // Initialize background music
  jawaBackgroundMusic = new Audio("./src/assets/jawa_backsound_gamelan.mp3");
  jawaBackgroundMusic.loop = true;
  jawaBackgroundMusic.volume = 0.2;
  jawaBackgroundMusic.preload = "auto";

  jawaBackgroundMusic.addEventListener("error", (e) => {
    console.error("Error loading Jawa background music:", e);
  });

  jawaBlock.userData.backgroundMusic = jawaBackgroundMusic;

  const zPositions = [
    {
      z: 30,
      model: "./src/assets/jawa_angklung.glb",
      content: ANGKLUNG_CONTENT,
      name: "Jawa-Angklung",
      inspect: {
        title: "Angklung",
        subtitle: "Type: Traditional Musical Instrument",
        audioPath: null,
      },
    },
    {
      z: 15,
      model: "./src/assets/jawa_kendang.glb",
      content: KENDANG_CONTENT,
      name: "Jawa-Kendang",
      inspect: {
        title: "Kendang",
        subtitle: "Type: Traditional Musical Instrument",
        audioPath: null,
      },
    },
    {
      z: 0,
      model: "./src/assets/jawa_saron_degung.glb",
      content: SARON_CONTENT,
      name: "Jawa-Saron",
      inspect: {
        title: "Saron",
        subtitle: "Type: Traditional Musical Instrument",
        audioPath: null,
      },
    },
    {
      z: -15,
      model: "./src/assets/jawa_keris.glb",
      content: KERIS_CONTENT,
      name: "Jawa-Keris",
      inspect: {
        title: "Keris",
        subtitle: "Type: Traditional Weapon",
        audioPath: null,
      },
    },
    {
      z: -30,
      model: "./src/assets/jawa_kenong.glb",
      content: KENONG_CONTENT,
      name: "Jawa-Kenong",
      inspect: {
        title: "Kenong",
        subtitle: "Type: Traditional Musical Instrument",
        audioPath: null,
        scale: 2.0,
      },
    },
  ];

  const xPosition = 0;

  zPositions.forEach(({ z }) => {
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitbox.position.set(xPosition, 2.5, z);
    jawaBlock.add(hitbox);
  });

  const loader = new GLTFLoader();

  loader.load("./src/assets/display_case.glb", (gltf) => {
    const baseModel = gltf.scene;

    zPositions.forEach(({ z, model, content, name, inspect }) => {
      if (name === "Jawa-Angklung") {
        createClickableObject(model, content, clickableObjectsArray, inspect)
          .then((artifact) => {
            artifact.scale.set(2, 2, 2);

            artifact.position.set(xPosition, 0, z);
            artifact.rotation.y = Math.PI / 2;

            artifact.traverse((child) => {
              if (child.isMesh) {
                const soundPath = ANGKLUNG_AUDIO_MAP[child.name];
                if (soundPath) {
                  child.userData.soundPath = soundPath;
                }
              }
            });

            artifact.name = name;
            jawaBlock.add(artifact);
          })
          .catch((error) => console.error(`Failed to load ${name}`, error));

        return;
      }

      const displayCase = baseModel.clone();
      displayCase.scale.set(3.5, 3.5, 3.5);
      displayCase.position.set(xPosition, 0, z);

      createClickableObject(model, content, clickableObjectsArray, inspect)
        .then((artifact) => {
          if (name.includes("Kendang")) {
            artifact.scale.set(0.2, 0.2, 0.2);
            artifact.position.set(0, 0.45, -0.15);
            artifact.rotation.y = Math.PI / 2;
          } else if (name.includes("Keris")) {
            artifact.scale.set(0.35, 0.35, 0.35);
            artifact.position.set(0, 0.5, 0.28);
            artifact.rotation.y = Math.PI / 2;
          } else if (name.includes("Saron")) {
            artifact.scale.set(0.5, 0.5, 0.5);
            artifact.position.set(0, 0.6, 0);
          } else if (name.includes("Angklung")) {
            artifact.scale.set(0.2, 0.2, 0.2);
            artifact.position.set(0, 0.5, 0);
            artifact.rotation.y = Math.PI;

            artifact.traverse((child) => {
              if (child.isMesh) {
                const soundPath = ANGKLUNG_AUDIO_MAP[child.name];
                if (soundPath) {
                  child.userData.soundPath = soundPath;
                }
              }
            });
          } else if (name.includes("Kenong")) {
            artifact.scale.set(0.02, 0.02, 0.02);
            artifact.position.set(0.2, 0.5, 0.2);
          }

          artifact.name = name;
          displayCase.add(artifact);
        })
        .catch((error) =>
          console.error(`Failed to load and wrap ${name}`, error)
        );

      jawaBlock.add(displayCase);
    });
  });

  const textureLoader = new THREE.TextureLoader();

  textureLoader.load(
    "./src/assets/wallpaper.jpg",
    (baseTexture) => {
      baseTexture.flipY = false;
      baseTexture.encoding = THREE.sRGBEncoding;
      baseTexture.wrapS = THREE.RepeatWrapping;
      baseTexture.wrapT = THREE.RepeatWrapping;

      jawaBlock.traverse((child) => {
        if (isWall(child)) {
          applyWallTexture(child, baseTexture);
        }
      });
    },
    undefined,
    (error) => {
      console.error("Error loading Jawa wall texture:", error);
    }
  );

  textureLoader.load("./src/assets/floor_texture.jpg", (floorTexture) => {
    floorTexture.flipY = false;
    floorTexture.encoding = THREE.sRGBEncoding;
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 8);

    jawaBlock.traverse((child) => {
      if (child.isMesh && child.userData && child.userData.isWalkable) {
        if (child.material) {
          child.material.map = floorTexture;
          child.material.needsUpdate = true;
        }
      }
    });
  });

  // Kanan Tembok (Right Wall)
  createPictureFrame(jawaBlock, {
    image: "./src/assets/jawa_frame/pangeran_diponegoro.jpg",
    position: { x: 10, y: 5, z: -30 },
    rotation: { x: Math.PI / 2, y: -Math.PI / 2, z: 0 },
    scale: 3,
    textureRotation: Math.PI / 2,
    clickableObjects: clickableObjectsArray,
    modalContent: `
        <h3 class="text-2xl font-semibold mb-4">Pangeran Diponegoro</h3>
        <p>Pahlawan nasional yang memimpin Perang Jawa (1825-1830) melawan pemerintah kolonial Hindia Belanda.</p>
        <p>Perang ini tercatat sebagai perang dengan korban terbesar dalam sejarah Indonesia.</p>
    `,
  });

  createPictureFrame(jawaBlock, {
    image: "./src/assets/jawa_frame/batik_mega_mendung.jpg",
    position: { x: 10, y: 5, z: -15 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 }, // Rotate texture if needed to fit frame orientation
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
        <h3 class="text-2xl font-semibold mb-4">Batik Mega Mendung</h3>
        <p>Motif batik khas dari Cirebon, Jawa Barat.</p>
        <p>Memiliki pola berbentuk awan dengan gradasi warna yang melambangkan dunia atas dan kebebasan.</p>
    `,
  });

  createPictureFrame(jawaBlock, {
    image: "./src/assets/jawa_frame/gamelan.jpg",
    position: { x: 10, y: 5, z: 0 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
        <h3 class="text-2xl font-semibold mb-4">Gamelan Jawa</h3>
        <p>Ensembel musik tradisional yang menonjolkan metalofon, gambang, gendang, dan gong.</p>
        <p>Musik gamelan menyajikan harmoni yang lembut dan mencerminkan keselarasan hidup masyarakat Jawa.</p>
    `,
  });

  createPictureFrame(jawaBlock, {
    image: "./src/assets/jawa_frame/wayang_kulit.jpg",
    position: { x: 10, y: 5, z: 15 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
        <h3 class="text-2xl font-semibold mb-4">Wayang Kulit</h3>
        <p>Seni pertunjukan boneka bayangan tradisional dari kulit yang dimainkan oleh seorang Dalang.</p>
        <p>Diakui oleh UNESCO sebagai Karya Agung Warisan Budaya Lisan dan Nonbendawi Manusia pada tahun 2003.</p>
    `,
  });

  // Kiri Tembok (Left Wall)
  createPictureFrame(jawaBlock, {
    image: "./src/assets/jawa_frame/rumah_joglo.jpg",
    position: { x: -10, y: 5, z: -30 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
        <h3 class="text-2xl font-semibold mb-4">Rumah Joglo</h3>
        <p>Rumah tradisional masyarakat Jawa dengan struktur atap tajug yang menjulang tinggi.</p>
        <p>Filosofi arsitekturnya mencerminkan status sosial dan hubungan harmonis antara manusia dan alam.</p>
    `,
  });

  createPictureFrame(jawaBlock, {
    image: "./src/assets/jawa_frame/reog_ponorogo.jpg",
    position: { x: -10, y: 5, z: -15 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
        <h3 class="text-2xl font-semibold mb-4">Reog Ponorogo</h3>
        <p>Tarian tradisional dari Ponorogo, Jawa Timur yang menampilkan topeng singa raksasa 'Singa Barong'.</p>
        <p>Seni ini melambangkan kekuatan dan keberanian, sering dipentaskan dalam berbagai upacara adat.</p>
    `,
  });

  createPictureFrame(jawaBlock, {
    image: "./src/assets/jawa_frame/badak_jawa.jpg",
    position: { x: -10, y: 5, z: 0 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
        <h3 class="text-2xl font-semibold mb-4">Badak Jawa</h3>
        <p>Badak bercula satu (Rhinoceros sondaicus) yang merupakan salah satu mamalia terlangka di bumi.</p>
        <p>Kini hanya dapat ditemukan di Taman Nasional Ujung Kulon, Banten.</p>
    `,
  });

  createPictureFrame(jawaBlock, {
    image: "./src/assets/jawa_frame/rawon.jpg",
    position: { x: -10, y: 5, z: 15 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
        <h3 class="text-2xl font-semibold mb-4">Rawon</h3>
        <p>Sup daging khas Jawa Timur yang memiliki kuah berwarna hitam pekat.</p>
        <p>Warna hitam ini berasal dari kluwek, rempah-rempah khusus yang memberikan cita rasa gurih dan unik.</p>
    `,
  });

  return jawaBlock;
}

// Export functions to control background music
export function playJawaMusic() {
  if (jawaBackgroundMusic && jawaBackgroundMusic.paused) {
    if (jawaBackgroundMusic.readyState >= 2) {
      jawaBackgroundMusic.play().catch((err) => {
        console.log("Jawa music play failed:", err);
      });
    }
  }
}

export function pauseJawaMusic() {
  if (jawaBackgroundMusic && !jawaBackgroundMusic.paused) {
    jawaBackgroundMusic.pause();
  }
}
