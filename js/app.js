/**
 * Application initialization and main controller
 * Coordinates all components and handles global functionality
 */

class WMApp {
  constructor() {
    this.navigationController = null;
    this.isInitialized = false;
    this.config = {
      animationDuration: 300,
      debounceDelay: 250,
      autoSaveDelay: 1000,
    };
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.isInitialized) {
      console.warn("WM App already initialized");
      return;
    }

    try {
      console.log("Initializing WM Knowledge Hub...");

      // Show loading state
      this.showLoadingState();

      // Initialize core components
      await this.initializeComponents();

      // Set up global event handlers
      this.setupGlobalHandlers();

      // Initialize accessibility features
      this.initializeAccessibility();

      // Initialize performance monitoring
      this.initializePerformanceMonitoring();

      // Hide loading state
      this.hideLoadingState();

      this.isInitialized = true;
      console.log("WM Knowledge Hub initialized successfully");

      // Dispatch app ready event
      this.dispatchAppReadyEvent();
    } catch (error) {
      console.error("Failed to initialize WM App:", error);
      this.showErrorState(error);
    }
  }

  /**
   * Initialize core application components
   */
  async initializeComponents() {
    // Initialize navigation controller
    this.navigationController = new NavigationController();

    // Initialize other components as needed
    await this.initializeTheme();
    await this.initializeSearch();
    await this.initializePrintStyles();
  }

  /**
   * Initialize theme system
   */
  async initializeTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("wm-theme") || "light";

    // Apply theme
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Set up theme toggle if present
    const themeToggle = document.querySelector("[data-theme-toggle]");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => this.toggleTheme());
    }
  }

  /**
   * Initialize search functionality
   */
  async initializeSearch() {
    const searchInput = document.querySelector("[data-search]");
    if (!searchInput) return;

    // Debounced search handler
    const debouncedSearch = this.debounce((query) => {
      this.performSearch(query);
    }, this.config.debounceDelay);

    searchInput.addEventListener("input", (e) => {
      debouncedSearch(e.target.value);
    });

    // Search keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInput.focus();
      }

      if (e.key === "Escape" && document.activeElement === searchInput) {
        searchInput.blur();
        this.clearSearch();
      }
    });
  }

  /**
   * Initialize print styles and functionality
   */
  async initializePrintStyles() {
    // Add print button functionality
    const printButton = document.querySelector("[data-print]");
    if (printButton) {
      printButton.addEventListener("click", () => this.handlePrint());
    }

    // Optimize for printing
    window.addEventListener("beforeprint", () => {
      document.body.classList.add("printing");
    });

    window.addEventListener("afterprint", () => {
      document.body.classList.remove("printing");
    });
  }

  /**
   * Set up global event handlers
   */
  setupGlobalHandlers() {
    // Handle section changes
    document.addEventListener("sectionchange", (e) => {
      this.handleSectionChange(e.detail);
    });

    // Handle resize events
    window.addEventListener(
      "resize",
      this.debounce(() => {
        this.handleResize();
      }, this.config.debounceDelay)
    );

    // Handle online/offline status
    window.addEventListener("online", () => this.handleOnlineStatus(true));
    window.addEventListener("offline", () => this.handleOnlineStatus(false));

    // Handle visibility changes
    document.addEventListener("visibilitychange", () => {
      this.handleVisibilityChange();
    });

    // Global error handling
    window.addEventListener("error", (e) => {
      this.handleGlobalError(e);
    });

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (e) => {
      this.handleUnhandledRejection(e);
    });
  }

  /**
   * Initialize accessibility features
   */
  initializeAccessibility() {
    // Skip to content link
    this.createSkipToContentLink();

    // Focus management
    this.setupFocusManagement();

    // Keyboard navigation helper
    this.setupKeyboardNavigation();

    // ARIA live regions for dynamic content
    this.setupAriaLiveRegions();
  }

  /**
   * Initialize performance monitoring
   */
  initializePerformanceMonitoring() {
    // Monitor navigation performance
    if ("performance" in window && "measure" in performance) {
      performance.mark("wm-app-start");
    }

    // Monitor memory usage (if available)
    if ("memory" in performance) {
      this.monitorMemoryUsage();
    }
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("wm-theme", newTheme);

    // Dispatch theme change event
    const event = new CustomEvent("themechange", {
      detail: { oldTheme: currentTheme, newTheme },
    });
    document.dispatchEvent(event);
  }

  /**
   * Perform search across content
   * @param {string} query - Search query
   */
  performSearch(query) {
    if (!query.trim()) {
      this.clearSearch();
      return;
    }

    // Implement search logic here
    console.log("Searching for:", query);

    // For now, just highlight matching text
    this.highlightSearchResults(query);
  }

  /**
   * Clear search results
   */
  clearSearch() {
    // Remove all search highlights
    document.querySelectorAll(".search-highlight").forEach((el) => {
      el.classList.remove("search-highlight");
    });
  }

  /**
   * Highlight search results in content
   * @param {string} query - Search query
   */
  highlightSearchResults(query) {
    // Basic text highlighting implementation
    const regex = new RegExp(`(${this.escapeRegex(query)})`, "gi");
    const walker = document.createTreeWalker(
      document.querySelector(".content-section.active"),
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim()) {
        textNodes.push(node);
      }
    }

    textNodes.forEach((textNode) => {
      if (regex.test(textNode.nodeValue)) {
        const parent = textNode.parentNode;
        const wrapper = document.createElement("span");
        wrapper.innerHTML = textNode.nodeValue.replace(
          regex,
          '<mark class="search-highlight">$1</mark>'
        );
        parent.replaceChild(wrapper, textNode);
      }
    });
  }

  /**
   * Handle print functionality
   */
  handlePrint() {
    // Ensure all content is visible for printing
    document.querySelectorAll(".content-section").forEach((section) => {
      section.style.display = "block";
    });

    window.print();

    // Restore normal display after printing
    setTimeout(() => {
      if (this.navigationController) {
        this.navigationController.showSection(
          this.navigationController.getCurrentSection()
        );
      }
    }, 1000);
  }

  /**
   * Handle section change events
   * @param {Object} detail - Section change details
   */
  handleSectionChange(detail) {
    console.log(
      `Section changed from ${detail.previousSection} to ${detail.newSection}`
    );

    // Track analytics if available
    if (typeof gtag !== "undefined") {
      gtag("event", "page_view", {
        page_title: detail.newSection,
        page_location: window.location.href,
      });
    }
  }

  /**
   * Handle window resize events
   */
  handleResize() {
    // Update any size-dependent calculations
    console.log(
      "Window resized to:",
      window.innerWidth,
      "x",
      window.innerHeight
    );
  }

  /**
   * Handle online/offline status changes
   * @param {boolean} isOnline - Whether the app is online
   */
  handleOnlineStatus(isOnline) {
    const statusIndicator = document.querySelector("[data-status]");
    if (statusIndicator) {
      statusIndicator.textContent = isOnline ? "Online" : "Offline";
      statusIndicator.className = isOnline ? "status-online" : "status-offline";
    }

    if (!isOnline) {
      this.showNotification(
        "Bạn đang offline. Một số tính năng có thể không khả dụng.",
        "warning"
      );
    }
  }

  /**
   * Handle visibility change events
   */
  handleVisibilityChange() {
    if (document.hidden) {
      console.log("App is now hidden");
    } else {
      console.log("App is now visible");
    }
  }

  /**
   * Handle global JavaScript errors
   * @param {ErrorEvent} error - Error event
   */
  handleGlobalError(error) {
    console.error("Global error:", error);

    // Show user-friendly error message
    this.showNotification("Đã xảy ra lỗi. Vui lòng tải lại trang.", "error");
  }

  /**
   * Handle unhandled promise rejections
   * @param {PromiseRejectionEvent} event - Promise rejection event
   */
  handleUnhandledRejection(event) {
    console.error("Unhandled promise rejection:", event.reason);

    // Prevent the default handling
    event.preventDefault();

    // Show user-friendly error message
    this.showNotification("Đã xảy ra lỗi không mong muốn.", "error");
  }

  /**
   * Show loading state
   */
  showLoadingState() {
    const loading = document.createElement("div");
    loading.id = "app-loading";
    loading.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Đang tải Kiến Thức WM...</p>
      </div>
    `;
    document.body.appendChild(loading);
  }

  /**
   * Hide loading state
   */
  hideLoadingState() {
    const loading = document.getElementById("app-loading");
    if (loading) {
      loading.remove();
    }
  }

  /**
   * Show error state
   * @param {Error} error - The error that occurred
   */
  showErrorState(error) {
    this.hideLoadingState();

    const errorDiv = document.createElement("div");
    errorDiv.id = "app-error";
    errorDiv.innerHTML = `
      <div class="error-container">
        <h2>Không thể tải ứng dụng</h2>
        <p>Đã xảy ra lỗi khi khởi tạo ứng dụng:</p>
        <pre>${error.message}</pre>
        <button onclick="window.location.reload()">Tải lại trang</button>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }

  /**
   * Show notification to user
   * @param {string} message - Notification message
   * @param {string} type - Notification type (info, success, warning, error)
   */
  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  /**
   * Create skip to content link for accessibility
   */
  createSkipToContentLink() {
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.textContent = "Bỏ qua đến nội dung chính";
    skipLink.className = "skip-to-content";
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      const mainContent =
        document.getElementById("main-content") ||
        document.querySelector("main");
      if (mainContent) {
        mainContent.focus();
      }
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  /**
   * Set up focus management
   */
  setupFocusManagement() {
    // Track focus for better UX
    let focusVisible = false;

    document.addEventListener("keydown", () => {
      focusVisible = true;
    });

    document.addEventListener("mousedown", () => {
      focusVisible = false;
    });

    document.addEventListener("focusin", (e) => {
      if (focusVisible) {
        e.target.classList.add("focus-visible");
      }
    });

    document.addEventListener("focusout", (e) => {
      e.target.classList.remove("focus-visible");
    });
  }

  /**
   * Set up keyboard navigation helpers
   */
  setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      // Alt + arrow keys for section navigation
      if (e.altKey && this.navigationController) {
        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            this.navigationController.previousSection();
            break;
          case "ArrowRight":
            e.preventDefault();
            this.navigationController.nextSection();
            break;
        }
      }
    });
  }

  /**
   * Set up ARIA live regions for dynamic content updates
   */
  setupAriaLiveRegions() {
    // Create live region for announcements
    const liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "sr-only";
    liveRegion.id = "live-region";
    document.body.appendChild(liveRegion);
  }

  /**
   * Monitor memory usage (Chrome only)
   */
  monitorMemoryUsage() {
    if ("memory" in performance) {
      setInterval(() => {
        const memory = performance.memory;
        console.log("Memory usage:", {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + "MB",
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + "MB",
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + "MB",
        });
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Dispatch app ready event
   */
  dispatchAppReadyEvent() {
    const event = new CustomEvent("wmappready", {
      detail: {
        version: "1.0.0",
        timestamp: Date.now(),
        features: ["navigation", "search", "print", "accessibility"],
      },
    });

    document.dispatchEvent(event);
  }

  /**
   * Utility: Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Utility: Escape regex special characters
   * @param {string} string - String to escape
   * @returns {string} - Escaped string
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

// Initialize app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.wmApp = new WMApp();
    window.wmApp.init();
  });
} else {
  window.wmApp = new WMApp();
  window.wmApp.init();
}

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = WMApp;
}
