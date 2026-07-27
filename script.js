// --- Set Copyright Year ---
const yearSpan = document.getElementById('year');

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// --- Comment Section Logic ---
const commentForm = document.getElementById('comment-form');
const commentsList = document.getElementById('comments-list');

// Fungsi untuk merender satu komentar
const renderComment = (comment) => {
  const commentElement = document.createElement('div');
  commentElement.classList.add('comment');

  const timestamp = new Date(comment.timestamp).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  commentElement.innerHTML = `
    <p><strong>${comment.name}</strong></p>
    <p>${comment.text}</p>
    <small>${timestamp}</small>
  `;
  // Menambahkan komentar baru di paling atas untuk visibilitas
  commentsList.prepend(commentElement);
};

// Memuat komentar dari localStorage saat halaman dibuka
const loadComments = () => {
  const savedComments = JSON.parse(localStorage.getItem('comments')) || [];
  commentsList.innerHTML = ''; // Kosongkan daftar sebelum memuat
  // Urutkan dari yang terbaru ke terlama sebelum ditampilkan
  savedComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  savedComments.forEach(renderComment);
};

if (commentForm) {
  commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('comment-name');
    const textInput = document.getElementById('comment-text');

    const newComment = {
      name: nameInput.value.trim(),
      text: textInput.value.trim(),
      timestamp: new Date().toISOString(),
    };

    if (!newComment.name || !newComment.text) return; // Jangan kirim jika kosong

    const savedComments = JSON.parse(localStorage.getItem('comments')) || [];
    savedComments.push(newComment);
    localStorage.setItem('comments', JSON.stringify(savedComments));

    renderComment(newComment);
    commentForm.reset();
  });
  // Memuat komentar yang sudah ada saat halaman dibuka
  loadComments();
}

// --- Scroll Animation for Sections ---
const sections = document.querySelectorAll('.section');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
},
{ threshold: 0.15 });

sections.forEach((section) => {
  observer.observe(section);
});

// --- Lightbox Logic ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const galleryItems = document.querySelectorAll('.gallery-item');
const closeBtn = document.querySelector('.lightbox-close');

const openLightbox = (e) => {
  e.preventDefault();
  const imgSrc = e.currentTarget.href;
  lightboxImg.src = imgSrc;
  lightbox.classList.add('active');
  document.body.classList.add('lightbox-open');
};

const closeLightbox = () => {
  lightbox.classList.remove('active');
  document.body.classList.remove('lightbox-open');
  // Hapus src setelah transisi selesai untuk performa
  setTimeout(() => {
    lightboxImg.src = '';
  }, 400);
};

galleryItems.forEach(item => item.addEventListener('click', openLightbox));
closeBtn.addEventListener('click', closeLightbox);
// Tutup lightbox saat mengklik area overlay (di luar gambar)
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    closeLightbox();
  }
});
// Tutup lightbox dengan tombol Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('active')) {
    closeLightbox();
  }
});
