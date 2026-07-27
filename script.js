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
