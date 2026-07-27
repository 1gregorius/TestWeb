// Tahun otomatis di footer
document.getElementById("year").textContent = new Date().getFullYear();

// Toggle tema gelap/terang, tersimpan di localStorage
const themeToggle = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.body.classList.add("light");
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light");
  themeToggle.textContent = isLight ? "☀️" : "🌙";
  localStorage.setItem("theme", isLight ? "light" : "dark");
});

// Counter interaktif
const counterBtn = document.getElementById("counter-btn");
let clicks = 0;

counterBtn.addEventListener("click", () => {
  clicks += 1;
  counterBtn.textContent = `Diklik: ${clicks} kali`;
});

// Game: Kasih Makan Hewan Peliharaan
const animalSelect = document.getElementById("animal-select");
const petStage = document.getElementById("pet-stage");
const petEmojiEl = document.getElementById("pet-emoji");
const petNameEl = document.getElementById("pet-name");
const petMoodEl = document.getElementById("pet-mood");
const hungerBar = document.getElementById("hunger-bar");
const hungerLabel = document.getElementById("hunger-label");
const changePetBtn = document.getElementById("change-pet");
const playArea = document.getElementById("play-area");
const foodEl = document.getElementById("food-emoji");

const PET_STORAGE_KEY = "petGame";
const FOOD_HOME = { x: 72, y: 72 };
const PET_HOME = { x: 30, y: 45 };
const EAT_DISTANCE = 46; // px
const PET_LERP = 0.045; // makin kecil, makin pelan hewan mengejar makanan

let pet = null; // { name, emoji, hunger }
let decayTimer = null;
let isDragging = false;
let chaseFrame = null;
let petCurrent = { ...PET_HOME };
let petTarget = { ...PET_HOME };

function moodFromHunger(hunger) {
  if (hunger >= 70) return "Senang & kenyang 😄";
  if (hunger >= 35) return "Lumayan, tapi mulai lapar 🙂";
  return "Lapar banget, kasih makan dong! 😢";
}

function renderPet() {
  petEmojiEl.textContent = pet.emoji;
  petNameEl.textContent = pet.name;
  petMoodEl.textContent = moodFromHunger(pet.hunger);
  hungerBar.style.width = `${pet.hunger}%`;
  hungerBar.classList.toggle("low", pet.hunger < 35);
  hungerLabel.textContent = `Kenyang: ${pet.hunger}%`;
}

function savePet() {
  localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(pet));
}

function startDecay() {
  if (decayTimer) clearInterval(decayTimer);
  decayTimer = setInterval(() => {
    pet.hunger = Math.max(0, pet.hunger - 5);
    renderPet();
    savePet();
  }, 5000);
}

function setPosition(el, xPercent, yPercent) {
  el.style.left = `${xPercent}%`;
  el.style.top = `${yPercent}%`;
}

function resetPositions() {
  petCurrent = { ...PET_HOME };
  petTarget = { ...PET_HOME };
  setPosition(petEmojiEl, petCurrent.x, petCurrent.y);
  foodEl.classList.remove("dragging");
  setPosition(foodEl, FOOD_HOME.x, FOOD_HOME.y);
}

function showPetStage() {
  animalSelect.classList.add("hidden");
  petStage.classList.remove("hidden");
  renderPet();
  resetPositions();
  startDecay();
}

function feedPet() {
  pet.hunger = Math.min(100, pet.hunger + 20);
  renderPet();
  savePet();

  petEmojiEl.classList.remove("bounce");
  void petEmojiEl.offsetWidth; // restart animasi
  petEmojiEl.classList.add("bounce");
}

function distanceBetween(elA, elB) {
  const a = elA.getBoundingClientRect();
  const b = elB.getBoundingClientRect();
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  const bx = b.left + b.width / 2;
  const by = b.top + b.height / 2;
  return Math.hypot(ax - bx, ay - by);
}

function chaseLoop() {
  petCurrent.x += (petTarget.x - petCurrent.x) * PET_LERP;
  petCurrent.y += (petTarget.y - petCurrent.y) * PET_LERP;
  setPosition(petEmojiEl, petCurrent.x, petCurrent.y);

  if (!isDragging) return;

  if (distanceBetween(foodEl, petEmojiEl) < EAT_DISTANCE) {
    feedPet();
    endDrag();
    return;
  }
  chaseFrame = requestAnimationFrame(chaseLoop);
}

function endDrag() {
  if (!isDragging) return;
  isDragging = false;
  cancelAnimationFrame(chaseFrame);
  resetPositions();
}

foodEl.addEventListener("pointerdown", (e) => {
  isDragging = true;
  foodEl.classList.add("dragging");
  foodEl.setPointerCapture(e.pointerId);
  chaseLoop();
});

foodEl.addEventListener("pointermove", (e) => {
  if (!isDragging) return;
  const rect = playArea.getBoundingClientRect();
  const xPercent = Math.min(92, Math.max(8, ((e.clientX - rect.left) / rect.width) * 100));
  const yPercent = Math.min(88, Math.max(8, ((e.clientY - rect.top) / rect.height) * 100));
  setPosition(foodEl, xPercent, yPercent);
  petTarget = { x: xPercent, y: yPercent };
});

foodEl.addEventListener("pointerup", endDrag);
foodEl.addEventListener("pointercancel", endDrag);

animalSelect.addEventListener("click", (e) => {
  const choice = e.target.closest(".animal-choice");
  if (!choice) return;

  pet = {
    name: choice.dataset.name,
    emoji: choice.dataset.emoji,
    hunger: 50,
  };
  savePet();
  showPetStage();
});

changePetBtn.addEventListener("click", () => {
  clearInterval(decayTimer);
  cancelAnimationFrame(proximityFrame);
  isDragging = false;
  pet = null;
  localStorage.removeItem(PET_STORAGE_KEY);
  petStage.classList.add("hidden");
  animalSelect.classList.remove("hidden");
});

// Lanjutkan progres game kalau sudah pernah pilih hewan sebelumnya
const savedPet = localStorage.getItem(PET_STORAGE_KEY);
if (savedPet) {
  pet = JSON.parse(savedPet);
  showPetStage();
}

// Animasi muncul saat scroll
const sections = document.querySelectorAll(".section");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

sections.forEach((section) => observer.observe(section));
