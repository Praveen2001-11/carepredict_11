class Dashboard {
    constructor(model) {
        this.model = model;
        this.driftChart = null;
    }

    init() {
        this.renderTable();
        this.renderMetrics();
        this.initCharts();
    }

    renderTable() {
        const tbody = document.getElementById('schema-table-body');
        tbody.innerHTML = '';

        // Show first 10 rows
        const rows = this.model.dataset.slice(0, 10);
        rows.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.id}</td>
                <td>${row.waitingTime}</td>
                <td>${row.doctorComm}</td>
                <td>${row.nurseResp}</td>
                <td>${row.cleanliness}</td>
                <td>${row.treatmentEff}</td>
                <td>${row.billingExp}</td>
                <td>${row.age}</td>
                <td>${row.admissionType}</td>
                <td><span class="badge ${row.satisfaction === 'High' ? 'success' : 'warning'}">${row.satisfaction}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    renderMetrics() {
        document.getElementById('model-version').innerText = this.model.systemVersion;
        document.getElementById('last-retrained').innerText = this.model.lastRetrained.toLocaleString();
        document.getElementById('metric-accuracy').innerText = (this.model.metrics.accuracy * 100).toFixed(1) + '%';
        document.getElementById('metric-f1').innerText = this.model.metrics.f1Score.toFixed(2);
    }

    initCharts() {
        const ctx = document.getElementById('driftChart').getContext('2d');
        this.driftChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Model Accuracy (Drift Monitoring)',
                    data: this.model.metrics.drift,
                    borderColor: '#0066CC',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 0.8,
                        max: 1.0
                    }
                }
            }
        });
    }

    updateCharts(newMetric) {
        // Add new data point
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const d = new Date();
        const label = monthNames[d.getMonth()];

        this.driftChart.data.labels.push(label);
        this.driftChart.data.datasets[0].data.push(newMetric);

        // Remove oldest if too many
        if (this.driftChart.data.labels.length > 8) {
            this.driftChart.data.labels.shift();
            this.driftChart.data.datasets[0].data.shift();
        }

        this.driftChart.update();
    }
}
