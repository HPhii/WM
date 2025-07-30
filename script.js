// script.js

/**
 * Hàm hiển thị phần nội dung được chọn và ẩn các phần khác.
 * @param {string} sectionId - ID của phần nội dung cần hiển thị.
 */
function showSection(sectionId) {
  // Lấy tất cả các phần nội dung
  const sections = document.querySelectorAll(".content-section");
  // Ẩn tất cả các phần nội dung
  sections.forEach((section) => {
    section.classList.add("hidden");
    section.classList.remove("active");
  });

  // Hiển thị phần nội dung được chọn
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.remove("hidden");
    activeSection.classList.add("active");
  }

  // Cuộn lên đầu trang
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Khi tải trang xong, hiển thị phần "Trang Chủ" mặc định
document.addEventListener("DOMContentLoaded", () => {
  showSection("home");
});
