/**
 * Enhanced Content Manager for WM Knowledge Hub
 * Dynamically loads and manages modular content components
 */

class EnhancedContentManager {
  constructor() {
    this.currentSection = "home";
    this.loadedComponents = new Set();
    this.componentCache = new Map();
    this.animationDuration = 300;

    // Component configuration
    this.components = {
      home: {
        file: "components/home.html",
        title: "Trang Chủ - WM Knowledge Hub",
        preload: true,
      },
      "master-data": {
        file: "components/master-data.html",
        title: "Master Data - WM Knowledge Hub",
        preload: false,
      },
      "org-structure": {
        file: "components/org-structure.html",
        title: "Cấu Trúc Tổ Chức - WM Knowledge Hub",
        preload: false,
      },
      processes: {
        file: "components/processes.html",
        title: "Quy Trình Chính - WM Knowledge Hub",
        preload: false,
      },
      strategies: {
        file: "components/strategies.html",
        title: "Chiến Lược WM - WM Knowledge Hub",
        preload: false,
      },
      inventory: {
        file: "components/inventory.html",
        title: "Kiểm Kê Kho - WM Knowledge Hub",
        preload: false,
      },
      terms: {
        file: "components/terms.html",
        title: "Thuật Ngữ WM - WM Knowledge Hub",
        preload: false,
      },
    };
  }

  /**
   * Initialize the content manager
   */
  async init() {
    try {
      console.log("Initializing Enhanced Content Manager...");

      // Preload critical components
      await this.preloadComponents();

      // Set up navigation event listeners
      this.setupNavigation();

      // Initialize current section
      await this.showSection(this.currentSection);

      console.log("Enhanced Content Manager initialized successfully");
    } catch (error) {
      console.error("Error initializing Enhanced Content Manager:", error);
      this.showErrorState();
    }
  }

  /**
   * Preload essential components for better performance
   */
  async preloadComponents() {
    const preloadPromises = Object.entries(this.components)
      .filter(([, config]) => config.preload)
      .map(([sectionId]) => this.loadComponent(sectionId));

    await Promise.all(preloadPromises);
  }

  /**
   * Set up navigation event listeners
   */
  setupNavigation() {
    // Handle navigation links
    document.addEventListener("click", async (event) => {
      const navLink = event.target.closest("[data-section]");
      if (navLink) {
        event.preventDefault();
        const sectionId = navLink.getAttribute("data-section");
        await this.showSection(sectionId);

        // Update URL without page reload
        this.updateURL(sectionId);

        // Update navigation active state
        this.updateNavigation(sectionId);
      }
    });

    // Handle browser back/forward buttons
    window.addEventListener("popstate", (event) => {
      const sectionId =
        event.state?.section || this.getSectionFromURL() || "home";
      this.showSection(sectionId, false);
    });

    // Legacy support for existing onclick handlers
    window.showSection = (sectionId) => {
      this.showSection(sectionId);
    };
  }

  /**
   * Load a component from file
   */
  async loadComponent(sectionId) {
    if (this.componentCache.has(sectionId)) {
      return this.componentCache.get(sectionId);
    }

    const config = this.components[sectionId];
    if (!config) {
      throw new Error(`Component configuration not found for: ${sectionId}`);
    }

    try {
      console.log(`Loading component: ${sectionId}`);

      const response = await fetch(config.file);
      if (!response.ok) {
        throw new Error(`Failed to load component: ${response.status}`);
      }

      const html = await response.text();
      this.componentCache.set(sectionId, html);
      this.loadedComponents.add(sectionId);

      return html;
    } catch (error) {
      console.error(`Error loading component ${sectionId}:`, error);
      return this.getErrorContent(sectionId);
    }
  }

  /**
   * Show a specific section
   */
  async showSection(sectionId, updateHistory = true) {
    try {
      // Validate section
      if (!this.components[sectionId]) {
        console.warn(`Unknown section: ${sectionId}, falling back to home`);
        sectionId = "home";
      }

      // Show loading state
      this.showLoadingState();

      // Hide current section with animation
      await this.hideCurrentSection();

      // Load and inject component if not already loaded
      if (!this.loadedComponents.has(sectionId)) {
        const componentHTML = await this.loadComponent(sectionId);
        await this.injectComponent(sectionId, componentHTML);
      }

      // Show new section with animation
      await this.showNewSection(sectionId);

      // Update state
      this.currentSection = sectionId;

      // Update page title
      document.title = this.components[sectionId].title;

      // Update URL if needed
      if (updateHistory) {
        this.updateURL(sectionId);
      }

      // Update navigation
      this.updateNavigation(sectionId);

      // Hide loading state
      this.hideLoadingState();

      // Trigger section shown event
      this.triggerSectionEvent("shown", sectionId);
    } catch (error) {
      console.error(`Error showing section ${sectionId}:`, error);
      this.hideLoadingState();
      this.showErrorState();
    }
  }

  /**
   * Inject component HTML into the DOM
   */
  async injectComponent(sectionId, html) {
    let mainContainer = document.querySelector("main .content-container");
    if (!mainContainer) {
      mainContainer = document.querySelector("main");
    }

    if (!mainContainer) {
      throw new Error("Main container not found");
    }

    // Create temporary container to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Extract the section element
    const sectionElement = tempDiv.querySelector(`#${sectionId}`);
    if (!sectionElement) {
      throw new Error(`Section element #${sectionId} not found in component`);
    }

    // Append to main container
    mainContainer.appendChild(sectionElement);
  }

  /**
   * Hide current section with animation
   */
  async hideCurrentSection() {
    const currentElement = document.querySelector(".content-section.active");
    if (currentElement) {
      currentElement.style.opacity = "0";
      currentElement.style.transform = "translateY(-20px)";

      // Wait for animation
      await this.wait(this.animationDuration);

      currentElement.classList.remove("active");
      currentElement.style.display = "none";
    }
  }

  /**
   * Show new section with animation
   */
  async showNewSection(sectionId) {
    const newElement = document.querySelector(`#${sectionId}`);
    if (newElement) {
      // Prepare for animation
      newElement.style.display = "block";
      newElement.style.opacity = "0";
      newElement.style.transform = "translateY(20px)";

      // Add active class
      newElement.classList.add("active");

      // Trigger reflow
      newElement.offsetHeight;

      // Animate in
      newElement.style.transition = `all ${this.animationDuration}ms ease-out`;
      newElement.style.opacity = "1";
      newElement.style.transform = "translateY(0)";

      // Wait for animation
      await this.wait(this.animationDuration);

      // Clean up inline styles
      newElement.style.transition = "";
    }
  }

  /**
   * Update navigation active states
   */
  updateNavigation(sectionId) {
    // Remove active class from all nav links
    document.querySelectorAll(".main-nav a").forEach((link) => {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    });

    // Add active class to current nav link
    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeLink) {
      activeLink.classList.add("active");
      activeLink.setAttribute("aria-current", "page");
    }
  }

  /**
   * Update browser URL
   */
  updateURL(sectionId) {
    const url = sectionId === "home" ? "/" : `/#${sectionId}`;
    history.pushState({ section: sectionId }, "", url);
  }

  /**
   * Get section ID from current URL
   */
  getSectionFromURL() {
    const hash = window.location.hash.substring(1);
    return hash || "home";
  }

  /**
   * Show loading state
   */
  showLoadingState() {
    const loadingIndicator = document.querySelector(".loading-indicator");
    if (loadingIndicator) {
      loadingIndicator.style.display = "block";
    }

    document.body.classList.add("loading");
  }

  /**
   * Hide loading state
   */
  hideLoadingState() {
    const loadingIndicator = document.querySelector(".loading-indicator");
    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }

    document.body.classList.remove("loading");
  }

  /**
   * Show error state
   */
  showErrorState() {
    const mainContainer = document.querySelector("main");
    if (mainContainer) {
      mainContainer.innerHTML = this.getErrorContent("general");
    }
  }

  /**
   * Get error content HTML
   */
  getErrorContent(type) {
    return `
      <div class="error-container">
        <div class="error-card">
          <i class="fas fa-exclamation-triangle text-warning-600"></i>
          <h2>Không thể tải nội dung</h2>
          <p>Xin lỗi, đã xảy ra lỗi khi tải nội dung. Vui lòng thử lại sau.</p>
          <button class="btn btn-primary" onclick="location.reload()">
            <i class="fas fa-redo"></i>
            Tải lại trang
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Trigger custom section events
   */
  triggerSectionEvent(eventType, sectionId) {
    const event = new CustomEvent(`section:${eventType}`, {
      detail: { sectionId, timestamp: Date.now() },
    });
    document.dispatchEvent(event);
  }

  /**
   * Utility function to wait for specified time
   */
  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current section
   */
  getCurrentSection() {
    return this.currentSection;
  }

  /**
   * Check if component is loaded
   */
  isComponentLoaded(sectionId) {
    return this.loadedComponents.has(sectionId);
  }

  /**
   * Clear component cache (useful for development)
   */
  clearCache() {
    this.componentCache.clear();
    this.loadedComponents.clear();
    console.log("Component cache cleared");
  }
}

// Export for use in other modules
window.EnhancedContentManager = EnhancedContentManager;
