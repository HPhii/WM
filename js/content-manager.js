/**
 * Content manager for loading and managing section content
 * This allows for easier content updates and maintenance
 */

class ContentManager {
  constructor() {
    this.contentCache = new Map();
    this.templates = new Map();
    this.isLoading = false;
  }

  /**
   * Initialize the content manager
   */
  init() {
    this.registerTemplates();
    this.loadStaticContent();
  }

  /**
   * Register content templates
   */
  registerTemplates() {
    // Example block template
    this.templates.set(
      "example",
      (content) => `
      <div class="example-block">
        <p><strong>${content.title}</strong></p>
        ${
          content.items
            ? `<ul>${content.items
                .map((item) => `<li>${item}</li>`)
                .join("")}</ul>`
            : ""
        }
        ${content.code ? `<pre><code>${content.code}</code></pre>` : ""}
      </div>
    `
    );

    // Table template
    this.templates.set(
      "table",
      (content) => `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              ${content.headers.map((header) => `<th>${header}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${content.rows
              .map(
                (row) => `
              <tr>
                ${row.map((cell) => `<td>${cell}</td>`).join("")}
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `
    );

    // Feature list template
    this.templates.set(
      "featureList",
      (content) => `
      <div class="feature-list">
        ${content.features
          .map(
            (feature) => `
          <div class="feature-item">
            <div class="feature-icon">
              <i class="${feature.icon}" aria-hidden="true"></i>
            </div>
            <div class="feature-content">
              <h4>${feature.title}</h4>
              <p>${feature.description}</p>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `
    );
  }

  /**
   * Load static content for sections
   */
  loadStaticContent() {
    // Define content for each section
    const sectionContent = {
      "master-data": {
        title: "Warehouse Management Master Data",
        sections: [
          {
            title: "Các loại Master Data chính trong SAP WM",
            content: [
              "Storage Bin Master Data",
              "Material Master",
              "Hazardous Material Master",
              "Batch Master",
            ],
            type: "list",
          },
          {
            title: "Storage Bin Master Data",
            content: {
              description:
                "Là dữ liệu về địa chỉ vật lý để chứa hàng trong kho.",
              structure: [
                {
                  level: "Warehouse Level",
                  description:
                    "các thông số áp dụng cho toàn kho (ví dụ: đơn vị đo, loại bin chuẩn)",
                },
                {
                  level: "Storage Type Level",
                  description:
                    "áp dụng cho từng loại khu (ví dụ: chỉ storage type pallet mới có max weight = 500kg)",
                },
                {
                  level: "Storage Bin",
                  description: "từng vị trí cụ thể như A1-01-01",
                },
              ],
            },
            type: "structured",
          },
        ],
      },

      "org-structure": {
        title: "Cấu Trúc Tổ Chức (Organizational Structure)",
        sections: [
          {
            title: "Các cấp đơn vị tổ chức (Từ trên xuống)",
            content: [
              {
                name: "Client",
                description: "Là cấp tổ chức cao nhất trong SAP.",
                details: [
                  "Một hệ thống SAP có thể có nhiều client (dev, test, production)",
                  "Tất cả dữ liệu đều thuộc một client cụ thể",
                ],
              },
              {
                name: "Company Code",
                description: "Là đơn vị pháp lý có báo cáo tài chính riêng",
                details: [
                  "Ví dụ: Global Bike có hai công ty: US00 (ở Mỹ), DE00 (ở Đức)",
                  "Là cấp thấp nhất cho các hoạt động tài chính",
                ],
              },
              {
                name: "Plant",
                description:
                  "Là một cơ sở vật lý thực tế: nhà máy, trung tâm phân phối, kho",
                details: [
                  "Plant sản xuất (manufacturing plant)",
                  "Plant phân phối (distribution center)",
                  "Plant dịch vụ hoặc bảo trì (maintenance plant)",
                ],
              },
            ],
            type: "hierarchy",
          },
        ],
      },
    };

    // Cache the content
    Object.entries(sectionContent).forEach(([sectionId, content]) => {
      this.contentCache.set(sectionId, content);
    });
  }

  /**
   * Get content for a specific section
   * @param {string} sectionId - The section ID
   * @returns {Object|null} - The section content
   */
  getContent(sectionId) {
    return this.contentCache.get(sectionId) || null;
  }

  /**
   * Render content using templates
   * @param {string} templateName - Name of the template
   * @param {Object} content - Content to render
   * @returns {string} - Rendered HTML
   */
  renderTemplate(templateName, content) {
    const template = this.templates.get(templateName);
    if (!template) {
      console.warn(`Template "${templateName}" not found`);
      return "";
    }

    return template(content);
  }

  /**
   * Load content dynamically (for future use with external content)
   * @param {string} sectionId - Section ID
   * @returns {Promise} - Promise that resolves with content
   */
  async loadContentAsync(sectionId) {
    if (this.contentCache.has(sectionId)) {
      return this.contentCache.get(sectionId);
    }

    try {
      this.isLoading = true;

      // In the future, this could load from external sources
      // const response = await fetch(`/api/content/${sectionId}`);
      // const content = await response.json();

      // For now, return cached content
      const content = this.getContent(sectionId);

      this.isLoading = false;
      return content;
    } catch (error) {
      console.error(`Failed to load content for ${sectionId}:`, error);
      this.isLoading = false;
      return null;
    }
  }

  /**
   * Update content for a section
   * @param {string} sectionId - Section ID
   * @param {Object} content - New content
   */
  updateContent(sectionId, content) {
    this.contentCache.set(sectionId, content);

    // Trigger content update event
    const event = new CustomEvent("contentupdate", {
      detail: { sectionId, content },
    });
    document.dispatchEvent(event);
  }

  /**
   * Clear content cache
   */
  clearCache() {
    this.contentCache.clear();
  }

  /**
   * Get loading state
   * @returns {boolean} - Whether content is currently loading
   */
  isContentLoading() {
    return this.isLoading;
  }

  /**
   * Create a formatted list from array data
   * @param {Array} items - List items
   * @param {string} listType - Type of list ('ul', 'ol', 'check')
   * @returns {string} - Formatted HTML list
   */
  createList(items, listType = "ul") {
    const listClass = listType === "check" ? "list-check" : "";
    const tag = listType === "ol" ? "ol" : "ul";

    return `
      <${tag} class="${listClass}">
        ${items
          .map(
            (item) =>
              `<li>${typeof item === "string" ? item : item.text || item}</li>`
          )
          .join("")}
      </${tag}>
    `;
  }

  /**
   * Create a definition list for terms and definitions
   * @param {Array} terms - Array of {term, definition} objects
   * @returns {string} - Formatted HTML definition list
   */
  createDefinitionList(terms) {
    return `
      <dl class="definition-list">
        ${terms
          .map(
            (item) => `
          <dt>${item.term}</dt>
          <dd>${item.definition}</dd>
        `
          )
          .join("")}
      </dl>
    `;
  }

  /**
   * Create a code block with syntax highlighting
   * @param {string} code - Code content
   * @param {string} language - Programming language
   * @returns {string} - Formatted HTML code block
   */
  createCodeBlock(code, language = "") {
    return `
      <pre class="code-block">
        <code class="language-${language}">${this.escapeHtml(code)}</code>
      </pre>
    `;
  }

  /**
   * Escape HTML entities
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Format text with basic markdown-like formatting
   * @param {string} text - Text to format
   * @returns {string} - Formatted HTML
   */
  formatText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>");
  }
}

// Export for module usage or expose globally
if (typeof module !== "undefined" && module.exports) {
  module.exports = ContentManager;
} else {
  window.ContentManager = ContentManager;
}
