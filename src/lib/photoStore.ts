// In-memory photo store that persists across SPA navigation
let storedPhotos: File[] = [];

export function setPhotos(files: File[]) {
  storedPhotos = files;
}

export function getPhotos(): File[] {
  return storedPhotos;
}

export function clearPhotos() {
  storedPhotos = [];
}
