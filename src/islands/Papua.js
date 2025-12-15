import * as THREE from "three";
import { createBlock } from "../utils/createBlock.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createClickableObject } from "../utils/createClickableObject.js";
import TIFA_CONTENT from "../content/papua_tifa.js";
import FUU_CONTENT from "../content/papua_fuu.js";
import TRITON_CONTENT from "../content/papua_triton.js";
import { applyWallTexture, isWall } from "../utils/wallHelper.js";
import { createPictureFrame } from "../utils/createPictureFrame.js";
import { registerSound } from "../utils/audioManager.js";

let papuaBackgroundMusic = null;

export function createPapua(clickableObjectsArray) {
  const papuaBlock = createBlock("Papua");

  // Ganti jadi audio yang sesuai daerah kalian
  papuaBackgroundMusic = new Audio("./src/assets/papua_bgm.mp3");
  papuaBackgroundMusic.loop = true;
  //Ganti volume default daerah kalian disini
  registerSound(papuaBackgroundMusic, 0.3);
  papuaBackgroundMusic.preload = "auto";

  // Add error handler to prevent crashes
  papuaBackgroundMusic.addEventListener('error', (e) => {
    console.error('Error loading Papua background music:', e);
  });

  // Store reference in userData
  papuaBlock.userData.backgroundMusic = papuaBackgroundMusic;

  const zPositions = [
    {
      z: 10,
      model: "./src/assets/papua_tifa.glb",
      content: TIFA_CONTENT,
      name: "Papua-Tifa",
      inspect: { title: "Tifa", subtitle: "Type: Musical Instrument", audioPath: "./src/assets/papua_suara_tifa.mp3" }
    },
    {
      z: 0,
      model: "./src/assets/papua_fuu.glb",
      content: FUU_CONTENT,
      name: "Papua-Fuu",
      inspect: { title: "Fuu", subtitle: "Type: Musical Instrument", audioPath: "./src/assets/papua_suara_fuu.mp3" }
    },
    {
      z: -10,
      model: "./src/assets/papua_triton.glb",
      content: TRITON_CONTENT,
      name: "Papua-Triton",
      inspect: { title: "Triton", subtitle: "Type: Musical Instrument", audioPath: "./src/assets/papua_suara_triton.mp3" }
    },
  ];

  const xPosition = 0;

  zPositions.forEach(({ z }) => {
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitbox.position.set(xPosition, 2.5, z);
    papuaBlock.add(hitbox);
  });

  const loader = new GLTFLoader();

  loader.load("./src/assets/display_case.glb", (gltf) => {
    const baseModel = gltf.scene;

    zPositions.forEach(({ z, model, content, name,  inspect }) => {
      const displayCase = baseModel.clone();
      displayCase.scale.set(2.5, 2.5, 2.5);
      displayCase.position.set(xPosition, 0, z);

      createClickableObject(model, content, clickableObjectsArray, inspect)
        .then((artifact) => {
          if (name.includes("Tifa")) {
            artifact.scale.set(0.3, 0.3, 0.3);
            artifact.position.set(0, 0.75, 0);
            artifact.rotation.y = Math.PI / 2;
          } else if (name.includes("Fuu")) {
            artifact.scale.set(0.75, 0.75, 0.75);
            artifact.position.set(0, 0.55, 0);
            artifact.rotation.z = Math.PI / 2;
            artifact.rotation.y = Math.PI / 2;
          } else if (name.includes("Triton")) {
            artifact.scale.set(7.5, 7.5, 7.5);
            artifact.position.set(0, 0.6, 0);
          }
          artifact.name = name;
          displayCase.add(artifact);
        })
        .catch((error) =>
          console.error(`Failed to load and wrap ${name}`, error)
        );

      papuaBlock.add(displayCase);
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

      papuaBlock.traverse((child) => {
        if (isWall(child)) {
          applyWallTexture(child, baseTexture);
        }
      });
    },
    undefined,
    (error) => {
      console.error("Error loading Sumatra wall texture:", error);
    }
  );

  const floorTexture = textureLoader.load(
    "./src/assets/floor_texture.jpg",
    (tex) => {
      tex.flipY = false;
      tex.encoding = THREE.sRGBEncoding;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 8);
    }
  );

  papuaBlock.traverse((child) => {
    if (child.isMesh && child.userData && child.userData.isWalkable) {
      if (child.material) {
        child.material.map = floorTexture;
        child.material.needsUpdate = true;
      }
    }
  });

  // Kanan Tembok
  createPictureFrame(papuaBlock, {
    image: "./src/assets/papua_frame/papeda.jpg",
    position: { x: 10, y: 5, z: -30 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
          <h3 class="text-2xl font-semibold mb-4">Papeda</h3>
          <p>Makanan pokok khas Papua dan Maluku yang terbuat dari sagu, berupa bubur kental berwarna putih bening dengan tekstur kenyal seperti lem, kaya karbohidrat dan serat, serta biasanya disajikan bersama lauk ikan kuah kuning atau sayuran seperti sayur daun melinjo atau ganemo.</p>
          <p>Melambangkan kebersamaan dan kearifan lokal, sering disebut "Papua Penuh Damai" (Papua Penuh Damai).</p>
      `,
  });

  createPictureFrame(papuaBlock, {
    image: "./src/assets/papua_frame/ukiranasmat.jpg",
    position: { x: 10, y: 5, z: -15 },
    rotation: { x: Math.PI / 2, y: -Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Ukiran Asmat (Patung Mbis)</h3>
      <p>Karya seni ukir kayu dari Suku Asmat yang telah mendunia.</p>
      <p>Patung Mbis adalah tiang leluhur yang diukir bertingkat-tingkat, dipercaya sebagai tempat bersemayam roh nenek moyang dan simbol perlindungan bagi desa.</p>
      `,
  });

  createPictureFrame(papuaBlock, {
    image: "./src/assets/papua_frame/belati.jpg",
    position: { x: 10, y: 5, z: 0 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Belati Tulang Kasuari</h3>
      <p>Senjata tradisional khas Papua yang terbuat dari tulang kaki burung Kasuari.</p>
      <p>Hulu belati ini biasanya dihiasi dengan anyaman serat kulit kayu dan bulu burung kasuari. Selain untuk berburu, senjata ini juga memiliki nilai adat yang tinggi.</p>
      `,
  });

  createPictureFrame(papuaBlock, {
    image: "./src/assets/papua_frame/franskaisiepo.jpg",
    position: { x: 10, y: 5, z: 15 },
    rotation: { x: Math.PI / 2, y: -Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
        <h3 class="text-2xl font-semibold mb-4">Frans Kaisiepo</h3>
        <p>Pahlawan Nasional Indonesia dan Gubernur keempat Provinsi Papua.</p>
        <p>Beliau terkenal dengan sikap nasionalismenya yang kuat, termasuk mengusulkan nama "Irian" (Ikut Republik Indonesia Anti-Nederland) pada Konferensi Malino 1946 untuk menggantikan nama Papua Belanda.</p>
      `,
  });

  createPictureFrame(papuaBlock, {
    image: "./src/assets/papua_frame/noken.jpg",
    position: { x: 10, y: 5, z: 30 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Noken</h3>
      <p>Tas tradisional Papua yang dianyam dari serat kulit kayu.</p>
      <p>Diakui UNESCO sebagai Warisan Budaya Takbenda, Noken melambangkan kehidupan yang baik, perdamaian, dan kesuburan. Cara membawanya yang unik adalah dengan digantungkan di kepala.</p>
      `,
  });

  // Kiri Tembok
  createPictureFrame(papuaBlock, {
    image: "./src/assets/papua_frame/honai.jpg",
    position: { x: -10, y: 5, z: -30 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Rumah Honai</h3>
      <p>Rumah adat khas Suku Dani di Lembah Baliem.</p>
      <p>Berbentuk bundar dengan atap kerucut dari jerami, desain mungil tanpa jendela ini bertujuan untuk menahan hawa dingin pegunungan dan menjaga kehangatan api unggun di dalamnya.</p>
      `,
  });

  createPictureFrame(papuaBlock, {
    image: "./src/assets/papua_frame/cendrawasih.jpg",
    position: { x: -10, y: 5, z: -15 },
    rotation: { x: -Math.PI / 2, y: Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Burung Cenderawasih</h3>
      <p>Dikenal sebagai "Bird of Paradise" karena keindahan bulunya yang luar biasa.</p>
      <p>Burung endemik Papua ini memiliki peran penting dalam ekosistem hutan hujan tropis dan menjadi simbol kebanggaan identitas masyarakat Papua.</p>
      `,
  });

  createPictureFrame(papuaBlock, {
    image: "./src/assets/papua_frame/puncakjaya.jpg",
    position: { x: -10, y: 5, z: 0 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Puncak Jaya (Carstensz Pyramid)</h3>
      <p>Puncak tertinggi di Indonesia (4.884 mdpl) dan merupakan bagian dari Pegunungan Jayawijaya.</p>
      <p>Keunikan utamanya adalah gletser tropis atau "salju abadi" yang menyelimuti puncaknya, sebuah fenomena alam yang sangat langka di negara khatulistiwa.</p>
      `,
  });

  createPictureFrame(papuaBlock, {
    image: "./src/assets/papua_frame/silaspapare.jpg",
    position: { x: -10, y: 5, z: 15 },
    rotation: { x: -Math.PI / 2, y: Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Silas Papare</h3>
      <p>Pejuang kemerdekaan Indonesia dari Serui, Papua.</p>
      <p>Beliau mendirikan Partai Kemerdekaan Indonesia Irian (PKII) dan gigih berjuang baik melalui jalur politik maupun gerilya untuk mengusir Belanda dan menyatukan Papua ke dalam pangkuan Ibu Pertiwi.</p>
      `,
  });

  createPictureFrame(papuaBlock, {
    image: "./src/assets/papua_frame/rajaampat.jpg",
    position: { x: -10, y: 5, z: 30 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Kepulauan Raja Ampat</h3>
      <p>Gugusan kepulauan di Papua Barat yang dikenal sebagai salah satu pusat keanekaragaman hayati laut terkaya di dunia.</p>
      <p>Nama "Raja Ampat" berasal dari mitos lokal tentang empat raja yang menetas dari telur naga dan memerintah empat pulau utama: Waigeo, Batanta, Salawati, dan Misool.</p>
      `,
  });

  return papuaBlock;
}

// Export functions to control background music
export function playPapuaMusic() {
  if (papuaBackgroundMusic && papuaBackgroundMusic.paused) {
    // Only play if audio is ready to prevent lag
    if (papuaBackgroundMusic.readyState >= 2) { // HAVE_CURRENT_DATA or higher
      papuaBackgroundMusic.play().catch(err => {
        console.log("Sumatra music play failed:", err);
      });
    }
  }
}

export function pausePapuaMusic() {
  if (papuaBackgroundMusic && !papuaBackgroundMusic.paused) {
    papuaBackgroundMusic.pause();
  }
}

