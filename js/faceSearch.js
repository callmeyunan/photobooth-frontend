const scanBtn2 = window.__scanBtn;
const statusEl2 = window.__statusEl;

// Ganti dengan base URL backend kamu (Render/Railway, dll) jika beda origin.
// Contoh: const API_BASE = "https://photobooth-backend.onrender.com";
const API_BASE = "https://photobooth-backend-aws.onrender.com://photobooth-backend-grp3.onrender.com"; // kosong = same origin

function apiUrl(path) {
  if (!API_BASE) return path;
  return API_BASE.replace(/\/$/, "") + path;
}

function getEventSlugFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

async function fetchEventInfo(slug) {
  // Jika belum ada backend event, kita cukup ganti title dengan slug.
  try {
    const titleEl = document.getElementById("eventName");
    if (titleEl) {
      titleEl.textContent = slug.toUpperCase();
    }
  } catch (err) {
    console.error(err);
  }
}

async function handleFaceSearch() {
  const slug = getEventSlugFromPath();
  if (!slug) {
    statusEl2.textContent = "Event tidak valid.";
    return;
  }

  statusEl2.textContent = "Mengambil gambar wajah...";
  scanBtn2.disabled = true;

  let blob;
  try {
    blob = await window.__captureFrameAsBlob();
  } catch (err) {
    statusEl2.textContent = err.message;
    scanBtn2.disabled = false;
    return;
  }

  const formData = new FormData();
  formData.append("file", blob, "face.jpg");

  // Untuk sekarang, folder Drive bisa di-hardcode per event,
  // atau kamu bisa mapping slug -> folder di sisi frontend.
  // Contoh sementara: gunakan slug sebagai folder ID.
  const folderInput = slug; 
  formData.append("folder", folderInput);

  statusEl2.textContent = "Mencari fotomu di galeri event...";
  try {
    const res = await fetch(apiUrl(`/face-search`), {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throw new Error("Gagal mencari wajah. Coba ulangi.");
    }

    const data = await res.json();
    renderResults(data.matches || []);
    statusEl2.textContent = data.matches?.length
      ? "Ini foto-foto yang cocok dengan wajahmu."
      : "Tidak ditemukan foto dengan wajahmu. Coba scan lagi dengan posisi lebih jelas.";

  } catch (err) {
    console.error(err);
    statusEl2.textContent = err.message || "Terjadi kesalahan saat mencari wajah.";
  } finally {
    scanBtn2.disabled = false;
  }
}

function renderResults(matches) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!matches || matches.length === 0) {
    const p = document.createElement("p");
    p.textContent = "Belum ada foto yang cocok. Pastikan kamu sudah berfoto di photobooth.";
    resultsDiv.appendChild(p);
    return;
  }

  matches.forEach((photo) => {
    const wrapper = document.createElement("a");
    wrapper.href = photo.drive_view_url || "#";
    wrapper.target = "_blank";
    wrapper.rel = "noopener noreferrer";

    const img = document.createElement("img");
    img.src = photo.drive_thumb_url || photo.drive_view_url;
    img.alt = "Foto kamu";
    img.classList.add("photo-thumb");

    wrapper.appendChild(img);
    resultsDiv.appendChild(wrapper);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const slug = getEventSlugFromPath();
  if (slug) {
    fetchEventInfo(slug);
  }
  if (scanBtn2) {
    scanBtn2.addEventListener("click", handleFaceSearch);
  }
});
