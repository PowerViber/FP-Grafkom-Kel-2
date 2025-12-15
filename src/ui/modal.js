import { showInspectMode } from "./inspectMode.js";

const modalContainer = document.getElementById("exhibit-modal-container");
const modalContent = document.getElementById("exhibit-modal-content");

export function showModal(content, inspectData = null) {
  if (modalContainer) {
    modalContent.innerHTML = content;

    // Add Inspect button if inspectData provided
    if (inspectData) {
      const inspectBtn = document.createElement('button');
      inspectBtn.textContent = 'Inspect';
      inspectBtn.className = 'mt-4 px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition';
      inspectBtn.onclick = () => {
        hideModal();
        showInspectMode(
          inspectData.modelPath,
          inspectData.title,
          inspectData.subtitle,
          inspectData.audioPath
        );
      };
      modalContent.appendChild(inspectBtn);
    }

    modalContainer.style.display = "flex";
  } else {
    console.error("Exhibit modal container not found in HTML.");
  }
}

export function hideModal() {
  if (modalContainer) {
    modalContainer.style.display = "none";
  }
}
