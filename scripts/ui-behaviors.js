// This script contains general UI behaviors that can be reused across pages.

document.addEventListener('DOMContentLoaded', function() {
    /**
     * Sets up click listeners for "Learn More" toggles.
     * Toggles the 'show' class on the next sibling element (content area).
     * Updates the button text based on the content visibility.
     * @param {string} toggleSelector - CSS selector for the toggle buttons.
     * @param {string} contentClass - Class to toggle on the content element.
     */
    window.setupLearnMoreToggles = function(toggleSelector, contentClass = 'show') {
        document.querySelectorAll(toggleSelector).forEach(button => {
            button.addEventListener('click', function() {
                const content = this.nextElementSibling;
                content.classList.toggle(contentClass);
                if (content.classList.contains(contentClass)) {
                    this.textContent = 'Learn less ▲';
                } else {
                    this.textContent = 'Learn more ▼';
                }
            });
        });
    };

    /**
     * Sets up smooth scrolling for anchor links.
     * @param {string} anchorSelector - CSS selector for anchor links (e.g., 'a[href^="#"]').
     */
    window.setupSmoothScrolling = function(anchorSelector) {
        document.querySelectorAll(anchorSelector).forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    };

    // Initialize common UI behaviors
    setupLearnMoreToggles('.learn-more-toggle');
    setupSmoothScrolling('a[href^="#"]');
});
