/**
 * Utility functions for the WM Knowledge Hub
 * Common helper functions used throughout the application
 */

const WMUtils = {
  /**
   * Debounce function to limit function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Whether to execute immediately
   * @returns {Function} - Debounced function
   */
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  /**
   * Throttle function to limit function execution frequency
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} - Throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Format text for better readability
   * @param {string} text - Text to format
   * @returns {string} - Formatted text
   */
  formatText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");
  },

  /**
   * Sanitize HTML to prevent XSS attacks
   * @param {string} html - HTML to sanitize
   * @returns {string} - Sanitized HTML
   */
  sanitizeHtml(html) {
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
  },

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} - Success status
   */
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand("copy");
        textArea.remove();
        return success;
      }
    } catch (error) {
      console.error("Failed to copy text:", error);
      return false;
    }
  },

  /**
   * Format numbers with thousand separators
   * @param {number} num - Number to format
   * @param {string} locale - Locale for formatting
   * @returns {string} - Formatted number
   */
  formatNumber(num, locale = "vi-VN") {
    return new Intl.NumberFormat(locale).format(num);
  },

  /**
   * Format dates in Vietnamese format
   * @param {Date|string} date - Date to format
   * @param {string} format - Format type ('short', 'long', 'time')
   * @returns {string} - Formatted date
   */
  formatDate(date, format = "short") {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    const options = {
      short: { day: "2-digit", month: "2-digit", year: "numeric" },
      long: {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      },
      time: {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      },
    };

    return new Intl.DateTimeFormat("vi-VN", options[format]).format(dateObj);
  },

  /**
   * Generate unique ID
   * @param {string} prefix - Optional prefix
   * @returns {string} - Unique ID
   */
  generateId(prefix = "id") {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Deep clone an object
   * @param {Object} obj - Object to clone
   * @returns {Object} - Cloned object
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map((item) => this.deepClone(item));
    if (typeof obj === "object") {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  },

  /**
   * Check if element is in viewport
   * @param {HTMLElement} element - Element to check
   * @param {number} threshold - Visibility threshold (0-1)
   * @returns {boolean} - Whether element is visible
   */
  isInViewport(element, threshold = 0.1) {
    const rect = element.getBoundingClientRect();
    const elementHeight = rect.bottom - rect.top;
    const elementWidth = rect.right - rect.left;

    return (
      rect.top <= window.innerHeight - elementHeight * threshold &&
      rect.bottom >= elementHeight * threshold &&
      rect.left <= window.innerWidth - elementWidth * threshold &&
      rect.right >= elementWidth * threshold
    );
  },

  /**
   * Smooth scroll to element
   * @param {HTMLElement|string} target - Element or selector
   * @param {Object} options - Scroll options
   */
  scrollToElement(target, options = {}) {
    const element =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!element) return;

    const defaultOptions = {
      behavior: "smooth",
      block: "start",
      inline: "nearest",
      offset: 0,
    };

    const scrollOptions = { ...defaultOptions, ...options };

    if (scrollOptions.offset) {
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - scrollOptions.offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: scrollOptions.behavior,
      });
    } else {
      element.scrollIntoView({
        behavior: scrollOptions.behavior,
        block: scrollOptions.block,
        inline: scrollOptions.inline,
      });
    }
  },

  /**
   * Load script dynamically
   * @param {string} src - Script source URL
   * @param {Object} options - Loading options
   * @returns {Promise} - Promise that resolves when script loads
   */
  loadScript(src, options = {}) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = options.async !== false;
      script.defer = options.defer || false;

      script.onload = () => resolve(script);
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

      if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
          script.setAttribute(key, value);
        });
      }

      document.head.appendChild(script);
    });
  },

  /**
   * Load CSS dynamically
   * @param {string} href - CSS file URL
   * @returns {Promise} - Promise that resolves when CSS loads
   */
  loadCSS(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;

      link.onload = () => resolve(link);
      link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));

      document.head.appendChild(link);
    });
  },

  /**
   * Get browser information
   * @returns {Object} - Browser info
   */
  getBrowserInfo() {
    const ua = navigator.userAgent;
    const browser = {
      name: "Unknown",
      version: "Unknown",
      mobile: /Mobile|Android|iPhone|iPad/.test(ua),
    };

    if (ua.includes("Chrome")) {
      browser.name = "Chrome";
      browser.version = ua.match(/Chrome\/(\d+)/)?.[1] || "Unknown";
    } else if (ua.includes("Firefox")) {
      browser.name = "Firefox";
      browser.version = ua.match(/Firefox\/(\d+)/)?.[1] || "Unknown";
    } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
      browser.name = "Safari";
      browser.version = ua.match(/Version\/(\d+)/)?.[1] || "Unknown";
    } else if (ua.includes("Edge")) {
      browser.name = "Edge";
      browser.version = ua.match(/Edge\/(\d+)/)?.[1] || "Unknown";
    }

    return browser;
  },

  /**
   * Check if device supports touch
   * @returns {boolean} - Whether device supports touch
   */
  isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Get device type
   * @returns {string} - Device type (mobile, tablet, desktop)
   */
  getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  },

  /**
   * Create event emitter
   * @returns {Object} - Event emitter object
   */
  createEventEmitter() {
    const events = {};

    return {
      on(event, callback) {
        if (!events[event]) events[event] = [];
        events[event].push(callback);
      },

      off(event, callback) {
        if (!events[event]) return;
        events[event] = events[event].filter((cb) => cb !== callback);
      },

      emit(event, ...args) {
        if (!events[event]) return;
        events[event].forEach((callback) => callback(...args));
      },

      once(event, callback) {
        const onceCallback = (...args) => {
          callback(...args);
          this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
      },
    };
  },

  /**
   * Local storage with JSON support and error handling
   */
  storage: {
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error("Storage set error:", error);
        return false;
      }
    },

    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error("Storage get error:", error);
        return defaultValue;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error("Storage remove error:", error);
        return false;
      }
    },

    clear() {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.error("Storage clear error:", error);
        return false;
      }
    },
  },
};

// Export for module usage or expose globally
if (typeof module !== "undefined" && module.exports) {
  module.exports = WMUtils;
} else {
  window.WMUtils = WMUtils;
}
