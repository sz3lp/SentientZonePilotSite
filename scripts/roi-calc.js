// This script contains the main JavaScript logic for the SentientZone Proof Page.
// It includes ROI calculation, PDF generation (if applicable, though not used here),
// accordion functionality (delegated to ui-behaviors.js or inline),
// pilot modal logic (now for ROI email gate), session storage fallbacks, and exit-intent trigger.

document.addEventListener('DOMContentLoaded', function() {
    // --- Initialize dataLayer for Google Tag Manager events ---
    // This ensures dataLayer is defined before any push operations,
    // even if GTM's main script hasn't fully loaded/processed yet.
    window.dataLayer = window.dataLayer || [];

    // --- Initial setup and URL parameter parsing ---
    const urlParams = new URLSearchParams(window.location.search);
    const riskLevelFromQuiz = urlParams.get('risk');
    const monthlyBillFromQuiz = urlParams.get('waste') ? parseFloat(urlParams.get('waste').replace('$', '').replace(',', '')) / 0.30 / 0.40 / 12 : null; // Reverse calculate monthly bill from waste if provided

    // Display Risk Banner if data from quiz is present
    const riskBanner = document.getElementById('riskBanner');
    const bannerRiskLevel = document.getElementById('bannerRiskLevel');
    if (riskBanner && bannerRiskLevel && riskLevelFromQuiz) {
        bannerRiskLevel.textContent = riskLevelFromQuiz;
        riskBanner.classList.remove('hidden');
    }

    // --- ROI Calculator Logic ---
    const calculateRoiBtn = document.getElementById('calculateRoiBtn');
    const monthlyBillInput = document.getElementById('monthlyBill');
    const buildingSqFtInput = document.getElementById('buildingSqFt'); // Retained for potential future use, not currently used in calculation
    const estimatedSavingsSpan = document.getElementById('estimatedSavings');
    const paybackPeriodSpan = document.getElementById('paybackPeriod');

    // Function to perform ROI calculation
    function performRoiCalculation() {
        const monthlyBill = parseFloat(monthlyBillInput.value);

        if (isNaN(monthlyBill) || monthlyBill <= 0) {
            estimatedSavingsSpan.textContent = '$0';
            paybackPeriodSpan.textContent = '0 Years';
            return { annualSavings: 0, paybackPeriod: '0 Years' }; // Return values for modal
        }

        const annualTotalBill = monthlyBill * 12;
        const annualHVACCost = annualTotalBill * 0.40; // Assuming 40% of bill is HVAC
        const annualSavings = annualHVACCost * 0.30; // Assuming 30% savings on HVAC (consistent with 18-30% range mentioned)

        const estimatedPilotCost = 6000; // Average estimated pilot cost for calculation

        const paybackPeriodValue = annualSavings > 0 ? (estimatedPilotCost / annualSavings) : 0;
        const paybackPeriodText = annualSavings > 0 ? `${paybackPeriodValue.toFixed(1)} Years` : 'N/A';

        estimatedSavingsSpan.textContent = `$${annualSavings.toFixed(0)}`;
        paybackPeriodSpan.textContent = paybackPeriodText;

        return { annualSavings: `$${annualSavings.toFixed(0)}`, paybackPeriod: paybackPeriodText };
    }

    // Event listener for the "Calculate My Payback" button
    if (calculateRoiBtn) {
        calculateRoiBtn.addEventListener('click', performRoiCalculation);
    }

    // Prefill monthly bill from URL params or session storage for ROI calculator
    let monthlyBillForRoiPrefill = urlParams.get('bill'); // From quiz.html direct bill parameter
    if (!monthlyBillForRoiPrefill && sessionStorage.getItem('quiz_bill')) {
        monthlyBillForRoiPrefill = sessionStorage.getItem('quiz_bill');
    }
    // If the quiz passed 'waste', convert it back to a monthly bill for the ROI calculator input
    if (monthlyBillFromQuiz && !monthlyBillForRoiPrefill) {
        monthlyBillForRoiPrefill = (monthlyBillFromQuiz / 0.30 / 0.40 / 12).toFixed(2);
    }

    if (monthlyBillForRoiPrefill && !isNaN(monthlyBillForRoiPrefill)) {
        monthlyBillInput.value = monthlyBillForRoiPrefill;
        // Automatically calculate when prefilled
        performRoiCalculation();
    }

    // --- ROI Email Gate Logic ---
    const estimateRoiCta = document.getElementById('estimateRoiCta');
    const roiEmailForm = document.getElementById('roiEmailForm');
    const roiEmailMessage = document.getElementById('roiEmailMessage');

    // Event listener for the "Estimate Your ROI" CTA button
    if (estimateRoiCta) {
        estimateRoiCta.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default link behavior

            // Perform calculation to get current ROI values
            const { annualSavings, paybackPeriod } = performRoiCalculation();

            // Open the ROI email gate modal and pass the calculated values
            // This function is defined in proof.html's inline script
            if (typeof window.openRoiEmailGateModal === 'function') {
                window.openRoiEmailGateModal(annualSavings, paybackPeriod);
            } else {
                console.error("openRoiEmailGateModal function not found. Check proof.html script.");
            }

            // Push GTM event for ROI CTA click
            dataLayer.push({
                event: 'cta_click',
                category: 'ROI Calculator',
                action: 'Estimate ROI Click',
                label: 'Open Email Gate',
                estimated_savings: annualSavings,
                payback_period: paybackPeriod
            });
        });
    }

    // Event listener for the ROI Email Gate form submission
    if (roiEmailForm) {
        roiEmailForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log("ROI Email Form submission triggered.");

            roiEmailMessage.textContent = ''; // Clear previous messages
            roiEmailMessage.classList.add('hidden'); // Hide message box

            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = "Sending...";

            const formAction = this.action;
            const email = document.getElementById('quizEmail') ? document.getElementById('quizEmail').value : ''; // Get email if quiz email field exists
            const estimatedSavings = document.getElementById('hiddenEstimatedSavings').value;
            const paybackPeriod = document.getElementById('hiddenPaybackPeriod').value;

            // Push GTM event for ROI email submission
            dataLayer.push({
                event: 'email_submit',
                category: 'ROI Calculator',
                action: 'ROI Report Request',
                label: email,
                estimated_savings: estimatedSavings,
                payback_period: paybackPeriod
            });

            try {
                const formData = new FormData(this);
                // Add any other relevant data to formData if not already in hidden fields
                formData.append('source_page', 'proof.html');
                formData.append('form_type', 'roi_report_request');

                const response = await fetch(formAction, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json' // Getform expects this for JSON response
                    }
                });

                if (response.ok) {
                    console.log("ROI Email submitted successfully. Redirecting to /pilot.");
                    // --- REDIRECT TO PILOT PAGE (Thank You Page) ---
                    window.location.href = '/pilot';
                } else {
                    const errorText = await response.text(); // Get more detailed error from Getform
                    console.error("Getform submission failed:", response.status, errorText);
                    roiEmailMessage.textContent = "Failed to send report. Please try again.";
                    roiEmailMessage.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Network error during ROI email submission:', error);
                roiEmailMessage.textContent = "An error occurred. Please try again.";
                roiEmailMessage.classList.remove('hidden');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Send My Report & Get Started";
            }
        });
    }

    // --- Existing Pilot Interest Form Modal Logic (from pilot.html, if it's still needed globally) ---
    // Note: This block might be redundant if the pilot form is now a "Thank You" page.
    // If you intend to have a separate pilot application modal on other pages, keep this.
    // Otherwise, this can be removed or moved to a script specific to the pilot page.
    const pilotInterestModal = document.getElementById('pilotInterestModal'); // This ID is from pilot.html
    const applyPilotBtn = document.getElementById('applyPilotBtn'); // This ID is from pilot.html
    const qualifyBtn = document.getElementById('qualifyBtn'); // This ID is from pilot.html
    const pilotApplicationForm = document.getElementById('pilotApplicationForm'); // This ID is from pilot.html
    const formMessage = document.getElementById('formMessage'); // This ID is from pilot.html
    const decisionAuthorityRadios = document.querySelectorAll('input[name="decision_authority"]'); // From pilot.html
    const decisionAuthorityNote = document.getElementById('decisionAuthorityNote'); // From pilot.html

    let hasModalBeenOpened = false;

    // These functions might be moved to a separate script for pilot.html if not used globally
    window.openPilotModal = function() {
        if (pilotInterestModal && pilotInterestModal.classList.contains('show')) {
            return;
        }
        if (pilotInterestModal) {
            pilotInterestModal.classList.add('show');
            hasModalBeenOpened = true;
        }

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

        // Prefill logic for pilot form (if it still exists and is relevant)
        const buildingSqFtForm = document.getElementById('buildingSqFtForm'); // From pilot.html
        const currentIssues = document.getElementById('currentIssues'); // From pilot.html
        const quizRiskLevelHidden = document.getElementById('quizRiskLevelHidden'); // From pilot.html
        const quizMonthlyBillHidden = document.getElementById('quizMonthlyBillHidden'); // From pilot.html

        if (monthlyBillFromSource && !isNaN(monthlyBillFromSource)) {
            if (buildingSqFtForm) buildingSqFtForm.value = ''; // Clear if not directly mapped
            if (currentIssues) currentIssues.value = `High energy bills (approx. $${monthlyBillFromSource}/month)`;
            if (quizMonthlyBillHidden) quizMonthlyBillHidden.value = monthlyBillFromSource;
        }
        if (riskLevelFromSource) {
            if (quizRiskLevelHidden) quizRiskLevelHidden.value = riskLevelFromSource;
        }
    };

    window.closePilotModal = function() {
        if (pilotInterestModal) {
            pilotInterestModal.classList.remove('show');
            if (pilotApplicationForm) pilotApplicationForm.reset();
            if (formMessage) {
                formMessage.style.display = 'none';
                formMessage.classList.remove('error', 'success');
            }
            if (decisionAuthorityNote) decisionAuthorityNote.classList.add('hidden');
        }
    };

    // Add event listeners for pilot buttons if they exist
    if (applyPilotBtn) applyPilotBtn.addEventListener('click', window.openPilotModal);
    if (qualifyBtn) qualifyBtn.addEventListener('click', window.openPilotModal);

    // Close modal if clicked outside content
    if (pilotInterestModal) {
        pilotInterestModal.addEventListener('click', function(event) {
            if (event.target === pilotInterestModal) {
                window.closePilotModal();
            }
        });
    }

    // Conditional display for Decision Authority Note (for pilot form)
    decisionAuthorityRadios.forEach(radio => {
        if (decisionAuthorityNote) { // Ensure element exists
            radio.addEventListener('change', function() {
                if (this.value === 'no') {
                    decisionAuthorityNote.classList.remove('hidden');
                } else {
                    decisionAuthorityNote.classList.add('hidden');
                }
            });
        }
    });

    // Pilot Application Form Submission (using Getform) - This should probably be moved to pilot.html's script
    if (pilotApplicationForm) {
        pilotApplicationForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (formMessage) {
                formMessage.style.display = 'none';
                formMessage.classList.remove('error', 'success');
            }

            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Submitting...";
            }

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
                    if (formMessage) {
                        formMessage.textContent = "Application submitted successfully! We'll be in touch shortly.";
                        formMessage.classList.add('success');
                        formMessage.style.display = 'block';
                    }
                    this.reset();
                    if (decisionAuthorityNote) decisionAuthorityNote.classList.add('hidden');
                    setTimeout(window.closePilotModal, 3000);
                } else {
                    if (formMessage) {
                        formMessage.textContent = "Failed to submit application. Please try again.";
                        formMessage.classList.add('error');
                        formMessage.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Error submitting pilot form:', error);
                if (formMessage) {
                    formMessage.textContent = "An error occurred. Please try again.";
                    formMessage.classList.add('error');
                    formMessage.style.display = 'block';
                }
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Submit Pilot Application";
                }
            }
        });
    }

    // Exit-Intent Trigger (kept for global functionality, but consider if it's still desired on proof.html)
    let hasModalBeenOpenedGlobally = false; // Separate flag for this general modal
    document.addEventListener('mouseout', function(e) {
        // Only trigger if mouse is moving towards the top and leaving document, and no modal is currently open
        // and the ROI email gate modal (or any other primary modal) hasn't been opened yet.
        const roiModal = document.getElementById('roiEmailGateModal');
        if (!e.toElement && !e.relatedTarget && e.clientY < 10 && !hasModalBeenOpenedGlobally && roiModal && roiModal.classList.contains('hidden')) {
            // If the ROI email gate modal is the one to open on exit intent
            // We need to pass current ROI values if we want them prefilled
            const { annualSavings, paybackPeriod } = performRoiCalculation(); // Get current ROI values
            window.openRoiEmailGateModal(annualSavings, paybackPeriod);
            hasModalBeenOpenedGlobally = true; // Set flag so it only triggers once per session
        }
    });

});
