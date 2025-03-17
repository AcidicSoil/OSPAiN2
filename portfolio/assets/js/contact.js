// Initialize contact page functionality
document.addEventListener('DOMContentLoaded', () => {
    setupContactForm();
    setupFAQAccordion();
    setupLocationMap();
});

// Contact Form Setup and Validation
function setupContactForm() {
    const form = document.getElementById('contactForm');
    const inputs = form.querySelectorAll('input, textarea, select');
    
    // Add validation styles on blur
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateInput(input);
        });
        
        // Remove validation styles on focus
        input.addEventListener('focus', () => {
            input.classList.remove('error', 'success');
            const errorMessage = input.parentElement.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    });
    
    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate all inputs
        let isValid = true;
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });
        
        if (isValid) {
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            try {
                // Disable button and show loading state
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                
                // Collect form data
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Simulate API call (replace with actual API endpoint)
                await submitContactForm(data);
                
                // Show success message
                showFormMessage('success', 'Thank you! Your message has been sent successfully.');
                form.reset();
                
            } catch (error) {
                // Show error message
                showFormMessage('error', 'Sorry, there was an error sending your message. Please try again.');
                console.error('Form submission error:', error);
                
            } finally {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        }
    });
}

// Validate individual input
function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error message
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Validation rules
    if (input.required && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    } else if (input.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    } else if (input.id === 'message' && value.length < 10) {
        isValid = false;
        errorMessage = 'Message must be at least 10 characters long';
    }
    
    // Add appropriate classes and error message
    if (isValid) {
        input.classList.remove('error');
        input.classList.add('success');
    } else {
        input.classList.remove('success');
        input.classList.add('error');
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = errorMessage;
        input.parentElement.appendChild(errorDiv);
    }
    
    return isValid;
}

// Show form message (success/error)
function showFormMessage(type, message) {
    const form = document.getElementById('contactForm');
    const existingMessage = form.querySelector('.form-message');
    
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    form.insertBefore(messageDiv, form.firstChild);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Simulate form submission (replace with actual API call)
async function submitContactForm(data) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate API call
    // Replace with actual API endpoint
    // const response = await fetch('/api/contact', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(data)
    // });
    
    // if (!response.ok) {
    //     throw new Error('Failed to submit form');
    // }
    
    return true;
}

// FAQ Accordion Setup
function setupFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const toggleBtn = item.querySelector('.toggle-btn');
        
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = null;
                    otherItem.querySelector('.toggle-btn i').style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
            toggleBtn.querySelector('i').style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            
            if (!isOpen) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = null;
            }
        });
    });
}

// Office Locations Map Setup
function setupLocationMap() {
    const locationCards = document.querySelectorAll('.location-card');
    
    locationCards.forEach(card => {
        card.addEventListener('click', () => {
            const location = card.querySelector('h3').textContent;
            const address = card.querySelector('p').textContent.replace(/<br>/g, ' ');
            
            // Open in Google Maps
            window.open(`https://www.google.com/maps/search/${encodeURIComponent(address)}`, '_blank');
        });
        
        // Add hover effect
        card.addEventListener('mouseenter', () => {
            card.querySelector('.location-icon').classList.add('bounce');
        });
        
        card.addEventListener('mouseleave', () => {
            card.querySelector('.location-icon').classList.remove('bounce');
        });
    });
}

// Handle social media links
document.querySelectorAll('.footer-social a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = link.querySelector('i').className.split('-')[2];
        const urls = {
            github: 'https://github.com/ollama',
            twitter: 'https://twitter.com/ollamaai',
            linkedin: 'https://linkedin.com/company/ollama',
            discord: 'https://discord.gg/ollama'
        };
        window.open(urls[platform], '_blank');
    });
}); 