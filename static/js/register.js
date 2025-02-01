// Background animation functions
class BackgroundEffects {
    static createGrid() {
        const grid = document.getElementById('grid');
        const gridSize = 50;
        grid.innerHTML = ''; // Clear existing grid
        
        const createLine = (isVertical) => {
            const line = document.createElement('div');
            line.className = 'grid-line';
            if (isVertical) {
                line.style.width = '1px';
                line.style.height = '100%';
            } else {
                line.style.height = '1px';
                line.style.width = '100%';
            }
            return line;
        };
        
        // Create vertical lines
        for(let i = 0; i < window.innerWidth; i += gridSize) {
            const line = createLine(true);
            line.style.left = `${i}px`;
            grid.appendChild(line);
        }
        
        // Create horizontal lines
        for(let i = 0; i < window.innerHeight; i += gridSize) {
            const line = createLine(false);
            line.style.top = `${i}px`;
            grid.appendChild(line);
        }
    }

    static createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 15;
        
        for(let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'energy-particle pulse';
            const size = Math.random() * 20 + 10;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particlesContainer.appendChild(particle);
        }
    }

    static createPowerLines() {
        const linesContainer = document.getElementById('powerLines');
        const lineCount = 8;
        
        for(let i = 0; i < lineCount; i++) {
            const line = document.createElement('div');
            line.className = 'power-line';
            const top = Math.random() * 100;
            const width = Math.random() * 200 + 100;
            const height = Math.random() * 2 + 1;
            
            line.style.top = `${top}%`;
            line.style.width = `${width}px`;
            line.style.height = `${height}px`;
            
            gsap.to(line, {
                x: window.innerWidth + 100,
                duration: Math.random() * 3 + 2,
                repeat: -1,
                ease: "none",
                delay: Math.random() * 2
            });
            
            linesContainer.appendChild(line);
        }
    }
}

// Form handling class
class RegistrationForm {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.inputs = document.querySelectorAll('.energy-input');
        this.initializeFormHandling();
        this.addPasswordToggles();
        this.setupInputAnimations();
    }

    initializeFormHandling() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    setupInputAnimations() {
        this.inputs.forEach(input => {
            input.addEventListener('focus', () => {
                gsap.to(input, {
                    scale: 1.02,
                    duration: 0.2
                });
            });

            input.addEventListener('blur', () => {
                gsap.to(input, {
                    scale: 1,
                    duration: 0.2
                });
                this.validateInput(input);
            });
        });
    }

    validateInput(input) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch(input.id) {
            case 'fullName':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters long';
                }
                break;

            case 'email':
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;

            case 'password':
                const passwordChecks = {
                    length: value.length >= 8,
                    uppercase: /[A-Z]/.test(value),
                    lowercase: /[a-z]/.test(value),
                    number: /[0-9]/.test(value)
                };

                if (!Object.values(passwordChecks).every(check => check)) {
                    isValid = false;
                    errorMessage = 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers';
                }
                break;

            case 'confirmPassword':
                const password = document.getElementById('password').value;
                if (value !== password) {
                    isValid = false;
                    errorMessage = 'Passwords do not match';
                }
                break;
        }

        this.toggleError(input, errorMessage, isValid);
        return isValid;
    }

    toggleError(input, message, isValid) {
        const container = input.parentElement.parentElement;
        let errorDiv = container.querySelector('.error-message');

        if (!isValid) {
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'error-message text-red-400 text-sm mt-1';
                container.appendChild(errorDiv);
            }
            errorDiv.textContent = message;
            input.classList.add('border-red-400');
            
            gsap.from(errorDiv, {
                opacity: 0,
                y: -10,
                duration: 0.3
            });
        } else {
            if (errorDiv) {
                errorDiv.remove();
            }
            input.classList.remove('border-red-400');
        }
    }

    addPasswordToggles() {
        ['password', 'confirmPassword'].forEach(id => {
            const input = document.getElementById(id);
            const toggleButton = document.createElement('button');
            toggleButton.type = 'button';
            toggleButton.className = 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white';
            toggleButton.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path class="eye-open" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path class="eye-open" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    <path class="eye-closed hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
            `;

            const inputContainer = input.parentElement;
            inputContainer.appendChild(toggleButton);

            toggleButton.addEventListener('click', () => {
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                
                const eyeOpen = toggleButton.querySelector('.eye-open');
                const eyeClosed = toggleButton.querySelector('.eye-closed');
                eyeOpen.classList.toggle('hidden');
                eyeClosed.classList.toggle('hidden');
            });
        });
    }

    setLoadingState(isLoading) {
        const button = this.form.querySelector('button[type="submit"]');
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = `
                <svg class="animate-spin h-5 w-5 mr-3 inline" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
            `;
        } else {
            button.disabled = false;
            button.textContent = 'Create Account';
        }
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform translate-y-[-100%] z-50';
        successDiv.textContent = message;
        document.body.appendChild(successDiv);

        gsap.to(successDiv, {
            y: 0,
            duration: 0.5,
            ease: 'back.out'
        });

        setTimeout(() => {
            gsap.to(successDiv, {
                y: -100,
                opacity: 0,
                duration: 0.5,
                onComplete: () => successDiv.remove()
            });
        }, 3000);
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all inputs
        let isValid = true;
        this.inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) return;

        // Check terms and AI consent
        const termsChecked = document.getElementById('terms').checked;
        const aiConsentChecked = document.getElementById('aiConsent').checked;

        if (!termsChecked || !aiConsentChecked) {
            alert('Please accept the terms and AI consent to continue');
            return;
        }

        this.setLoadingState(true);

        try {
            // Collect form data
            const formData = {
                fullName: document.getElementById('fullName').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value,
                aiConsent: aiConsentChecked
            };

            // Simulate API call - replace with actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.showSuccessMessage('Account created successfully!');
            
            // Redirect to dashboard after success
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
            
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }
}

// Initialize everything when the page loads
class App {
    static init() {
        // Initialize background effects
        BackgroundEffects.createGrid();
        BackgroundEffects.createParticles();
        BackgroundEffects.createPowerLines();

        // Initialize form handling
        new RegistrationForm();

        // Animate form entrance
        gsap.from('.register-card', {
            y: 30,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });

        // Handle window resize for background grid
        window.addEventListener('resize', () => {
            BackgroundEffects.createGrid();
        });
    }
}

// Start everything when the page loads
window.addEventListener('load', () => App.init());