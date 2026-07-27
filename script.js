// --- Set Copyright Year ---
const yearSpan = document.getElementById('year');

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// --- Admin Mode Logic ---
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('admin') === 'true') {
  // Gunakan sessionStorage agar mode admin tidak permanen, hilang saat tab ditutup
  sessionStorage.setItem('isAdmin', 'true');
  // Hapus parameter dari URL agar tidak tersebar saat di-copy
  window.history.replaceState({}, document.title, window.location.pathname);
}
const isAdmin = () => sessionStorage.getItem('isAdmin') === 'true';


// --- Comment Section Logic ---
const commentForm = document.getElementById('comment-form');
const commentsList = document.getElementById('comments-list');

// Fungsi untuk merender satu komentar
const renderComment = (comment) => {
  const commentElement = document.createElement('div');
  commentElement.classList.add('comment');
  // Beri ID unik untuk mempermudah penghapusan dari DOM
  commentElement.id = `comment-${comment.timestamp}`;

  const timestamp = new Date(comment.timestamp).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Tampilkan tombol hapus jika mode admin aktif
  const deleteButtonHTML = isAdmin()
    ? `<button class="delete-btn" data-timestamp="${comment.timestamp}" title="Hapus Komentar">&times;</button>`
    : '';

  commentElement.innerHTML = `
    <div class="comment-header"><strong>${comment.name}</strong> ${deleteButtonHTML}</div>
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

// Fungsi untuk menghapus komentar
const deleteComment = (timestamp) => {
  let savedComments = JSON.parse(localStorage.getItem('comments')) || [];
  const updatedComments = savedComments.filter(c => c.timestamp !== timestamp);
  localStorage.setItem('comments', JSON.stringify(updatedComments));

  // Hapus elemen dari halaman tanpa perlu reload
  const commentElement = document.getElementById(`comment-${timestamp}`);
  if (commentElement) {
    commentElement.remove();
  }
};

// Event listener untuk tombol hapus (menggunakan event delegation)
commentsList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    if (confirm('Yakin mau hapus komentar ini?')) {
      deleteComment(e.target.dataset.timestamp);
    }
  }
});

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
