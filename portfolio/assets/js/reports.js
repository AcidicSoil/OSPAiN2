// Initialize charts when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    setupDateRangePicker();
    setupChartControls();
});

// Initialize all charts
function initializeCharts() {
    initializeUsageTrendsChart();
    initializeModelDistributionChart();
    initializeGeoDistributionChart();
}

// Usage Trends Chart
function initializeUsageTrendsChart() {
    const ctx = document.getElementById('usageTrendsChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(var(--primary-rgb), 0.2)');
    gradient.addColorStop(1, 'rgba(var(--primary-rgb), 0.0)');

    const data = {
        labels: generateTimeLabels(24),
        datasets: [{
            label: 'Requests',
            data: generateRandomData(24, 1000, 5000),
            borderColor: 'rgb(var(--primary-rgb))',
            backgroundColor: gradient,
            fill: true,
            tension: 0.4
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(var(--background-rgb), 0.9)',
                    titleColor: 'rgb(var(--text-rgb))',
                    bodyColor: 'rgb(var(--text-rgb))',
                    borderColor: 'rgba(var(--border-rgb), 0.2)',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(var(--border-rgb), 0.1)'
                    },
                    ticks: {
                        color: 'rgb(var(--text-rgb))'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgb(var(--text-rgb))'
                    }
                }
            }
        }
    };

    new Chart(ctx, config);
}

// Model Distribution Chart
function initializeModelDistributionChart() {
    const ctx = document.getElementById('modelDistributionChart').getContext('2d');
    
    const data = {
        labels: ['GPT-4', 'Claude', 'LLaMA', 'Mistral', 'Other'],
        datasets: [{
            data: [35, 25, 20, 15, 5],
            backgroundColor: [
                'rgba(var(--primary-rgb), 0.8)',
                'rgba(var(--secondary-rgb), 0.8)',
                'rgba(var(--accent-rgb), 0.8)',
                'rgba(var(--success-rgb), 0.8)',
                'rgba(var(--warning-rgb), 0.8)'
            ],
            borderWidth: 0
        }]
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'rgb(var(--text-rgb))',
                        padding: 20,
                        font: {
                            family: 'Inter'
                        }
                    }
                }
            }
        }
    };

    new Chart(ctx, config);
}

// Geographic Distribution Chart
function initializeGeoDistributionChart() {
    const ctx = document.getElementById('geoDistributionChart').getContext('2d');
    
    const data = {
        labels: ['NA', 'EU', 'APAC', 'LATAM', 'Other'],
        datasets: [{
            label: 'Users',
            data: [40, 30, 20, 7, 3],
            backgroundColor: 'rgba(var(--primary-rgb), 0.8)',
            borderRadius: 8
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(var(--border-rgb), 0.1)'
                    },
                    ticks: {
                        color: 'rgb(var(--text-rgb))'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgb(var(--text-rgb))'
                    }
                }
            }
        }
    };

    new Chart(ctx, config);
}

// Helper function to generate time labels
function generateTimeLabels(count) {
    const labels = [];
    const now = new Date();
    
    for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now - i * 3600000);
        labels.push(time.getHours().toString().padStart(2, '0') + ':00');
    }
    
    return labels;
}

// Helper function to generate random data
function generateRandomData(count, min, max) {
    return Array.from({ length: count }, () => 
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

// Setup date range picker
function setupDateRangePicker() {
    const buttons = document.querySelectorAll('.date-range-picker button');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            updateCharts(button.textContent);
        });
    });
}

// Setup chart controls
function setupChartControls() {
    const controls = document.querySelectorAll('.chart-controls button');
    
    controls.forEach(button => {
        button.addEventListener('click', () => {
            controls.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            updateUsageTrendsChart(button.textContent);
        });
    });
}

// Update charts based on date range
function updateCharts(range) {
    // Implementation for updating charts based on date range
    console.log(`Updating charts for range: ${range}`);
}

// Update usage trends chart based on selected metric
function updateUsageTrendsChart(metric) {
    // Implementation for updating usage trends chart based on selected metric
    console.log(`Updating usage trends chart for metric: ${metric}`);
}

// Handle region selection for geographic distribution
document.querySelector('.region-select').addEventListener('change', (e) => {
    // Implementation for updating geographic distribution based on selected region
    console.log(`Updating geographic distribution for region: ${e.target.value}`);
});

// Responsive chart resizing
window.addEventListener('resize', () => {
    Chart.instances.forEach(chart => {
        chart.resize();
    });
}); 