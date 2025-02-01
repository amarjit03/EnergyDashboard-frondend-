class DashboardManager {
    constructor() {
        this.charts = {};
        this.currentFloor = 1;
        this.data = null;
        this.API_URL = 'http://127.0.0.1:5100/current';
        this.updateInterval = 30000; // Update every 30 seconds
        this.initializeBackgroundEffects();
        this.initializeEventListeners();
        this.startDataUpdates();
    }

    startDataUpdates() {
        this.fetchData(); // Initial fetch
        // Set up periodic updates
        setInterval(() => this.fetchData(), this.updateInterval);
    }

    async fetchData() {
        try {
            const startTime = performance.now();
            const response = await fetch(this.API_URL, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.data = await response.json();
            const endTime = performance.now();
            console.log(`Data fetch took ${(endTime - startTime).toFixed(2)}ms`);

            // Animate the refresh icon
            const refreshIcon = document.getElementById('refreshData');
            gsap.to(refreshIcon, {
                rotation: 360,
                duration: 1,
                ease: "power1.out",
                onComplete: () => {
                    refreshIcon.style.transform = 'rotate(0deg)';
                }
            });

            this.updateDashboard();
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Show error notification
            this.showNotification('Error fetching data. Retrying...', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`;
        notification.textContent = message;
        document.body.appendChild(notification);

        gsap.fromTo(notification,
            { y: -50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3 }
        );

        setTimeout(() => {
            gsap.to(notification, {
                y: -50,
                opacity: 0,
                duration: 0.3,
                onComplete: () => notification.remove()
            });
        }, 3000);
    }

    updateSummaryStats() {
        if (!this.data) return;

        // Update total energy consumption
        const totalEnergy = this.data.summary_data.total_energy_consumption;
        const totalEnergyElement = document.getElementById('totalEnergy');
        gsap.to(totalEnergyElement, {
            innerText: totalEnergy.toFixed(2),
            duration: 1,
            snap: { innerText: 0.01 }
        });

        // Update total water usage
        const totalWater = this.data.summary_data.total_water_usage;
        const totalWaterElement = document.getElementById('totalWater');
        gsap.to(totalWaterElement, {
            innerText: totalWater.toFixed(2),
            duration: 1,
            snap: { innerText: 0.01 }
        });

        // Update occupancy
        document.getElementById('totalOccupancy').textContent = 
            this.data.summary_data.total_occupancy;

        // Update weather info
        document.getElementById('weatherTemp').textContent = 
            this.data.detailed_data.weather_temperature;
        
        const weatherCondition = document.getElementById('weatherCondition');
        weatherCondition.textContent = this.data.detailed_data.weather_condition;
        
        // Add weather icon based on condition
        this.updateWeatherIcon(this.data.detailed_data.weather_condition);
    }

    updateWeatherIcon(condition) {
        const iconContainer = document.querySelector('.weather-icon');
        if (!iconContainer) return;

        const iconMap = {
            'Clear': 'sun',
            'Clouds': 'cloud',
            'Rain': 'cloud-rain',
            'Snow': 'cloud-snow',
            'Thunderstorm': 'cloud-lightning'
        };

        const icon = iconMap[condition] || 'sun';
        iconContainer.innerHTML = this.getWeatherSVG(icon);
    }

    // Add new method to format chart labels
    formatChartLabel(label) {
        return label
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Update the appliance power chart to show more detailed information
    updateAppliancePowerChart() {
        const appliances = [
            'air_conditioner_power',
            'desktop_computer_power',
            'dishwasher_power',
            'electric_oven_power',
            'led_lights_power',
            'microwave_power',
            'refrigerator_power',
            'tv_led_55_power',
            'washing_machine_power',
            'water_heater_power'
        ];

        const datasets = appliances.map((appliance, index) => {
            const colors = [
                '#4CAF50', '#2196F3', '#FFC107', '#9C27B0',
                '#F44336', '#00BCD4', '#FF9800', '#795548',
                '#607D8B', '#E91E63'
            ];

            return {
                label: this.formatChartLabel(appliance),
                data: [1, 2, 3].map(floor => 
                    this.data.detailed_data[`floor_${floor}_${appliance}`] || 0),
                borderColor: colors[index],
                backgroundColor: colors[index] + '40',
                tension: 0.4,
                fill: true
            };
        });

        const data = {
            labels: ['Floor 1', 'Floor 2', 'Floor 3'],
            datasets
        };

        const options = {
            responsive: true,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(2)} kW`;
                        }
                    }
                }
            }
        };

        this.createOrUpdateChart('appliancePowerChart', 'line', data, options);
    }

    // Add method to handle real-time updates
    handleRealTimeUpdates() {
        const ws = new WebSocket('ws://127.0.0.1:5100/ws');
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.data = data;
            this.updateDashboard();
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.showNotification('Real-time updates unavailable', 'error');
        };
    }

    initializeBackgroundEffects() {
        this.createGrid();
        this.createParticles();
        this.createPowerLines();
        this.animateBackground();
    }

    createGrid() {
        const grid = document.getElementById('grid');
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                const line = document.createElement('div');
                line.className = 'grid-line';
                line.style.left = `${(j * 5)}%`;
                line.style.top = `${(i * 5)}%`;
                line.style.width = '1px';
                line.style.height = '100%';
                grid.appendChild(line);
            }
        }
    }

    createParticles() {
        const container = document.getElementById('particles');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'energy-particle';
            particle.style.width = `${Math.random() * 10 + 5}px`;
            particle.style.height = particle.style.width;
            this.resetParticle(particle);
            container.appendChild(particle);
        }
    }

    resetParticle(particle) {
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        gsap.to(particle, {
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200,
            duration: Math.random() * 3 + 2,
            ease: "none",
            repeat: -1,
            yoyo: true
        });
    }

    createPowerLines() {
        const container = document.getElementById('powerLines');
        for (let i = 0; i < 10; i++) {
            const line = document.createElement('div');
            line.className = 'power-line';
            line.style.width = `${Math.random() * 200 + 100}px`;
            line.style.height = '2px';
            line.style.left = `${Math.random() * 100}%`;
            line.style.top = `${Math.random() * 100}%`;
            container.appendChild(line);
        }
    }

    animateBackground() {
        gsap.to('.power-line', {
            scaleX: 1.5,
            opacity: 0.1,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            stagger: 0.1
        });
    }

    initializeEventListeners() {
        // Refresh button
        document.getElementById('refreshData').addEventListener('click', () => this.fetchData());

        // Floor tabs
        document.querySelectorAll('.floor-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.currentFloor = parseInt(e.target.dataset.floor);
                document.querySelectorAll('.floor-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.updateFloorDetails();
            });
        });
    }

    createOrUpdateChart(canvasId, type, data, options) {
        if (this.charts[canvasId]) {
            this.charts[canvasId].data = data;
            this.charts[canvasId].options = options;
            this.charts[canvasId].update();
        } else {
            const ctx = document.getElementById(canvasId).getContext('2d');
            this.charts[canvasId] = new Chart(ctx, {
                type: type,
                data: data,
                options: options
            });
        }
    }

    updateDashboard() {
        this.updateSummaryStats();
        this.updateAppliancePowerChart();
        this.updateFloorDetails();
        // Update last update timestamp
        document.getElementById('lastUpdate').textContent = 
            new Date().toLocaleTimeString();
    }
}

// Initialize dashboard with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.dashboard = new DashboardManager();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        // Show error notification in the UI
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg';
        errorDiv.textContent = 'Error initializing dashboard. Please refresh the page.';
        document.body.appendChild(errorDiv);
    }
});