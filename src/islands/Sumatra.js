import * as THREE from "three";
import { createBlock } from "../utils/createBlock.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createClickableObject } from "../utils/createClickableObject.js";
import KOMPANG_CONTENT from "../content/sumatra_kompang.js";
import TAMBUA_CONTENT from "../content/sumatra_tambua.js";
import RENCONG_CONTENT from "../content/sumatra_rencong.js";
import { applyWallTexture, isWall } from "../utils/wallHelper.js";
import { createPictureFrame } from "../utils/createPictureFrame.js";

export function createSumatra(clickableObjectsArray) {
  const sumatraBlock = createBlock("Sumatra");

  const zPositions = [
    {
      z: 10,
      model: "./src/assets/sumatra_kompang.glb",
      content: KOMPANG_CONTENT,
      name: "Sumatra-Kompang",
    },
    {
      z: 0,
      model: "./src/assets/sumatra_tambua.glb",
      content: TAMBUA_CONTENT,
      name: "Sumatra-Tambua",
    },
    {
      z: -10,
      model: "./src/assets/sumatra_rencong_aceh.glb",
      content: RENCONG_CONTENT,
      name: "Sumatra-Rencong",
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

    zPositions.forEach(({ z, model, content, name }) => {
      const displayCase = baseModel.clone();
      displayCase.scale.set(2.5, 2.5, 2.5);
      displayCase.position.set(xPosition, 0, z);

      createClickableObject(model, content, clickableObjectsArray)
        .then((artifact) => {
          if (name.includes("Kompang")) {
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
          console.error(`Failed to load and wrap ${name}`, error)
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
