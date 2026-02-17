class HospitalModel {
    constructor() {
        this.systemVersion = 'v1.0.0';
        this.lastRetrained = new Date('2024-10-24T14:30:00');
        this.metrics = {
            accuracy: 0.894,
            f1Score: 0.87,
            drift: [] // historical drift data
        };
        this.dataset = [];
        this.weights = {
            waitingTime: -0.15, // Negative impact
            doctorComm: 0.25,
            nurseResp: 0.20,
            cleanliness: 0.15,
            treatmentEff: 0.30,
            billingExp: 0.10,
            age: -0.01 // Slight negative correlation
        };
        // Initialize with data
        this.generateSyntheticData(50);
        this.generateDriftHistory();
    }

    generateSyntheticData(count) {
        const types = ['Emergency', 'Urgent', 'Elective', 'Trauma'];
        this.dataset = [];

        for (let i = 0; i < count; i++) {
            const row = {
                id: 1000 + i,
                waitingTime: Math.floor(Math.random() * 60) + 5,
                doctorComm: Math.floor(Math.random() * 5) + 1,
                nurseResp: Math.floor(Math.random() * 5) + 1,
                cleanliness: Math.floor(Math.random() * 5) + 1,
                treatmentEff: Math.floor(Math.random() * 5) + 1,
                billingExp: Math.floor(Math.random() * 5) + 1,
                age: Math.floor(Math.random() * 80) + 18,
                admissionType: types[Math.floor(Math.random() * types.length)],
                satisfaction: 'Medium' // Placeholder, computed below
            };

            // Assign label based on "ground truth" logic (simplified)
            const score = this._calculateScore(row);
            row.satisfaction = this._getLabel(score);
            this.dataset.push(row);
        }
        return this.dataset;
    }

    generateDriftHistory() {
        // Generate 6 months of accuracy data
        this.metrics.drift = [0.88, 0.89, 0.90, 0.89, 0.88, 0.89];
    }

    _calculateScore(inputs) {
        // Linear Combination
        let score = 0;

        // Normalize waiting time (0-120 mins -> 0-1) roughly
        const normWait = Math.min(inputs.waitingTime / 60, 2);
        score += normWait * this.weights.waitingTime;

        score += (inputs.doctorComm / 5) * this.weights.doctorComm;
        score += (inputs.nurseResp / 5) * this.weights.nurseResp;
        score += (inputs.cleanliness / 5) * this.weights.cleanliness;
        score += (inputs.treatmentEff / 5) * this.weights.treatmentEff;
        score += (inputs.billingExp / 5) * this.weights.billingExp;

        // Age factor: Younger patients might be more critical? Or older?
        // Let's say older patients are slightly easier to satisfy (positive bias)
        // Adjust weight logic: actually let's make age negligible check
        score += (inputs.age / 100) * this.weights.age;

        // Bias
        score += 0.2;

        return score; // Range roughly -0.5 to 1.5
    }

    _getLabel(score) {
        if (score > 0.65) return 'High';
        if (score > 0.35) return 'Medium';
        return 'Low';
    }

    predict(inputs) {
        const score = this._calculateScore(inputs);
        const label = this._getLabel(score);

        // Calculate probability (sigmoid-ish mapping for display)
        // Map score range roughly 0.0 to 1.0 to 0-100%
        let probability = Math.max(0, Math.min(1, (score + 0.2) / 1.2));

        // Synthesize confidence based on distance from decision boundaries
        let distHigh = Math.abs(score - 0.65);
        let distMed = Math.abs(score - 0.35);
        let dist = Math.min(distHigh, distMed);
        let confidence = 0.5 + (dist * 2); // heuristic
        if (confidence > 0.98) confidence = 0.98;

        // Identify key factors
        const factors = [];
        if (inputs.waitingTime > 45) factors.push("High waiting time negatively impacted score");
        if (inputs.doctorComm < 3) factors.push("Low doctor communication rating");
        if (inputs.treatmentEff > 4) factors.push("Effective treatment boosted score");
        if (inputs.cleanliness > 4) factors.push("Excellent cleanliness");
        if (factors.length === 0) factors.push("Balanced service factors");

        return {
            level: label,
            probability: (probability * 100).toFixed(1),
            confidence: (confidence * 100).toFixed(1),
            factors: factors
        };
    }

    retrain() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Stimulate retraining
                const vParts = this.systemVersion.split('.');
                vParts[2] = parseInt(vParts[2]) + 1;
                this.systemVersion = vParts.join('.');
                this.lastRetrained = new Date();

                // Slightly improve metrics
                this.metrics.accuracy = Math.min(0.98, this.metrics.accuracy + 0.01);
                this.metrics.f1Score = Math.min(0.97, this.metrics.f1Score + 0.01);

                // Generate new data row to append
                this.generateSyntheticData(5);

                resolve({
                    version: this.systemVersion,
                    date: this.lastRetrained,
                    metrics: this.metrics
                });
            }, 2000); // 2 sec delay
        });
    }
}
