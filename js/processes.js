/**
 * Processes page navigation and interaction functions
 * Handles collapsible sections, navigation, and UX enhancements
 */

// Process navigation and UX enhancement functions
console.log("Loading process navigation script...");

// Make functions globally accessible
window.toggleNavMenu = function () {
  try {
    console.log("toggleNavMenu called");
    const navItems = document.getElementById("navItems");
    const toggleIcon = document.querySelector(".nav-toggle i");

    if (!navItems || !toggleIcon) {
      console.error("Navigation elements not found");
      return;
    }

    navItems.classList.toggle("collapsed");

    if (navItems.classList.contains("collapsed")) {
      toggleIcon.style.transform = "rotate(-180deg)";
    } else {
      toggleIcon.style.transform = "rotate(0deg)";
    }
  } catch (error) {
    console.error("Error in toggleNavMenu:", error);
  }
};

// Navigate to specific process section
window.navigateToProcess = function (processId, navElement, event) {
  try {
    // Prevent default link behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log("navigateToProcess called with:", processId);

    // Debug: Check if target section exists
    const targetSection = document.getElementById(processId);
    console.log("Target section found:", !!targetSection);
    if (targetSection) {
      console.log("Target section classes:", targetSection.className);
    }

    // Update active navigation item
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });
    if (navElement) {
      navElement.classList.add("active");
    }

    // Close all sections first
    const allSections = document.querySelectorAll(".process-section");
    console.log("Found process sections:", allSections.length);

    allSections.forEach((section) => {
      const content = section.querySelector(".process-section-content");
      const expandBtn = section.querySelector(".expand-btn i");

      console.log(
        "Processing section:",
        section.id,
        "Content found:",
        !!content,
        "Expand button found:",
        !!expandBtn
      );

      if (content) {
        content.classList.add("collapsed");
      }
      if (section) {
        section.classList.add("collapsed");
      }
      if (expandBtn) {
        expandBtn.style.transform = "rotate(-90deg)";
      }
    });

    // Open target section
    if (targetSection) {
      const content = targetSection.querySelector(".process-section-content");
      const expandBtn = targetSection.querySelector(".expand-btn i");

      console.log("Target section content found:", !!content);
      console.log("Target section expand button found:", !!expandBtn);

      if (content) {
        content.classList.remove("collapsed");
        console.log("Removed collapsed class from content");
      }
      if (targetSection) {
        targetSection.classList.remove("collapsed");
        console.log("Removed collapsed class from section");
      }
      if (expandBtn) {
        expandBtn.style.transform = "rotate(0deg)";
        console.log("Rotated expand button");
      }

      // Smooth scroll to section
      setTimeout(() => {
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        console.log("Scrolled to section");
      }, 100);
    } else {
      console.error("Target section not found:", processId);
    }
  } catch (error) {
    console.error("Error in navigateToProcess:", error);
  }
};

// Toggle individual process section
window.toggleProcessSection = function (processId) {
  try {
    console.log("toggleProcessSection called with:", processId);

    const section = document.getElementById(processId);
    if (!section) {
      console.error("Section not found:", processId);
      return;
    }

    const content = section.querySelector(".process-section-content");
    const expandBtn = section.querySelector(".expand-btn i");

    if (content) {
      content.classList.toggle("collapsed");
    }
    if (section) {
      section.classList.toggle("collapsed");
    }

    if (content && expandBtn) {
      if (content.classList.contains("collapsed")) {
        expandBtn.style.transform = "rotate(-90deg)";
      } else {
        expandBtn.style.transform = "rotate(0deg)";
      }
    }
  } catch (error) {
    console.error("Error toggling section:", error);
  }
};

// Scroll to top function
window.scrollToTop = function () {
  try {
    console.log("scrollToTop called");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  } catch (error) {
    console.error("Error in scrollToTop:", error);
  }
};

// Show/hide back to top button based on scroll position
function handleScroll() {
  try {
    const backToTop = document.getElementById("backToTop");
    if (!backToTop) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 300) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  } catch (error) {
    console.error("Error in handleScroll:", error);
  }
}

// Initialize processes functionality
window.initializeProcesses = function () {
  console.log("Initializing process navigation...");

  // Verify functions are available globally
  console.log("Functions available:");
  console.log("- navigateToProcess:", typeof window.navigateToProcess);
  console.log("- toggleProcessSection:", typeof window.toggleProcessSection);
  console.log("- scrollToTop:", typeof window.scrollToTop);
  console.log("- toggleNavMenu:", typeof window.toggleNavMenu);

  // Debug: Check if all sections exist
  const sections = [
    "goods-receipt",
    "goods-issue",
    "picking",
    "packing",
    "shipping",
    "inventory",
  ];
  sections.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      console.log(`✓ Section found: ${sectionId}`);
    } else {
      console.error(`✗ Section missing: ${sectionId}`);
    }
  });

  // Set up scroll listener for back to top button
  window.addEventListener("scroll", handleScroll);

  // Initially collapse all sections except the first one
  const processSections = document.querySelectorAll(".process-section");
  console.log(`Found ${processSections.length} process sections`);

  processSections.forEach((section, index) => {
    if (index > 0) {
      const content = section.querySelector(".process-section-content");
      const expandBtn = section.querySelector(".expand-btn i");

      if (content) {
        content.classList.add("collapsed");
      }
      if (section) {
        section.classList.add("collapsed");
      }
      if (expandBtn) {
        expandBtn.style.transform = "rotate(-90deg)";
      }
    }
  });

  // Auto-collapse navigation on mobile after selection
  if (window.innerWidth <= 768) {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        setTimeout(() => {
          const navItems = document.getElementById("navItems");
          const toggleIcon = document.querySelector(".nav-toggle i");

          if (navItems) {
            navItems.classList.add("collapsed");
          }
          if (toggleIcon) {
            toggleIcon.style.transform = "rotate(-180deg)";
          }
        }, 500);
      });
    });
  }

  // Add keyboard navigation support
  document.addEventListener("keydown", function (e) {
    // Press 'N' to toggle navigation
    if (e.key.toLowerCase() === "n" && !e.ctrlKey && !e.altKey) {
      window.toggleNavMenu();
    }

    // Press 'T' to scroll to top
    if (e.key.toLowerCase() === "t" && !e.ctrlKey && !e.altKey) {
      window.scrollToTop();
    }

    // Press number keys 1-6 to jump to sections
    const numberKeys = ["1", "2", "3", "4", "5", "6"];
    const processIds = [
      "goods-receipt",
      "goods-issue",
      "picking",
      "packing",
      "shipping",
      "inventory",
    ];

    if (numberKeys.includes(e.key) && !e.ctrlKey && !e.altKey) {
      const index = parseInt(e.key) - 1;
      if (processIds[index]) {
        const navItem = document.querySelector(
          `[href="#${processIds[index]}"]`
        );
        if (navItem) {
          window.navigateToProcess(processIds[index], navItem);
        }
      }
    }
  });

  console.log("Process navigation initialized successfully!");
};

// Auto-initialize if DOM is already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.initializeProcesses);
} else {
  // DOM is already ready, initialize immediately
  setTimeout(window.initializeProcesses, 100);
}
