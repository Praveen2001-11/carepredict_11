class UI {
    constructor(model, dashboard) {
        this.model = model;
        this.dashboard = dashboard;
        this.initEventListeners();
    }

    initEventListeners() {
        // Prediction Form
        const form = document.getElementById('prediction-form');
        form.addEventListener('submit', (e) => this.handlePrediction(e));

        // Reset Form
        document.getElementById('reset-btn').addEventListener('click', () => {
            form.reset();
            document.getElementById('result-card').classList.add('hidden');
        });

        // Retrain Button
        const retrainBtn = document.getElementById('retrain-btn');
        retrainBtn.addEventListener('click', () => this.handleRetrain(retrainBtn));
    }

    handlePrediction(e) {
        e.preventDefault();

        // Gather inputs
        const inputs = {
            waitingTime: parseInt(document.getElementById('waitingTime').value),
            age: parseInt(document.getElementById('age').value),
            doctorComm: parseInt(document.getElementById('doctorComm').value),
            nurseResp: parseInt(document.getElementById('nurseResp').value),
            cleanliness: parseInt(document.getElementById('cleanliness').value),
            treatmentEff: parseInt(document.getElementById('treatmentEff').value),
            billingExp: parseInt(document.getElementById('billingExp').value),
            admissionType: document.getElementById('admissionType').value,
            roomType: document.getElementById('roomType').value
        };

        const result = this.model.predict(inputs);
        this.showResult(result);
    }

    showResult(result) {
        const card = document.getElementById('result-card');
        card.classList.remove('hidden');

        // Animate scroll to result
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        const levelEl = document.getElementById('prediction-level');
        levelEl.innerText = result.level;

        // Color coding
        if (result.level === 'High') levelEl.style.color = 'var(--success-color)';
        else if (result.level === 'Medium') levelEl.style.color = 'var(--warning-color)';
        else levelEl.style.color = 'var(--danger-color)';

        // Update bars
        document.getElementById('prob-bar').style.width = result.probability + '%';
        document.getElementById('prob-score').innerText = result.probability + '%';
        document.getElementById('conf-score').innerText = result.confidence + '%';

        // Factors
        const list = document.getElementById('factors-list');
        list.innerHTML = '';
        result.factors.forEach(factor => {
            const li = document.createElement('li');
            li.innerText = factor;
            list.appendChild(li);
        });
    }

    async handleRetrain(btn) {
        const spinner = btn.querySelector('.loading-spinner');
        const originalText = btn.childNodes[0].textContent; // Keep text node

        btn.disabled = true;
        spinner.classList.remove('hidden');

        // Simulate API call
        const result = await this.model.retrain();

        spinner.classList.add('hidden');
        btn.disabled = false;

        // Update UI
        this.dashboard.renderMetrics();
        this.dashboard.renderTable(); // Update with new rows
        this.dashboard.updateCharts(result.metrics.accuracy);

        alert(`Model retrained successfully to version ${result.version}`);
    }
}
