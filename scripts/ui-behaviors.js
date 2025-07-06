document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links (e.g., "Explore the System" on how.html)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Learn More Toggles (used on how.html)
    document.querySelectorAll('.learn-more-toggle').forEach(button => {
        button.addEventListener('click', function() {
            const content = this.nextElementSibling;
            content.classList.toggle('show'); // 'show' class is defined in global.css for max-height transition
            this.textContent = content.classList.contains('show') ? 'Read less ▲' : 'Read more ▼';
        });
    });

    // Accordion functionality (used on proof.html)
    document.querySelectorAll('.accordion-button').forEach(button => {
        button.addEventListener('click', function() {
            const content = this.nextElementSibling; // The .accordion-content
            const icon = this.querySelector('.accordion-icon');

            // Close other open accordions
            document.querySelectorAll('.accordion-button').forEach(otherButton => {
                if (otherButton !== this) {
                    const otherContent = otherButton.nextElementSibling;
                    const otherIcon = otherButton.querySelector('.accordion-icon');
                    if (otherContent.classList.contains('show')) {
                        otherContent.classList.remove('show');
                        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                    }
                }
            });

            // Toggle current accordion
            content.classList.toggle('show');
            if (icon) {
                if (content.classList.contains('show')) {
                    icon.style.transform = 'rotate(180deg)';
                } else {
                    icon.style.transform = 'rotate(0deg)';
                }
            }
        });
    });

    // --- Modal Logic for Pilot Application (on pilot.html) ---
    const pilotModal = document.getElementById('pilotModal');
    const applyPilotBtn = document.getElementById('applyPilotBtn');
    const qualifyBtn = document.getElementById('qualifyBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const pilotApplicationForm = document.getElementById('pilotApplicationForm');
    const formMessage = document.getElementById('formMessage');

    function openModal() {
        if (pilotModal) {
            pilotModal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
            if (typeof fbq === 'function') {
                fbq('track', 'InitiateCheckout', {
                    content_name: 'Pilot Program Modal Open',
                    content_category: 'SentientZone Funnel'
                });
            }
        }
    }

    function closeModal() {
        if (pilotModal) {
            pilotModal.classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
            formMessage.style.display = 'none'; // Hide any previous messages
            pilotApplicationForm.reset(); // Clear the form
        }
    }

    // Event listeners to open modal
    if (applyPilotBtn) {
        applyPilotBtn.addEventListener('click', openModal);
    }
    if (qualifyBtn) {
        qualifyBtn.addEventListener('click', openModal);
    }

    // Event listener to close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Close modal if clicking outside the content
    if (pilotModal) {
        pilotModal.addEventListener('click', function(event) {
            if (event.target === pilotModal) {
                closeModal();
            }
        });
    }

    // Handle form submission for the modal
    if (pilotApplicationForm) {
        pilotApplicationForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            formMessage.style.display = 'none'; // Hide previous messages
            const submitButton = pilotApplicationForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';

            try {
                const formData = new FormData(this);
                const response = await fetch(this.action, {
                    method: this.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json' // Crucial for Getform to respond with JSON
                    }
                });

                if (response.ok) {
                    formMessage.textContent = 'Application submitted successfully! We\'ll be in touch soon.';
                    formMessage.classList.add('success');
                    formMessage.classList.remove('error', 'hidden');
                    formMessage.style.display = 'block';
                    if (typeof fbq === 'function') {
                        fbq('track', 'Lead', {
                            content_name: 'Pilot Application Submit',
                            content_category: 'SentientZone Funnel'
                        });
                    }
                    setTimeout(() => {
                        closeModal();
                    }, 3000); // Close modal after 3 seconds on success
                } else {
                    const errorData = await response.json(); // Try to parse error message from Getform
                    formMessage.textContent = `Submission failed: ${errorData.message || 'Please try again.'}`;
                    formMessage.classList.add('error');
                    formMessage.classList.remove('success', 'hidden');
                    formMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Form submission error:', error);
                formMessage.textContent = 'An unexpected error occurred. Please try again.';
                formMessage.classList.add('error');
                formMessage.classList.remove('success', 'hidden');
                formMessage.style.display = 'block';
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Application';
            }
        });
    }
});
