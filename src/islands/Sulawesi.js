import * as THREE from "three";
import { createBlock } from "../utils/createBlock.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createClickableObject } from "../utils/createClickableObject.js";
import BADIK_CONTENT from "../content/sulawesi_badik.js";
import ADAT_TORAJA_CONTENT from "../content/sulawesi_adat_toraja.js";
import KECAPI_CONTENT from "../content/sulawesi_kecapi.js";
import JALAPPA_CONTENT from "../content/sulawesi_jalappa.js";
import PUIKPUIK_CONTENT from "../content/sulawesi_puikpuik.js";
import { applyWallTexture, isWall } from "../utils/wallHelper.js";
import { createPictureFrame } from "../utils/createPictureFrame.js";

// Global reference to background music
let sulawesiBackgroundMusic = null;

export function createSulawesi(clickableObjectsArray) {
  const sulawesiBlock = createBlock("Sulawesi");

  // Initialize background music with preload to prevent lag
  sulawesiBackgroundMusic = new Audio("./src/assets/sulawesi_angin_mamiri.mp3");
  sulawesiBackgroundMusic.loop = true;
  sulawesiBackgroundMusic.volume = 0.3;
  sulawesiBackgroundMusic.preload = "auto";

  // Add error handler to prevent crashes
  sulawesiBackgroundMusic.addEventListener("error", (e) => {
    console.error("Error loading Sulawesi background music:", e);
  });

  // Store reference in userData
  sulawesiBlock.userData.backgroundMusic = sulawesiBackgroundMusic;

  const zPositions = [
    {
      z: 10,
      model: "./src/assets/sulawesi_adat_toraja.glb",
      content: ADAT_TORAJA_CONTENT,
      name: "Sulawesi-Adat-Toraja",
    },
    {
      z: 0,
      model: "./src/assets/sulawesi_badik.glb",
      content: BADIK_CONTENT,
      name: "Sulawesi-Badik",
      inspectData: {
        modelPath: "./src/assets/sulawesi_badik.glb",
        title: "Badik",
        subtitle: "Senjata Tradisional",
        audioPath: null,
      },
    },
    {
      z: -10,
      model: "./src/assets/sulawesi_kecapi.glb",
      content: KECAPI_CONTENT,
      name: "Sulawesi-Kecapi",
      inspectData: {
        modelPath: "./src/assets/sulawesi_kecapi.glb",
        title: "Kecapi",
        subtitle: "Alat Musik Petik",
        audioPath: null,
        interactiveConfig: {
          type: "kecapi",
          zones: 8,
          audioMap: [
            "./src/assets/sulawesi_kecapi_do.mp3",
            "./src/assets/sulawesi_kecapi_re.mp3",
            "./src/assets/sulawesi_kecapi_mi.mp3",
            "./src/assets/sulawesi_kecapi_fa.mp3",
            "./src/assets/sulawesi_kecapi_so.mp3",
            "./src/assets/sulawesi_kecapi_la.mp3",
            "./src/assets/sulawesi_kecapi_si.mp3",
            "./src/assets/sulawesi_kecapi_doo.mp3",
          ],
        },
      },
    },
    {
      z: -20,
      model: "./src/assets/sulawesi_jalappa.glb",
      content: JALAPPA_CONTENT,
      name: "Sulawesi-Jalappa",
      inspectData: {
        modelPath: "./src/assets/sulawesi_jalappa.glb",
        title: "Jalappa",
        subtitle: "Alat Musik Pukul",
        audioPath: "./src/assets/sulawesi_jalappa.mp3",
        interactiveConfig: { type: "jalappa" },
      },
    },
    {
      z: -30,
      model: "./src/assets/sulawesi_puikpuik.glb",
      content: PUIKPUIK_CONTENT,
      name: "Sulawesi-Puikpuik",
      inspectData: {
        modelPath: "./src/assets/sulawesi_puikpuik.glb",
        title: "Puik-Puik",
        subtitle: "Alat Musik Tiup",
        audioPath: "./src/assets/sulawesi_puikpuik.mp3",
        interactiveConfig: { type: "puikpuik" },
      },
    },
  ];

  const xPosition = 0;

  // Hitbox
  zPositions.forEach(({ z }) => {
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitbox.position.set(xPosition, 2.5, z);
    sulawesiBlock.add(hitbox);
  });

  const loader = new GLTFLoader();

  loader.load("./src/assets/display_case.glb", (gltf) => {
    const baseModel = gltf.scene;

    zPositions.forEach(({ z, model, content, name, inspectData }) => {
      const displayCase = baseModel.clone();
      displayCase.scale.set(3.5, 3.5, 3.5);
      displayCase.position.set(xPosition, 0, z);

      createClickableObject(model, content, clickableObjectsArray, inspectData)
        .then((artifact) => {
          if (name.includes("Badik")) {
            // --- AREA DEBUGGING ---

            artifact.rotation.set(0, 0, 0);

            artifact.scale.set(15, 15, 15);

            artifact.position.set(0, 0.2, 0);

            console.log("Badik loaded:", artifact);
          } else if (name.includes("Adat-Toraja")) {
            artifact.scale.set(3.0, 3.0, 3.0);
            artifact.position.set(0, 0.8, 0);
            artifact.rotation.y = Math.PI / 2;
          } else if (name.includes("Kecapi")) {
            artifact.scale.set(0.1, 0.1, 0.1);
            artifact.position.set(0, 0.75, 0);
            artifact.rotation.set(0, Math.PI, Math.PI / 2);
          } else if (name.includes("Jalappa")) {
            artifact.scale.set(0.01, 0.01, 0.01);
            artifact.position.set(0, 0.5, 0);
            artifact.rotation.set(0, Math.PI / 2, 0);
            artifact.traverse((child) => {
              if (child.isMesh) {
                child.material.side = THREE.DoubleSide; // Ensure visibility
              }
            });
          } else if (name.includes("Puikpuik")) {
            artifact.scale.set(0.01, 0.01, 0.01);
            artifact.position.set(0, 0.55, 0);
            artifact.rotation.set(0, Math.PI / 2, 0);
            artifact.traverse((child) => {
              if (child.isMesh) {
                child.material.side = THREE.DoubleSide; // Ensure visibility
              }
            });
          }

          artifact.name = name;
          displayCase.add(artifact);
        })
        .catch((error) =>
          console.error(`GAGAL MEMUAT ARTEFAK: ${name}`, error)
        );

      sulawesiBlock.add(displayCase);
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

      sulawesiBlock.traverse((child) => {
        if (isWall(child)) {
          applyWallTexture(child, baseTexture);
        }
      });
    },
    undefined,
    (error) => {
      console.error("Error loading Sulawesi wall texture:", error);
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

  sulawesiBlock.traverse((child) => {
    if (child.isMesh && child.userData && child.userData.isWalkable) {
      if (child.material) {
        child.material.map = floorTexture;
        child.material.needsUpdate = true;
      }
    }
  });

  // Kanan Tembok
  createPictureFrame(sulawesiBlock, {
    image: "./src/assets/sulawesi_frame/sutrasengkang.jpg",
    position: { x: 10, y: 5, z: -30 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
        <h3 class="text-2xl font-semibold mb-4">Sutra Sengkang</h3>
        <p>Kain tenun sutra khas dari Sengkang, Kabupaten Wajo.</p>
        <p>Motifnya yang unik dan warna-warni cerah menjadikannya simbol kebanggaan budaya Sulawesi Selatan.</p>
    `,
  });

  createPictureFrame(sulawesiBlock, {
    image: "./src/assets/sulawesi_frame/sultanhasanuddin.jpg",
    position: { x: 10, y: 5, z: -15 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Sultan Hasanuddin</h3>
      <p>Dijuluki "Ayam Jantan dari Timur", beliau adalah Raja Gowa ke-16 dan Pahlawan Nasional.</p>
      <p>Beliau memimpin perlawanan gigih melawan VOC Belanda untuk mempertahankan kedaulatan kerajaan Gowa-Tallo.</p>
    `,
  });

  createPictureFrame(sulawesiBlock, {
    image: "./src/assets/sulawesi_frame/pohoneboni.jpg",
    position: { x: 10, y: 5, z: 0 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Pohon Eboni</h3>
      <p>Kayu hitam Sulawesi (<i>Diospyros celebica</i>), flora identitas Sulawesi Tengah.</p>
      <p>Kayu ini sangat berharga karena teksturnya yang halus, keras, dan berwarna hitam legam, sering digunakan untuk ukiran dan furnitur mewah.</p>
    `,
  });

  createPictureFrame(sulawesiBlock, {
    image: "./src/assets/sulawesi_frame/mariawalanda.jpg",
    position: { x: 10, y: 5, z: 15 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Maria Walanda Maramis</h3>
      <p>Pahlawan pergerakan nasional dari Minahasa yang memperjuangkan emansipasi wanita.</p>
      <p>Beliau mendirikan PIKAT (Percintaan Ibu Kepada Anak Temurunnya) untuk memajukan pendidikan kaum perempuan.</p>
    `,
  });

  createPictureFrame(sulawesiBlock, {
    image: "./src/assets/sulawesi_frame/tarikipaspakarena.jpg",
    position: { x: 10, y: 5, z: 30 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Tari Kipas Pakarena</h3>
      <p>Tarian tradisional dari Gowa yang mencerminkan kelembutan dan kesantunan wanita Gowa.</p>
      <p>Gerakannya yang lembut kontras dengan irama gendang yang menggebu, menyimbolkan ketangguhan di balik kelembutan.</p>
    `,
  });

  // Kiri Tembok
  createPictureFrame(sulawesiBlock, {
    image: "./src/assets/sulawesi_frame/rumahtongkonan.jpeg",
    position: { x: -10, y: 5, z: -30 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Rumah Tongkonan</h3>
      <p>Rumah adat masyarakat Toraja dengan atap melengkung khas menyerupai perahu.</p>
      <p>Tongkonan bukan sekadar tempat tinggal, tetapi pusat kehidupan sosial dan spiritual marga Toraja.</p>
    `,
  });

  createPictureFrame(sulawesiBlock, {
    image: "./src/assets/sulawesi_frame/samratulangi.jpg",
    position: { x: -10, y: 5, z: -15 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Sam Ratulangi</h3>
      <p>Dr. Gerungan Saul Samuel Jacob Ratulangi, Gubernur pertama Sulawesi dan pahlawan nasional.</p>
      <p>Filsafatnya "Si Tou Timou Tumou Tou" (Manusia hidup untuk memanusiakan orang lain) menjadi landasan hidup masyarakat Minahasa.</p>
    `,
  });

  createPictureFrame(sulawesiBlock, {
    image: "./src/assets/sulawesi_frame/anoa.jpg",
    position: { x: -10, y: 5, z: 0 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Anoa</h3>
      <p>Satwa endemik Sulawesi yang dikenal sebagai sapi hutan kerdil.</p>
      <p>Hewan ini dilindungi dan terancam punah, hidup di hutan hujan tropis Sulawesi.</p>
    `,
  });

  createPictureFrame(sulawesiBlock, {
    image: "./src/assets/sulawesi_frame/rambusolo.jpg",
    position: { x: -10, y: 5, z: 15 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Rambu Solo</h3>
      <p>Upacara pemakaman adat masyarakat Toraja yang sangat sakral dan meriah.</p>
      <p>Bertujuan untuk mengantarkan arwah leluhur ke alam roh, seringkali melibatkan pengorbanan kerbau.</p>
    `,
  });

  createPictureFrame(sulawesiBlock, {
    image: "./src/assets/sulawesi_frame/tamannasionalbunaken.jpg",
    position: { x: -10, y: 5, z: 30 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Taman Nasional Bunaken</h3>
      <p>Taman laut yang terletak di Teluk Manado, terkenal dengan keanekaragaman hayati lautnya yang luar biasa.</p>
      <p>Menjadi salah satu destinasi menyelam terbaik di dunia.</p>
    `,
  });

  return sulawesiBlock;
}

// Export functions to control background music
export function playSulawesiMusic() {
  if (sulawesiBackgroundMusic && sulawesiBackgroundMusic.paused) {
    // Only play if audio is ready to prevent lag
    if (sulawesiBackgroundMusic.readyState >= 2) {
      // HAVE_CURRENT_DATA or higher
      sulawesiBackgroundMusic.play().catch((err) => {
        console.log("Sulawesi music play failed:", err);
      });
    }
  }
}

export function pauseSulawesiMusic() {
  if (sulawesiBackgroundMusic && !sulawesiBackgroundMusic.paused) {
    sulawesiBackgroundMusic.pause();
  }
}
