// This script contains the logic for the dashboard simulation demo.

document.addEventListener('DOMContentLoaded', function() {
    const dashboardMetricsDiv = document.getElementById('dashboardMetrics');
    const dashboardBeforeBtn = document.getElementById('dashboardBeforeBtn');
    const dashboardAfterBtn = document.getElementById('dashboardAfterBtn');

    const dashboardData = {
        before: [
            { label: 'Avg. Comfort Score', value: '6/10', icon: '😞' },
            { label: 'HVAC Runtime (Daily)', value: '18 hrs', icon: '⏳' },
            { label: 'Energy Waste (Unoccupied)', value: '25%', icon: '💸' },
            { label: 'Override Frequency', value: 'High', icon: '👆' }
        ],
        after: [
            { label: 'Avg. Comfort Score', value: '9/10', icon: '😊' },
            { label: 'HVAC Runtime (Daily)', value: '11 hrs', icon: '✅' },
            { label: 'Energy Waste (Unoccupied)', value: '5%', icon: '💰' },
            { label: 'Override Frequency', value: 'Low', icon: '🧘' }
        ]
    };

    /**
     * Renders the dashboard metrics based on the given state ('before' or 'after').
     * @param {string} state - The state to render metrics for.
     */
    function renderDashboardMetrics(state) {
        dashboardMetricsDiv.innerHTML = dashboardData[state].map(metric => `
            <div class="dashboard-metric">
                <span class="text-2xl mr-2">${metric.icon}</span>
                <span>${metric.label}:</span>
                <span class="font-bold text-primary">${metric.value}</span>
            </div>
        `).join('');
    }

    // Initial render
    renderDashboardMetrics('before');

    // Event listeners for dashboard toggle buttons
    dashboardBeforeBtn?.addEventListener('click', function() {
        renderDashboardMetrics('before');
        dashboardBeforeBtn.classList.add('active');
        dashboardAfterBtn.classList.remove('active');
    });

    dashboardAfterBtn?.addEventListener('click', function() {
        renderDashboardMetrics('after');
        dashboardAfterBtn.classList.add('active');
        dashboardBeforeBtn.classList.remove('active');
    });
});
