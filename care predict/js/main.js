document.addEventListener('DOMContentLoaded', () => {
    // Initialize Core Components
    const model = new HospitalModel();
    const dashboard = new Dashboard(model);
    const ui = new UI(model, dashboard);

    // Initial Dashboard Render
    dashboard.init();

    // Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active to clicked
            item.classList.add('active');

            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));
            // Show target section
            const tabId = item.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    console.log('Patient Satisfaction Predictor Initialized');
});
