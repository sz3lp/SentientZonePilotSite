// quiz-storage.js

/**
 * Stores quiz results (risk level and estimated monthly bill) in sessionStorage.
 * This data can then be retrieved by other pages (e.g., proof.html, pilot.html)
 * to prefill forms or display personalized content.
 *
 * @param {string} risk - The calculated HVAC energy leak risk (e.g., 'LOW', 'MEDIUM', 'HIGH').
 * @param {number} bill - The estimated average monthly energy bill entered by the user.
 */
function storeQuizResults(risk, bill) {
    if (risk) {
        sessionStorage.setItem('quiz_risk', risk);
    }
    if (bill) {
        sessionStorage.setItem('quiz_bill', bill);
    }
}

/**
 * Prefills elements on other pages (like the ROI calculator or pilot form)
 * using the quiz data stored in sessionStorage.
 * This function should be called on pages where prefilling is desired.
 */
function prefillFromQuiz() {
    const quizRisk = sessionStorage.getItem('quiz_risk');
    const quizBill = sessionStorage.getItem('quiz_bill');

    // --- Prefill ROI Calculator (e.g., on pilot.html or proof.html) ---
    const billInput = document.getElementById('monthlyBill'); // Assuming this ID exists on the target page
    if (billInput && quizBill) {
        billInput.value = quizBill;
        // Optionally trigger calculation if the ROI calculator has an update function
        // For example, if roi-calc.js has a function like updateRoiDisplay(quizBill)
        // if (typeof updateRoiDisplay === 'function') {
        //     updateRoiDisplay(quizBill);
        // }
    }

    // --- Prefill Pilot Form fields (e.g., on pilot.html) ---
    // These IDs are from your pilot.html form
    const currentIssues = document.getElementById('currentIssues');
    const riskHidden = document.getElementById('quizRiskLevelHidden'); // Hidden input to pass risk
    const billHidden = document.getElementById('quizMonthlyBillHidden'); // Hidden input to pass bill

    if (quizBill && currentIssues) {
        // Provide a descriptive value for currentIssues based on the bill
        currentIssues.value = `High energy bills (approx. $${quizBill}/month)`;
        if (billHidden) {
            billHidden.value = quizBill;
        }
    }

    if (quizRisk && riskHidden) {
        riskHidden.value = quizRisk;
    }

    // --- Display Quiz Results on Proof Page Banner (as per your proof.html logic) ---
    // This part is crucial for proof.html to pick up the quiz results.
    const proofPageBannerRisk = document.getElementById('proof-banner-risk');
    const proofPageBannerWaste = document.getElementById('proof-banner-waste');
    const proofPageBanner = document.getElementById('proof-banner'); // The container div for the banner

    if (proofPageBanner && quizRisk && quizBill) {
        // Only show the banner if quiz data is present
        proofPageBanner.classList.remove('hidden');

        if (proofPageBannerRisk) {
            proofPageBannerRisk.textContent = quizRisk;
            // Optionally add styling based on risk level
            proofPageBannerRisk.classList.add(`text-${quizRisk.toLowerCase()}-risk-color`); // e.g., text-red-600 for HIGH
        }
        if (proofPageBannerWaste) {
            // Recalculate projected waste for display on proof page if needed,
            // or use the stored projected_annual_waste if you decide to store it directly from quiz.html
            // For now, using quizBill to estimate waste for display on proof page if proof.html expects it
            const annualBill = parseFloat(quizBill) * 12;
            const hvacPortion = annualBill * 0.40; // Assuming 40% of bill is HVAC
            const potentialSavings = hvacPortion * 0.30; // Assuming 30% savings on HVAC portion
            proofPageBannerWaste.textContent = `$${potentialSavings.toFixed(2)}`;
        }
    }
}

// Run the prefill logic once the DOM is fully loaded.
// This ensures that elements are available before attempting to prefill them.
document.addEventListener('DOMContentLoaded', prefillFromQuiz);
