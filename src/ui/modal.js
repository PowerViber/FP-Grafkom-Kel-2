const modalContainer = document.getElementById("exhibit-modal-container");
const modalContent = document.getElementById("exhibit-modal-content");

export function showModal(content) {
  if (modalContainer) {
    modalContent.innerHTML = content;
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
