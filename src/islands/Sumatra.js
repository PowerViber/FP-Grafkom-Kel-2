import * as THREE from "three";
import { createBlock } from "../utils/createBlock.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createClickableObject } from "../utils/createClickableObject.js";
import KOMPANG_CONTENT from "../content/sumatra_kompang.js";
import TAMBUA_CONTENT from "../content/sumatra_tambua.js";
import RENCONG_CONTENT from "../content/sumatra_rencong.js";
import RENDANG_CONTENT from "../content/sumatra_rendang.js";
import MEUNASAH_CONTENT from "../content/sumatra_meunasah.js";
import { applyWallTexture, isWall } from "../utils/wallHelper.js";
import { createPictureFrame } from "../utils/createPictureFrame.js";
import { registerSound } from "../utils/audioManager.js";

// Global reference to background music
let sumatraBackgroundMusic = null;

export function createSumatra(clickableObjectsArray) {
  const sumatraBlock = createBlock("Sumatra");

  // Initialize background music with preload to prevent lag
  sumatraBackgroundMusic = new Audio("./src/assets/sumatra_pariaman.mp3");
  sumatraBackgroundMusic.loop = true;
  registerSound(sumatraBackgroundMusic, 0.3);
  sumatraBackgroundMusic.preload = "auto";

  // Add error handler to prevent crashes
  sumatraBackgroundMusic.addEventListener('error', (e) => {
    console.error('Error loading Sumatra background music:', e);
  });

  // Store reference in userData
  sumatraBlock.userData.backgroundMusic = sumatraBackgroundMusic;

  const zPositions = [
    {
      z: 25,
      model: "./src/assets/sumatra_rendang.glb",
      content: RENDANG_CONTENT,
      name: "Sumatra-Rendang",
      inspect: { title: "Rendang", subtitle: "Type: Traditional Food", audioPath: null },
      scale: { x: 2.4, y: 2.4, z: 2.4 },
      position: { x: 0, y: 0.55, z: 0 },
      rotation: { x: Math.PI / 4, y: 0, z: 0 }, // 45 degrees tilt forward
    },
    {
      z: 10,
      model: "./src/assets/sumatra_kompang.glb",
      content: KOMPANG_CONTENT,
      name: "Sumatra-Kompang",
      inspect: { title: "Kompang", subtitle: "Type: Musical Instrument", audioPath: "./src/assets/sumatra_suara_kompang.mp3" },
    },
    {
      z: 0,
      model: "./src/assets/sumatra_tambua.glb",
      content: TAMBUA_CONTENT,
      name: "Sumatra-Tambua",
      inspect: { title: "Tambua", subtitle: "Type: Musical Instrument", audioPath: "./src/assets/sumatra_suara_tambua.mp3" },
    },
    {
      z: -10,
      model: "./src/assets/sumatra_rencong_aceh.glb",
      content: RENCONG_CONTENT,
      name: "Sumatra-Rencong",
      inspect: { title: "Rencong Aceh", subtitle: "Type: Traditional Weapon", audioPath: null },
    },
    {
      z: -25,
      model: "./src/assets/sumatra_meunasah_tuha_dayah_muara_minaret.glb",
      content: MEUNASAH_CONTENT,
      name: "Sumatra-Meunasah",
      inspect: { title: "Meunasah Minaret", subtitle: "Type: Historical Architecture", audioPath: null },
      scale: { x: 0.05, y: 0.05, z: 0.05 },
      position: { x: 0.1, y: 0.4, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    },
  ];

  const xPosition = 0;

  zPositions.forEach(({ z }) => {
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitbox.position.set(xPosition, 2.5, z);
    sumatraBlock.add(hitbox);
  });

  const loader = new GLTFLoader();

  loader.load("./src/assets/display_case.glb", (gltf) => {
    const baseModel = gltf.scene;

    zPositions.forEach(({ z, model, content, name, inspect, scale, position, rotation }) => {
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
        .catch((error) =>
          console.error(`Failed to load ${name}:`, error)
        );

      sumatraBlock.add(displayCase);
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

      sumatraBlock.traverse((child) => {
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

  textureLoader.load(
    "./src/assets/floor_texture.jpg",
    (floorTexture) => {
      floorTexture.flipY = false;
      floorTexture.encoding = THREE.sRGBEncoding;
      floorTexture.wrapS = THREE.RepeatWrapping;
      floorTexture.wrapT = THREE.RepeatWrapping;
      floorTexture.repeat.set(4, 4);

      sumatraBlock.traverse((child) => {
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
      console.error("Error loading Sumatra floor texture:", error);
    }
  );

  // Kanan Tembok
  createPictureFrame(sumatraBlock, {
    image: "./src/assets/sumatra_frame/ulos.jpg",
    position: { x: 10, y: 5, z: -30 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
        <h3 class="text-2xl font-semibold mb-4">Ulos Batak</h3>
        <p>Kain tenun tangan tradisional kebanggaan masyarakat Batak.</p>
        <p>Ulos bukan sekadar pakaian, melainkan benda seremonial yang dipertukarkan dalam pernikahan, pemakaman, dan kelahiran sebagai simbol berkat dan kehangatan spiritual.</p>
    `,
  });

  createPictureFrame(sumatraBlock, {
    image: "./src/assets/sumatra_frame/tuankuimambonjol.jpg",
    position: { x: 10, y: 5, z: -15 },
    rotation: { x: Math.PI / 2, y: -Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Tuanku Imam Bonjol</h3>
      <p>Ulama terkemuka dari Sumatera Barat dan tokoh utama dalam Perang Padri (1803-1837).</p>
      <p>Beliau berjuang untuk melindungi adat istiadat setempat dan kemerdekaan melawan pasukan kolonial Belanda.</p>
    `,
  });

  createPictureFrame(sumatraBlock, {
    image: "./src/assets/sumatra_frame/rafflessiaarnoldii.jpg",
    position: { x: 10, y: 5, z: 0 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Rafflesia Arnoldii</h3>
      <p>Dikenal sebagai "Bunga Bangkai", ini adalah bunga tunggal terbesar di dunia, yang dapat tumbuh hingga diameter 1 meter.</p>
      <p>Berasal dari hutan hujan Bengkulu dan Sumatra, bunga ini tidak memiliki daun atau batang dan mengeluarkan bau yang kuat untuk menarik serangga penyerbuk.</p>
    `,
  });

  createPictureFrame(sumatraBlock, {
    image: "./src/assets/sumatra_frame/cutnyakdien.jpg",
    position: { x: 10, y: 5, z: 15 },
    rotation: { x: Math.PI / 2, y: -Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Cut Nyak Dhien</h3>
      <p>Pahlawan nasional dari Aceh yang memimpin pasukan gerilya Aceh selama Perang Aceh.</p>
      <p>Setelah wafatnya suaminya, Teuku Umar, beliau melanjutkan memimpin perlawanan melawan Belanda selama 25 tahun di hutan-hutan.</p>
    `,
  });

  createPictureFrame(sumatraBlock, {
    image: "./src/assets/sumatra_frame/taripiring.jpg",
    position: { x: 10, y: 5, z: 30 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Tari Piring</h3>
      <p>Tarian tradisional Minangkabau di mana penari mengayunkan piring di tangan mereka dengan gerakan cepat tanpa menjatuhkannya.</p>
      <p>Awalnya merupakan ritual ucapan syukur kepada dewa atas hasil panen, kini menjadi simbol kebanggaan budaya Sumatera Barat.</p>
    `,
  });

  // Kiri Tembok
  createPictureFrame(sumatraBlock, {
    image: "./src/assets/sumatra_frame/rumahgadang.jpg",
    position: { x: -10, y: 5, z: -30 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Rumah Gadang</h3>
      <p>Rumah adat masyarakat Minangkabau.</p>
      <p>Struktur atapnya yang melengkung khas, dikenal sebagai 'Gonjong', dirancang menyerupai tanduk kerbau, yang berkaitan dengan legenda kemenangan adu kerbau (Minangkabau).</p>
    `,
  });

  createPictureFrame(sumatraBlock, {
    image: "./src/assets/sumatra_frame/sisingamangaraja.jpg",
    position: { x: -10, y: 5, z: -15 },
    rotation: { x: -Math.PI / 2, y: Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Mega Mendung Batik</h3>
      <p>A traditional batik pattern from Cirebon, Java.</p>
      <p>The clouds represent the sky and the upper world.</p>
    `,
  });

  createPictureFrame(sumatraBlock, {
    image: "./src/assets/sumatra_frame/harimau.jpg",
    position: { x: -10, y: 5, z: 0 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Harimau Sumatera</h3>
      <p><i>Panthera tigris sumatrae</i> adalah satu-satunya subspesies harimau yang masih bertahan di Indonesia.</p>
      <p>Berstatus sangat terancam punah (Critically Endangered), diperkirakan kurang dari 400 ekor yang tersisa di alam liar. Mereka dikenali dari garis hitam yang tebal dan bulu oranye tua.</p>
    `,
  });

  createPictureFrame(sumatraBlock, {
    image: "./src/assets/sumatra_frame/lompatbatu.jpg",
    position: { x: -10, y: 5, z: 15 },
    rotation: { x: -Math.PI / 2, y: Math.PI / 2, z: 0 },
    scale: 3,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Hombo Batu (Lompat Batu)</h3>
      <p>Ritual atletik tradisional dari Pulau Nias.</p>
      <p>Pemuda harus melompati susunan batu setinggi 2 meter untuk membuktikan kedewasaan dan kesiapan mereka sebagai prajurit.</p>
    `,
  });

  createPictureFrame(sumatraBlock, {
    image: "./src/assets/sumatra_frame/danautoba.jpg",
    position: { x: -10, y: 5, z: 30 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 4,
    clickableObjects: clickableObjectsArray,
    modalContent: `
      <h3 class="text-2xl font-semibold mb-4">Danau Toba</h3>
      <p>Danau vulkanik terbesar di dunia, terbentuk oleh letusan supervulkanik dahsyat 74.000 tahun yang lalu.</p>
      <p>Di tengahnya terdapat Pulau Samosir, jantung budaya masyarakat Batak Toba.</p>
    `,
  });

  return sumatraBlock;
}

// Export functions to control background music
export function playSumatraMusic() {
  if (sumatraBackgroundMusic && sumatraBackgroundMusic.paused) {
    // Only play if audio is ready to prevent lag
    if (sumatraBackgroundMusic.readyState >= 2) { // HAVE_CURRENT_DATA or higher
      sumatraBackgroundMusic.play().catch(err => {
        console.log("Sumatra music play failed:", err);
      });
    }
  }
}

export function pauseSumatraMusic() {
  if (sumatraBackgroundMusic && !sumatraBackgroundMusic.paused) {
    sumatraBackgroundMusic.pause();
  }
}
