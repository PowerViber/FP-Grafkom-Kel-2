# Dokumentasi Proyek: Virtual Museum Nusantara (Grafkom Kelompok 2)

Proyek ini adalah aplikasi web grafika komputer berbasis **Three.js** yang mensimulasikan pengalaman museum virtual. Pengguna dapat menjelajahi lima pulau besar di Indonesia (Sumatera, Jawa, Kalimantan, Sulawesi, Papua) dengan sudut pandang orang pertama (*First-Person*) untuk mempelajari artefak budaya dan situs bersejarah.

## Nama Situs Bersejarah & Zona Budaya

Aplikasi ini tidak hanya menampilkan satu situs, melainkan merangkum kekayaan budaya Nusantara yang dibagi menjadi zona-zona berikut:

### 1. Zona Sumatera
| Nama Artefak / Situs | Nama File (.glb) | Sumber Model |
| :--- | :--- | :--- |
| **Miniatur Menara Meunasah** | `sumatra_meunasah_tuha_dayah_muara_minaret.glb` | Sketchfab (Royalty Free) |
| **Makanan Khas Rendang** | `sumatra_rendang.glb` | Sketchfab (Royalty Free) |
| **Alat Musik Kompang** | `sumatra_kompang.glb` | Sketchfab (Royalty Free) |
| **Alat Musik Tambua** | `sumatra_tambua.glb` | Sketchfab (Royalty Free) |
| **Senjata Rencong Aceh** | `sumatra_rencong_aceh.glb` | Sketchfab (Royalty Free) |

### 2. Zona Jawa
| Nama Artefak / Situs | Nama File (.glb) | Sumber Model |
| :--- | :--- | :--- |
| **Alat Musik Angklung** | `jawa_angklung.glb` | Sketchfab (Royalty Free) |
| **Gamelan: Kendang** | `jawa_kendang.glb` | Sketchfab (Royalty Free) |
| **Gamelan: Kenong** | `jawa_kenong.glb` | Sketchfab (Royalty Free) |
| **Gamelan: Saron Degung** | `jawa_saron_degung.glb` | Sketchfab (Royalty Free) |
| **Senjata Keris** | `jawa_keris.glb` | Sketchfab (Royalty Free) |

### 3. Zona Kalimantan
| Nama Artefak / Situs | Nama File (.glb) | Sumber Model |
| :--- | :--- | :--- |
| **Senjata Mandau** | `kalimantan_mandau.glb` | Sketchfab (Royalty Free) |
| **Alat Musik Rebab** | `kalimantan_rebab.glb` | Sketchfab (Royalty Free) |
| **Alat Musik Sape (Sapek)** | `kalimantan_sapek.glb` | Sketchfab (Royalty Free) |
| **Tameng Talawang** | `kalimantan_talawang.glb` | Sketchfab (Royalty Free) |

### 4. Zona Sulawesi
| Nama Artefak / Situs | Nama File (.glb) | Sumber Model |
| :--- | :--- | :--- |
| **Rumah Adat Toraja** | `sulawesi_adat_toraja.glb` | Sketchfab (Royalty Free) |
| **Senjata Badik** | `sulawesi_badik.glb` | Sketchfab (Royalty Free) |
| **Alat Musik Jalappa** | `sulawesi_jalappa.glb` | Buat sendiri |
| **Alat Musik Kecapi** | `sulawesi_kecapi.glb` | Sketchfab (Royalty Free) |
| **Alat Musik Puik-puik** | `sulawesi_puikpuik.glb` | Buat sendiri |

### 5. Zona Papua
| Nama Artefak / Situs | Nama File (.glb) | Sumber Model |
| :--- | :--- | :--- |
| **Alat Musik Fuu** | `papua_fuu.glb` | Sketchfab (Royalty Free) |
| **Alat Musik Tifa** | `papua_tifa.glb` | Sketchfab (Royalty Free) |
| **Alat Musik Triton (Kerang)**| `papua_triton.glb` | Sketchfab (Royalty Free) |

### 6. Aset Pendukung (Properti & Dekorasi)
| Nama Objek | Nama File (.glb) | Keterangan |
| :--- | :--- | :--- |
| **Display Case (Etalase)** | `display_case.glb` | Properti Generik Museum, dari Skethfab |
| **Bingkai Foto** | `picture_frame.glb` | Properti Generik Dinding |
| **Kain Gorden** | `curtain_fabric.glb` | Dekorasi Ruangan |

## Sumber Model 3D & Aset

Aset yang digunakan dalam proyek ini dikumpulkan dari berbagai sumber dan beberapa dikembangkan secara eksperimental:

* **Aset 3D Utama (`.glb`/`.gltf`):**
    * Model instrumen musik dan senjata tradisional (Kendang, Tifa, Rencong, dll.) diperoleh dari repositori aset bebas royalti (seperti Sketchfab/PolyHaven) dan koleksi pribadi tim.
    * *Display Case* dan *Picture Frame* dimodelkan sebagai objek generik untuk menampung konten.
* **Generative AI Prototyping:**
    * Terdapat penggunaan teknologi AI untuk pembuatan purwarupa aset 3D (ditemukan dalam folder `src/assets/prototype_ai`), seperti: `Gandang_Tatau_Generate.blend` dan `Sape_Kalimantan_Generate.blend`.
* **Aset 2D (Tekstur & UI):**
    * Foto pahlawan nasional dan pemandangan alam (Danau Toba, Raja Ampat) digunakan sebagai tekstur pada *Picture Frame*.
    * Tekstur prosedural untuk teks "JAWA", "SUMATRA", dll. dibuat menggunakan HTML5 Canvas API (`createTextTexture.js`).
* **Audio:**
    * Lagu daerah (Sinanggar Tullo, Yamko Rambe Yamko, dll.) digunakan sebagai *Ambience*.

---

## Fitur yang Ditambahkan

Berikut adalah fitur teknis dan interaktif yang telah diimplementasikan dalam sistem:

### 1. Sistem Navigasi & Kontrol
* **FPS Controller (`FPSController.js`):** Implementasi navigasi sudut pandang orang pertama menggunakan `PointerLockControls`. Mendukung pergerakan WASD dengan simulasi fisika sederhana (akselerasi/deselerasi).
* **Collision Detection:** Sistem deteksi tabrakan berbasis *Raycasting* (4 arah) untuk mencegah pemain menembus dinding atau objek pameran.

### 2. Manajemen Audio Spasial & Dinamis
* **Positional Background Music:** Musik latar berubah secara otomatis berdasarkan posisi koordinat Z pemain. (Misal: Masuk area Sumatera memutar lagu daerah Sumatera, pindah ke Jawa lagu berganti otomatis).
* **Inspect Audio:** Fitur pemutaran sampel suara instrumen (misal: bunyi Gendang) saat melakukan inspeksi objek.

### 3. Interaksi & Antarmuka (UI)
* **Raycasting Interaction:** Kursor berubah dan objek memberikan efek visual (*emissive pulse*) saat disorot (*hover*). Klik objek untuk membuka informasi.
* **Info Modal (`modal.js`):** *Pop-up* informasi 2D yang responsif, memuat deskripsi sejarah dan tombol aksi.
* **3D Inspect Mode (`inspectMode.js`):** Mode khusus yang merender objek dalam *scene* terpisah, memungkinkan pengguna memutar (*rotate*) dan memperbesar (*zoom*) artefak secara detail tanpa gangguan lingkungan sekitar.

### 4. Arsitektur Modular
* **Dynamic Scene Composition:** Museum dibangun secara prosedural per blok pulau (`createBlock.js`), memudahkan penambahan atau pengurangan zona tanpa merombak kode inti.
* **Resource Management:** Penggunaan `GLTFLoader` dengan *callback* asinkron dan manajemen memori (disposal) pada mode inspeksi.

---
*Dibuat untuk memenuhi Tugas Akhir Mata Kuliah Grafika Komputer.*
