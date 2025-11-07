const videoEl = document.getElementById("camera");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startCameraBtn");
const scanBtn = document.getElementById("scanBtn");
const welcomeSection = document.getElementById("welcomeSection");
const scannerSection = document.getElementById("scannerSection");
const welcomeStartBtn = document.getElementById("welcomeStartBtn");

let stream = null;

// Pindah dari welcome ke scanner
if (welcomeStartBtn && scannerSection && welcomeSection) {
  welcomeStartBtn.addEventListener("click", () => {
    welcomeSection.style.display = "none";
    scannerSection.style.display = "block";
    statusEl.textContent = "Tekan tombol 'Aktifkan Kamera' untuk mulai.";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    statusEl.textContent = "Browser ini tidak mendukung akses kamera.";
    if (startBtn) startBtn.disabled = true;
    if (scanBtn) scanBtn.disabled = true;
    return;
  }

  try {
    statusEl.textContent = "Meminta izin kamera...";
    const constraints = {
      video: {
        facingMode: { ideal: "user" }, // 🔹 kamera depan
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoEl.srcObject = stream;

    statusEl.textContent = "Kamera aktif. Posisikan wajahmu di dalam frame.";
    if (scanBtn) scanBtn.disabled = false;
    if (startBtn) startBtn.disabled = true;
  } catch (err) {
    console.error(err);
    if (err.name === "NotAllowedError") {
      statusEl.textContent = "Akses kamera ditolak. Aktifkan izin kamera di pengaturan browser.";
    } else if (err.name === "NotFoundError") {
      statusEl.textContent = "Kamera tidak ditemukan di perangkat ini.";
    } else {
      statusEl.textContent = "Kamera tidak dapat diaktifkan: " + err.message;
    }
    if (scanBtn) scanBtn.disabled = true;
  }
}

if (startBtn) {
  startBtn.addEventListener("click", () => {
    startCamera();
  });
}

async function captureFrameAsBlob() {
  if (!videoEl || !videoEl.videoWidth || !videoEl.videoHeight) {
    throw new Error("Kamera belum siap.");
  }
  const canvas = document.createElement("canvas");
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

  return await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.9)
  );
}

window.__captureFrameAsBlob = captureFrameAsBlob;
window.__statusEl = statusEl;
window.__scanBtn = scanBtn;
