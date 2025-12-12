import * as THREE from "three";
import { createBlock } from "../utils/createBlock.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createClickableObject } from "../utils/createClickableObject.js";
import MANDAU_CONTENT from "../content/kalimantan_mandau.js";
import REBAB_CONTENT from "../content/kalimantan_rebab.js";
import SAPE_CONTENT from "../content/kalimantan_sapek.js";
import TALAWANG_CONTENT from "../content/kalimantan_talawang.js";
import { applyWallTexture, isWall } from "../utils/wallHelper.js";
import { createPictureFrame } from "../utils/createPictureFrame.js";
import { registerSound } from "../utils/audioManager.js";

// Global reference to background music
let kalimantanBackgroundMusic = null;
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createClickableObject } from "../utils/createClickableObject.js";
import MANDAU_CONTENT from "../content/kalimantan_mandau.js";
import SAPEK_CONTENT from "../content/kalimantan_sapek.js";
import SHIELD_CONTENT from "../content/kalimantan_shield.js";
import REBAB_CONTENT from "../content/kalimantan_rebab.js";

export function createKalimantan(clickableObjectsArray) {
  const kalimantanBlock = createBlock("Kalimantan");

  kalimantanBackgroundMusic = new Audio("./src/assets/kalimantan_bgm.mp3");
  kalimantanBackgroundMusic.loop = true;
  registerSound(kalimantanBackgroundMusic, 0.3);
  kalimantanBackgroundMusic.preload = "auto";

  // Add error handler to prevent crashes
  kalimantanBackgroundMusic.addEventListener("error", (e) => {
    console.error("Error loading Kalimantan background music:", e);
  });

  // Store reference in userData
  kalimantanBlock.userData.backgroundMusic = kalimantanBackgroundMusic;

  const zPositions = [
    {
      z: 15,
      model: "./src/assets/kalimantan_mandau.glb",
      content: MANDAU_CONTENT,
      name: "Kalimantan-Mandau",
      inspect: {
        title: "Mandau",
        subtitle: "Type: Senjata Tradisional",
        audioPath: null,
      },
      scale: { x: 2.5, y: 2.5, z: 2.5 },
      position: { x: 0, y: 0.35, z: -0.3 },
      rotation: { x: 0, y: Math.PI / 2, z: Math.PI / 4 },
    },
    {
      z: 5,
      model: "./src/assets/kalimantan_talawang.glb",
      content: TALAWANG_CONTENT,
      name: "Kalimantan-Talawang",
      inspect: {
        title: "Talawang",
        subtitle: "Type: Perisai Tradisional",
        audioPath: null,
      },
      scale: { x: 0.15, y: 0.15, z: 0.15 },
      position: { x: 0, y: 0.8, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
    },
    {
      z: -5,
      model: "./src/assets/kalimantan_sapek.glb",
      content: SAPE_CONTENT,
      name: "Kalimantan-Sape",
      inspect: {
        title: "Sape",
        subtitle: "Type: Alat Musik Tradisional",
        audioPath: null,
      },
      scale: { x: 0.3, y: 0.3, z: 0.3 },
      position: { x: -0.5, y: 0.7, z: 0 },
      rotation: { x: 0, y: 0, z: -Math.PI / 2 + Math.PI / 8 },
    },
    {
      z: -15,
      model: "./src/assets/kalimantan_rebab.glb",
      content: REBAB_CONTENT,
      name: "Kalimantan-Rebab",
      inspect: {
        title: "Rebab",
        subtitle: "Type: Alat Musik Tradisional",
        audioPath: null,
      },
      scale: { x: 0.016, y: 0.016, z: 0.016 },
      position: { x: 0, y: 0.5, z: 0 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
    },
  ];

  const xPosition = 0;

  zPositions.forEach(({ z }) => {
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitbox.position.set(xPosition, 2.5, z);
    kalimantanBlock.add(hitbox);
  });

  const loader = new GLTFLoader();

  loader.load("./src/assets/display_case.glb", (gltf) => {
    const baseModel = gltf.scene;

    zPositions.forEach(
      ({ z, model, content, name, inspect, scale, position, rotation }) => {
        const displayCase = baseModel.clone();
        displayCase.scale.set(2.5, 2.5, 2.5);
        displayCase.position.set(xPosition, 0, z);

        createClickableObject(model, content, clickableObjectsArray, inspect)
          .then((artifact) => {
            // Use custom scale/position/rotation if provided, otherwise use defaults
            if (scale && position && rotation !== undefined) {
              artifact.scale.set(scale.x, scale.y, scale.z);
              artifact.position.set(position.x, position.y, position.z);
              // Apply rotation on all axes if provided
              if (rotation.x !== undefined) artifact.rotation.x = rotation.x;
              if (rotation.y !== undefined) artifact.rotation.y = rotation.y;
              if (rotation.z !== undefined) artifact.rotation.z = rotation.z;
            } else if (name.includes("Kompang")) {
              artifact.scale.set(0.5, 0.5, 0.5);
              artifact.position.set(0, 0.6, 0);
              artifact.rotation.y = Math.PI / 2;
            } else if (name.includes("Tambua")) {
              artifact.scale.set(0.3, 0.3, 0.3);
              artifact.position.set(0, 0.5, 0);
            } else if (name.includes("Rencong")) {
              artifact.scale.set(0.175, 0.175, 0.175);
              artifact.position.set(0, 0.5, 0);
              artifact.rotation.y = Math.PI / 2;
            }

            artifact.name = name;
            displayCase.add(artifact);
          })
          .catch((error) => console.error(`Failed to load ${name}:`, error));

        kalimantanBlock.add(displayCase);
      }
    );
  });

  const textureLoader = new THREE.TextureLoader();

  textureLoader.load(
    "./src/assets/wallpaper.jpg",
    (baseTexture) => {
      baseTexture.flipY = false;
      baseTexture.encoding = THREE.sRGBEncoding;
      baseTexture.wrapS = THREE.RepeatWrapping;
      baseTexture.wrapT = THREE.RepeatWrapping;

      kalimantanBlock.traverse((child) => {
        if (isWall(child)) {
          applyWallTexture(child, baseTexture);
        }
      });
    },
    undefined,
    (error) => {
      console.error("Error loading Kalimantan wall texture:", error);
    }
  );

  textureLoader.load(
    "./src/assets/floor_texture.jpg",
    (floorTexture) => {
      floorTexture.flipY = false;
      floorTexture.encoding = THREE.sRGBEncoding;
      floorTexture.wrapS = THREE.RepeatWrapping;
      floorTexture.wrapT = THREE.RepeatWrapping;
      floorTexture.repeat.set(4, 4);

      kalimantanBlock.traverse((child) => {
        if (child.isMesh && child.userData && child.userData.isWalkable) {
          if (child.material) {
            child.material.map = floorTexture;
            child.material.needsUpdate = true;
          }
        }
      });
    },
    undefined,
    (error) => {
      console.error("Error loading Kalimantan floor texture:", error);
    }
  );

  // Kanan Tembok
  createPictureFrame(kalimantanBlock, {
    image: "./src/assets/kalimantan_frame/tarigiring.jpg",
    position: { x: 10, y: 5, z: -30 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Tari Giring-Giring</h3>
      <p>Tarian pergaulan muda-mudi Dayak Ma'anyan yang penuh sukacita.</p>
      <p>Penari memegang tongkat bambu yang diisi biji-bijian, yang ketika dihentakkan ke lantai menghasilkan irama musik yang harmonis dan serempak.</p>
    `,
  });

  createPictureFrame(kalimantanBlock, {
    image: "./src/assets/kalimantan_frame/orangutan.jpg",
    position: { x: 10, y: 5, z: -15 },
    rotation: { x: Math.PI / 2, y: -Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Orangutan Kalimantan</h3>
      <p><i>Pongo pygmaeus</i>, kera besar asli pulau Kalimantan.</p>
      <p>Dikenal sebagai "manusia hutan", mereka adalah spesies payung yang sangat penting bagi regenerasi hutan tropis Kalimantan. Mereka kini berstatus terancam punah.</p>
    `,
  });

  createPictureFrame(kalimantanBlock, {
    image: "./src/assets/kalimantan_frame/sotobanjar.jpg",
    position: { x: 10, y: 5, z: 0 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Soto Banjar</h3>
      <p>
        Soto Banjar adalah ikon kuliner Kalimantan Selatan yang lahir dari pertemuan lima budaya: Banjar, Tiongkok, Belanda, India, dan Arab.
      </p>
      <p>
        Keunikan utamanya terletak pada kuah kaldu ayam kampung yang harum semerbak karena rempah-rempah kuat seperti kayu manis, cengkih, bunga lawang, dan kapulaga.
        Biasanya disajikan dengan ketupat, soun, perkedel kentang, dan telur itik, soto ini melambangkan keharmonisan multikultural masyarakat Banjar.
      </p>
    `,
  });

  createPictureFrame(kalimantanBlock, {
    image: "./src/assets/kalimantan_frame/antasari.jpg",
    position: { x: 10, y: 5, z: 15 },
    rotation: { x: Math.PI / 2, y: -Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Pangeran Antasari</h3>
      <p>Pahlawan Nasional dari Kalimantan Selatan dan Sultan Banjar.</p>
      <p>Beliau memimpin Perang Banjar melawan Belanda dengan semboyan terkenal "Haram Manyerah Waja Sampai Kaputing" (Pantang Menyerah, Kuat Seperti Baja Sampai Akhir).</p>
    `,
  });

  createPictureFrame(kalimantanBlock, {
    image: "./src/assets/kalimantan_frame/pasarapung.jpg",
    position: { x: 10, y: 5, z: 30 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Pasar Terapung</h3>
      <p>Tradisi jual beli unik di atas sungai yang telah berlangsung ratusan tahun di Banjarmasin.</p>
      <p>Para pedagang (mayoritas ibu-ibu) menggunakan perahu "Jukung" untuk menjajakan hasil kebun, menciptakan pemandangan pagi yang ikonik.</p>
    `,
  });

  // Kiri Tembok
  createPictureFrame(kalimantanBlock, {
    image: "./src/assets/kalimantan_frame/bekantan.jpg",
    position: { x: -10, y: 5, z: -30 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Bekantan</h3>
      <p>Monyet unik berhidung panjang yang menjadi maskot fauna Kalimantan Selatan.</p>
      <p>Primata endemik ini hidup di hutan bakau dan rawa-rawa. Hidung besar pada pejantan berfungsi untuk menarik perhatian betina.</p>
    `,
  });

  createPictureFrame(kalimantanBlock, {
    image: "./src/assets/kalimantan_frame/burungenggang.jpg",
    position: { x: -10, y: 5, z: -15 },
    rotation: { x: -Math.PI / 2, y: Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Burung Enggang</h3>
      <p>Simbol kemuliaan dan kesucian bagi Suku Dayak.</p>
      <p>Burung ini dianggap sebagai panglima burung yang menghubungkan dunia manusia dengan dewata. Hampir seluruh bagian tubuhnya menjadi inspirasi motif ukiran dan tarian adat.</p>
    `,
  });

  createPictureFrame(kalimantanBlock, {
    image: "./src/assets/kalimantan_frame/rumahbetang.jpg",
    position: { x: -10, y: 5, z: 0 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Rumah Betang</h3>
      <p>Rumah adat Suku Dayak yang berbentuk panggung memanjang.</p>
      <p>Satu rumah bisa dihuni oleh puluhan keluarga, melambangkan filosofi hidup komunal, gotong royong, dan kerukunan yang sangat kuat dalam masyarakat Dayak.</p>
    `,
  });

  createPictureFrame(kalimantanBlock, {
    image: "./src/assets/kalimantan_frame/tijilik.jpg",
    position: { x: -10, y: 5, z: 15 },
    rotation: { x: -Math.PI / 2, y: Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Tjilik Riwut</h3>
      <p>Pahlawan Nasional dan Gubernur pertama Kalimantan Tengah.</p>
      <p>Putra Dayak yang berjasa besar dalam memimpin pasukan terjun payung pertama AURI di Kalimantan dan mengintegrasikan wilayah pedalaman Kalimantan ke dalam Republik Indonesia.</p>
    `,
  });

  createPictureFrame(kalimantanBlock, {
    image: "./src/assets/kalimantan_frame/kain.jpg",
    position: { x: -10, y: 5, z: 30 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Tenun Ulap Doyo</h3>
      <p>Kain tenun khas Suku Dayak Benuaq yang terbuat dari serat daun Doyo.</p>
      <p>Tanaman Doyo hanya tumbuh liar di pedalaman Kalimantan. Seratnya yang kuat ditenun secara manual menjadi kain dengan motif-motif yang menceritakan mitologi suku.</p>
    `,
  });

  return kalimantanBlock;
}

// Export functions to control background music
export function playKalimantanMusic() {
  if (kalimantanBackgroundMusic && kalimantanBackgroundMusic.paused) {
    // Only play if audio is ready to prevent lag
    if (kalimantanBackgroundMusic.readyState >= 2) {
      // HAVE_CURRENT_DATA or higher
      kalimantanBackgroundMusic.play().catch((err) => {
        console.log("Kalimantan music play failed:", err);
      });
    }
  }
}

export function pauseKalimantanMusic() {
  if (kalimantanBackgroundMusic && !kalimantanBackgroundMusic.paused) {
    kalimantanBackgroundMusic.pause();
  }
}
