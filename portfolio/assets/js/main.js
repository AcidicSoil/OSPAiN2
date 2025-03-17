/* 
 * Portfolio Main JS
 * Animations and interactivity for the Ollama Ecosystem portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the page
    initializePortfolio();
});

// Main initialization function
function initializePortfolio() {
    // Initialize components
    setupMobileMenu();
    setupScrollAnimations();
    setupSmoothScrolling();
    setupHero3DModel();
    initializeFeatureCards();
}

// Mobile menu functionality
function setupMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navigation = document.querySelector('.navigation');
    
    if (!menuToggle || !navigation) return;
    
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navigation.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mobile-menu-toggle') && 
            !e.target.closest('.navigation') && 
            navigation.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navigation.classList.remove('active');
        }
    });
    
    // Close menu when pressing ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navigation.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navigation.classList.remove('active');
        }
    });
}

// Smooth scrolling for anchor links
function setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') return;
            
            e.preventDefault();
            
            const targetElement = document.querySelector(href);
            if (!targetElement) return;
            
            // Get header height for offset
            const header = document.querySelector('header');
            const headerHeight = header ? header.offsetHeight : 0;
            
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            const navigation = document.querySelector('.navigation');
            const menuToggle = document.querySelector('.mobile-menu-toggle');
            
            if (navigation && navigation.classList.contains('active')) {
                navigation.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');
            }
        });
    });
}

// Scroll animations using Intersection Observer
function setupScrollAnimations() {
    // Animate sections as they enter viewport
    const sections = document.querySelectorAll('section');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Animate other elements with the animate-on-scroll class
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const elementObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    animatedElements.forEach(element => {
        elementObserver.observe(element);
    });
    
    // Header scroll effect
    const header = document.querySelector('header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Animate hero section on load
    const hero = document.querySelector('.hero');
    if (hero) {
        setTimeout(() => {
            hero.classList.add('animate');
        }, 100);
    }
}

// Setup 3D Model in hero section
function setupHero3DModel() {
    const heroModel = document.querySelector('.hero-3d-model');
    if (!heroModel) return;
    
    // Create and position connection lines between nodes
    const centerNode = document.querySelector('.center-node');
    const satelliteNodes = document.querySelectorAll('.satellite-node');
    
    if (!centerNode || !satelliteNodes.length) return;
    
    const centerRect = centerNode.getBoundingClientRect();
    const centerX = centerRect.width / 2;
    const centerY = centerRect.height / 2;
    
    satelliteNodes.forEach(node => {
        const nodeRect = node.getBoundingClientRect();
        const nodeX = nodeRect.left - centerRect.left + nodeRect.width / 2;
        const nodeY = nodeRect.top - centerRect.top + nodeRect.height / 2;
        
        // Calculate line properties
        const length = Math.sqrt(Math.pow(nodeX - centerX, 2) + Math.pow(nodeY - centerY, 2));
        const angle = Math.atan2(nodeY - centerY, nodeX - centerX) * 180 / Math.PI;
        
        // Create line element
        const line = document.createElement('div');
        line.classList.add('connection-line');
        line.style.width = `${length}px`;
        line.style.left = `${centerX}px`;
        line.style.top = `${centerY}px`;
        line.style.transform = `rotate(${angle}deg)`;
        
        // Add line to container
        centerNode.parentNode.appendChild(line);
    });
}

// Initialize feature cards with staggered animation
function initializeFeatureCards() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    if (!featureCards.length) return;
    
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Apply staggered delay based on index
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                
                // Unobserve after animation
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    featureCards.forEach(card => {
        cardObserver.observe(card);
    });
}

// Draw connections between nodes if SVG/Canvas exists
function drawConnections() {
    const canvas = document.querySelector('.connections-canvas');
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const nodes = document.querySelectorAll('.node');
    const nodePositions = [];
    
    // Get positions of nodes
    nodes.forEach(node => {
        const rect = node.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        nodePositions.push({
            x: rect.left + rect.width/2 - canvasRect.left,
            y: rect.top + rect.height/2 - canvasRect.top
        });
    });
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < nodePositions.length; i++) {
        for (let j = i+1; j < nodePositions.length; j++) {
            ctx.beginPath();
            ctx.moveTo(nodePositions[i].x, nodePositions[i].y);
            ctx.lineTo(nodePositions[j].x, nodePositions[j].y);
            ctx.stroke();
        }
    }
}

// Resize event handler
window.addEventListener('resize', () => {
    drawConnections();
});

// Handle scroll animations
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        const heroHeight = hero.offsetHeight;
        const heroOffset = hero.offsetTop;
        const scrollProgress = Math.max(0, Math.min(1, (scrollTop - heroOffset) / heroHeight));
        
        hero.querySelector('.hero-content').style.transform = `translateY(${scrollProgress * 50}px)`;
        hero.querySelector('.hero-background').style.transform = `translateY(${scrollProgress * -30}px)`;
    }
});

// DOM Elements
const header = document.querySelector('header');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navigation = document.querySelector('.navigation');
const scrollIndicator = document.querySelector('.scroll-indicator');
const featureCards = document.querySelectorAll('.feature-card');
const heroBackground = document.querySelector('.hero-background');

// Header Scroll Effect
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    // Add/remove header shadow based on scroll position
    if (currentScrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Hide/show header based on scroll direction
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
        header.classList.add('header-hidden');
    } else {
        header.classList.remove('header-hidden');
    }
    
    lastScrollY = currentScrollY;
    
    // Hide scroll indicator when user starts scrolling
    if (currentScrollY > 100) {
        scrollIndicator.classList.add('hidden');
    } else {
        scrollIndicator.classList.remove('hidden');
    }
});

// Intersection Observer for scroll animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe feature cards for scroll animations
featureCards.forEach(card => {
    card.classList.add('animate-on-scroll');
    intersectionObserver.observe(card);
});

// Dynamic Hero Background
function updateHeroBackground() {
    const mouseX = event.clientX / window.innerWidth;
    const mouseY = event.clientY / window.innerHeight;
    
    heroBackground.style.background = `
        radial-gradient(
            circle at ${mouseX * 100}% ${mouseY * 100}%,
            rgba(var(--primary-rgb), 0.15),
            rgba(var(--primary-rgb), 0.05) 30%,
            rgba(var(--background-rgb), 0.1) 60%
        )
    `;
}

// Add mousemove event listener for hero background effect
if (heroBackground) {
    document.addEventListener('mousemove', updateHeroBackground);
}

// 3D Model Animation
const nodeContainer = document.querySelector('.node-container');
if (nodeContainer) {
    let rotationX = 0;
    let rotationY = 0;
    let animationFrameId;

    function animate() {
        rotationX += 0.2;
        rotationY += 0.1;
        
        nodeContainer.style.transform = `
            rotateX(${Math.sin(rotationX * Math.PI / 180) * 15}deg)
            rotateY(${Math.cos(rotationY * Math.PI / 180) * 15}deg)
        `;
        
        animationFrameId = requestAnimationFrame(animate);
    }

    // Start animation
    animate();

    // Pause animation when not in viewport
    const modelObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate();
            } else {
                cancelAnimationFrame(animationFrameId);
            }
        });
    });

    modelObserver.observe(nodeContainer);
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            mobileMenuToggle.classList.remove('active');
            navigation.classList.remove('active');
        }
    });
});

// Initialize any third-party libraries or components
document.addEventListener('DOMContentLoaded', () => {
    // Add any initialization code for third-party libraries here
}); 