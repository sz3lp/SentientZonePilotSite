// This script contains the main JavaScript logic for the SentientZone Proof Page.
// It includes ROI calculation, PDF generation, accordion functionality,
// pilot modal logic, session storage fallbacks, and exit-intent trigger.

document.addEventListener('DOMContentLoaded', function() {
    // Parse URL parameters for dynamic banner and ROI prefill
    const urlParams = new URLSearchParams(window.location.search);
    const riskLevel = urlParams.get('risk');
    const monthlyBillFromQuiz = urlParams.get('bill');

    if (riskLevel) {
        document.getElementById('bannerRiskLevel').textContent = riskLevel;
        document.getElementById('riskBanner').classList.remove('hidden');
    }

    if (monthlyBillFromQuiz && !isNaN(monthlyBillFromQuiz)) {
        const monthlyBillInput = document.getElementById('monthlyBill');
        if (monthlyBillInput) {
            monthlyBillInput.value = monthlyBillFromQuiz;
            // Optionally trigger calculation immediately if prefilled
            // document.getElementById('calculateRoiBtn').click();
        }
    }

    // ROI Calculator Logic
    const calculateRoiBtn = document.getElementById('calculateRoiBtn');
    const monthlyBillInput = document.getElementById('monthlyBill');
    const buildingSqFtInput = document.getElementById('buildingSqFt'); // Retained for potential future use, not currently used in calculation
    const estimatedSavingsSpan = document.getElementById('estimatedSavings');
    const paybackPeriodSpan = document.getElementById('paybackPeriod');

    calculateRoiBtn.addEventListener('click', function() {
        const monthlyBill = parseFloat(monthlyBillInput.value);

        if (isNaN(monthlyBill) || monthlyBill <= 0) {
            estimatedSavingsSpan.textContent = '$0';
            paybackPeriodSpan.textContent = '0 Years';
            return;
        }

        const annualTotalBill = monthlyBill * 12;
        const annualHVACCost = annualTotalBill * 0.40; // Assuming 40% of bill is HVAC
        const annualSavings = annualHVACCost * 0.30; // Assuming 30% savings on HVAC (consistent with 18-30% range mentioned)

        const estimatedPilotCost = 6000; // Average estimated pilot cost for calculation

        const paybackPeriod = annualSavings > 0 ? (estimatedPilotCost / annualSavings).toFixed(1) : 'N/A';

        estimatedSavingsSpan.textContent = `$${annualSavings.toFixed(0)}`;
        paybackPeriodSpan.textContent = `${paybackPeriod} Years`;
    });

    // Accordion Logic for Case Studies and Doubt Destruction
    function setupAccordion(selector) {
        document.querySelectorAll(selector).forEach(button => {
            button.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const icon = this.querySelector('.accordion-icon');

                content.classList.toggle('show');
                if (icon) {
                    icon.classList.toggle('rotate-180');
                }

                // If it's a case study button, update its text
                if (button.classList.contains('toggle-case-study')) {
                    if (content.classList.contains('show')) {
                        button.textContent = 'Read Less ▲';
                    } else {
                        button.textContent = 'Read More ▼';
                    }
                }
            });
        });
    }

    // Setup for Doubt Destruction FAQs
    setupAccordion('.accordion-item .accordion-button');

    // Setup for Case Study Details
    setupAccordion('.toggle-case-study'); // Uses the same accordion logic, just different class

    // Smooth scrolling for CTA buttons, if they link to sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Pilot Interest Form Modal Logic
    const pilotInterestModal = document.getElementById('pilotInterestModal');
    const applyPilotBtn = document.getElementById('applyPilotBtn');
    const qualifyBtn = document.getElementById('qualifyBtn');
    const pilotApplicationForm = document.getElementById('pilotApplicationForm');
    const formMessage = document.getElementById('formMessage');
    const decisionAuthorityRadios = document.querySelectorAll('input[name="decision_authority"]');
    const decisionAuthorityNote = document.getElementById('decisionAuthorityNote');

    // Hidden fields for prefilling from quiz
    const quizRiskLevelHidden = document.getElementById('quizRiskLevelHidden');
    const quizMonthlyBillHidden = document.getElementById('quizMonthlyBillHidden');

    let hasModalBeenOpened = false; // Flag to track if the modal has been opened

    window.openPilotModal = function() { // Made global for exit-intent
        if (pilotInterestModal.classList.contains('show')) {
            return; // Prevent opening if already open
        }
        pilotInterestModal.classList.add('show');
        hasModalBeenOpened = true; // Set flag to true

        // Prefill from URL params first
        const urlParams = new URLSearchParams(window.location.search);
        let monthlyBillFromSource = urlParams.get('bill');
        let riskLevelFromSource = urlParams.get('risk');

        // Fallback to Session Storage if no URL params
        if (!monthlyBillFromSource) {
            monthlyBillFromSource = sessionStorage.getItem('quiz_bill');
        }
        if (!riskLevelFromSource) {
            riskLevelFromSource = sessionStorage.getItem('quiz_risk');
        }

        if (monthlyBillFromSource && !isNaN(monthlyBillFromSource)) {
            document.getElementById('buildingSqFtForm').value = ''; // Clear if not directly mapped, or prefill with a calculated value
            document.getElementById('currentIssues').value = `High energy bills (approx. $${monthlyBillFromSource}/month)`;
            quizMonthlyBillHidden.value = monthlyBillFromSource;
        }
        if (riskLevelFromSource) {
            quizRiskLevelHidden.value = riskLevelFromSource;
            // You could also dynamically add text to the form based on risk if desired
        }
    };

    window.closePilotModal = function() { // Made global for onclick in HTML
        pilotInterestModal.classList.remove('show');
        pilotApplicationForm.reset(); // Reset form on close
        formMessage.style.display = 'none'; // Hide messages
        formMessage.classList.remove('error', 'success');
        decisionAuthorityNote.classList.add('hidden'); // Hide note
    };

    applyPilotBtn.addEventListener('click', openPilotModal);
    qualifyBtn.addEventListener('click', openPilotModal);

    // Close modal if clicked outside content
    pilotInterestModal.addEventListener('click', function(event) {
        if (event.target === pilotInterestModal) {
            closePilotModal();
        }
    });

    // Conditional display for Decision Authority Note
    decisionAuthorityRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'no') {
                decisionAuthorityNote.classList.remove('hidden');
            } else {
                decisionAuthorityNote.classList.add('hidden');
            }
        });
    });

    // Pilot Application Form Submission (using Getform)
    pilotApplicationForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        formMessage.style.display = 'none'; // Hide previous messages
        formMessage.classList.remove('error', 'success');

        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        try {
            const formData = new FormData(this);

            const response = await fetch(this.action, {
                method: this.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                formMessage.textContent = "Application submitted successfully! We'll be in touch shortly.";
                formMessage.classList.add('success');
                formMessage.style.display = 'block';
                pilotApplicationForm.reset(); // Clear form fields
                decisionAuthorityNote.classList.add('hidden'); // Hide note
                setTimeout(closePilotModal, 3000); // Close modal after 3 seconds
            } else {
                formMessage.textContent = "Failed to submit application. Please try again.";
                formMessage.classList.add('error');
                formMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error submitting pilot form:', error);
            formMessage.textContent = "An error occurred. Please try again.";
            formMessage.classList.add('error');
            formMessage.style.display = 'block';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Submit Pilot Application";
        }
    });

    // Prefill monthly bill from URL params if available (for ROI calculator)
    // This runs independently of the modal prefill
    const urlParamsForRoi = new URLSearchParams(window.location.search);
    let monthlyBillForRoi = urlParamsForRoi.get('bill');

    // Fallback to session storage for ROI calculator prefill
    if (!monthlyBillForRoi) {
        monthlyBillForRoi = sessionStorage.getItem('quiz_bill');
    }

    if (monthlyBillForRoi && !isNaN(monthlyBillForRoi)) {
        monthlyBillInput.value = monthlyBillForRoi;
        // Optionally, automatically calculate when prefilled
        // calculateRoiBtn.click();
    }

    // Exit-Intent Trigger
    document.addEventListener('mouseout', function(e) {
        // Check if the mouse is moving towards the top of the viewport (clientY < 10)
        // and if it's leaving the document body (e.toElement is null and e.relatedTarget is null)
        // and if the modal hasn't been opened yet.
        if (!e.toElement && !e.relatedTarget && e.clientY < 10 && !hasModalBeenOpened) {
            openPilotModal();
        }
    });
});
