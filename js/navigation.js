/**
 * Navigation functionality for the WM Knowledge Hub
 * Handles section switching and smooth scrolling
 */

class NavigationController {
  constructor() {
    this.currentSection = "home";
    this.sections = new Map();
    this.init();
  }

  /**
   * Initialize the navigation controller
   */
  init() {
    this.registerSections();
    this.bindEvents();
    this.showInitialSection();
  }

  /**
   * Register all content sections
   */
  registerSections() {
    const sectionElements = document.querySelectorAll(".content-section");
    sectionElements.forEach((section) => {
      this.sections.set(section.id, {
        element: section,
        title: this.getSectionTitle(section.id),
      });
    });
  }

  /**
   * Get user-friendly title for a section
   * @param {string} sectionId - The section ID
   * @returns {string} - Human readable title
   */
  getSectionTitle(sectionId) {
    const titles = {
      home: "Trang Chủ",
      "master-data": "Master Data",
      "org-structure": "Cấu Trúc Tổ Chức",
      processes: "Quy Trình Chính",
      strategies: "Chiến Lược",
      inventory: "Kiểm Kê Kho",
      terms: "Thuật Ngữ",
    };
    return titles[sectionId] || sectionId;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Navigation link clicks
    document.addEventListener("click", (e) => {
      if (
        e.target.matches("[data-section]") ||
        e.target.closest("[data-section]")
      ) {
        e.preventDefault();
        const link = e.target.matches("[data-section]")
          ? e.target
          : e.target.closest("[data-section]");
        const sectionId = link.getAttribute("data-section");
        this.showSection(sectionId);
      }
    });

    // Handle browser back/forward buttons
    window.addEventListener("popstate", (e) => {
      if (e.state && e.state.section) {
        this.showSection(e.state.section, false);
      }
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        const keyMap = {
          1: "home",
          2: "master-data",
          3: "org-structure",
          4: "processes",
          5: "strategies",
          6: "inventory",
          7: "terms",
        };

        if (keyMap[e.key]) {
          e.preventDefault();
          this.showSection(keyMap[e.key]);
        }
      }

      // Alt + arrow keys for section navigation
      if (e.altKey) {
        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            this.previousSection();
            break;
          case "ArrowRight":
            e.preventDefault();
            this.nextSection();
            break;
        }
      }
    });
  }

  /**
   * Show the initial section on page load
   */
  showInitialSection() {
    // Check URL hash for initial section
    const hash = window.location.hash.substring(1);
    const initialSection = hash && this.sections.has(hash) ? hash : "home";
    this.showSection(initialSection, false);
  }

  /**
   * Show a specific section and hide others
   * @param {string} sectionId - ID of the section to show
   * @param {boolean} updateHistory - Whether to update browser history
   */
  showSection(sectionId, updateHistory = true) {
    // Validate section exists
    if (!this.sections.has(sectionId)) {
      console.warn(`Section "${sectionId}" not found`);
      return;
    }

    // Don't do anything if already showing this section
    if (this.currentSection === sectionId) {
      return;
    }

    const previousSection = this.currentSection;
    this.currentSection = sectionId;

    // Hide all sections
    this.sections.forEach((section, id) => {
      section.element.classList.remove("active");
      section.element.classList.add("hidden");
    });

    // Show target section with animation
    const targetSection = this.sections.get(sectionId);
    targetSection.element.classList.remove("hidden");

    // Use requestAnimationFrame for smooth animation
    requestAnimationFrame(() => {
      targetSection.element.classList.add("active");
    });

    // Update navigation state
    this.updateNavigationState(sectionId);

    // Update browser history and URL
    if (updateHistory) {
      const url =
        sectionId === "home"
          ? window.location.pathname
          : `${window.location.pathname}#${sectionId}`;
      const title = `${this.getSectionTitle(sectionId)} - Kiến Thức WM`;

      history.pushState({ section: sectionId }, title, url);
      document.title = title;
    }

    // Smooth scroll to top
    this.scrollToTop();

    // Trigger custom event for other components
    this.dispatchSectionChangeEvent(sectionId, previousSection);

    // Update focus for accessibility
    this.updateFocus(targetSection.element);
  }

  /**
   * Update navigation visual state
   * @param {string} activeSection - Currently active section ID
   */
  updateNavigationState(activeSection) {
    // Remove active state from all nav links
    document.querySelectorAll(".main-nav a").forEach((link) => {
      link.classList.remove("active");
      link.setAttribute("aria-current", "false");
    });

    // Add active state to current nav link
    const activeLink = document.querySelector(
      `[data-section="${activeSection}"]`
    );
    if (activeLink) {
      activeLink.classList.add("active");
      activeLink.setAttribute("aria-current", "page");
    }
  }

  /**
   * Smooth scroll to top of page
   */
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /**
   * Dispatch custom event when section changes
   * @param {string} newSection - New active section
   * @param {string} previousSection - Previously active section
   */
  dispatchSectionChangeEvent(newSection, previousSection) {
    const event = new CustomEvent("sectionchange", {
      detail: {
        newSection,
        previousSection,
        timestamp: Date.now(),
      },
    });

    document.dispatchEvent(event);
  }

  /**
   * Update focus for accessibility
   * @param {HTMLElement} sectionElement - The section element that became active
   */
  updateFocus(sectionElement) {
    // Find the first heading in the section
    const firstHeading = sectionElement.querySelector("h1, h2, h3, h4, h5, h6");
    if (firstHeading) {
      firstHeading.setAttribute("tabindex", "-1");
      firstHeading.focus();

      // Remove tabindex after focus for natural tab order
      firstHeading.addEventListener(
        "blur",
        () => {
          firstHeading.removeAttribute("tabindex");
        },
        { once: true }
      );
    }
  }

  /**
   * Get current active section
   * @returns {string} - Current section ID
   */
  getCurrentSection() {
    return this.currentSection;
  }

  /**
   * Get all available sections
   * @returns {Array} - Array of section IDs
   */
  getAvailableSections() {
    return Array.from(this.sections.keys());
  }

  /**
   * Navigate to next section
   */
  nextSection() {
    const sections = this.getAvailableSections();
    const currentIndex = sections.indexOf(this.currentSection);
    const nextIndex = (currentIndex + 1) % sections.length;
    this.showSection(sections[nextIndex]);
  }

  /**
   * Navigate to previous section
   */
  previousSection() {
    const sections = this.getAvailableSections();
    const currentIndex = sections.indexOf(this.currentSection);
    const prevIndex =
      currentIndex === 0 ? sections.length - 1 : currentIndex - 1;
    this.showSection(sections[prevIndex]);
  }
}

// Export for module usage or expose globally
if (typeof module !== "undefined" && module.exports) {
  module.exports = NavigationController;
} else {
  window.NavigationController = NavigationController;
}
