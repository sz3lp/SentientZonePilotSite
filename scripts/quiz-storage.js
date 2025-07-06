// Store quiz results in sessionStorage
function storeQuizResults(risk, bill) {
    if (risk) sessionStorage.setItem('quiz_risk', risk);
    if (bill) sessionStorage.setItem('quiz_bill', bill);
}

// Prefill ROI calculator and pilot form from stored quiz data
function prefillFromQuiz() {
    const quizRisk = sessionStorage.getItem('quiz_risk');
    const quizBill = sessionStorage.getItem('quiz_bill');

    // ROI Calculator
    const billInput = document.getElementById('monthlyBill');
    if (billInput && quizBill) {
        billInput.value = quizBill;
    }

    // Pilot form
    const billForm = document.getElementById('buildingSqFtForm');
    const currentIssues = document.getElementById('currentIssues');
    const riskHidden = document.getElementById('quizRiskLevelHidden');
    const billHidden = document.getElementById('quizMonthlyBillHidden');

    if (quizBill && currentIssues) {
        currentIssues.value = `High energy bills (approx. $${quizBill}/month)`;
        if (billHidden) billHidden.value = quizBill;
    }

    if (quizRisk && riskHidden) {
        riskHidden.value = quizRisk;
    }
}

// Run prefill logic on load
document.addEventListener('DOMContentLoaded', prefillFromQuiz);
