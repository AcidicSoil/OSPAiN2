// Initialize downloads page functionality
document.addEventListener('DOMContentLoaded', () => {
    detectSystem();
    setupCopyButtons();
    setupDownloadButtons();
    highlightRecommendedDownload();
});

// Detect user's operating system
function detectSystem() {
    const systemDisplay = document.getElementById('detected-system');
    let detectedOS = 'Unknown';
    
    if (navigator.platform.indexOf('Win') !== -1) {
        detectedOS = 'Windows';
    } else if (navigator.platform.indexOf('Mac') !== -1) {
        detectedOS = 'macOS';
    } else if (navigator.platform.indexOf('Linux') !== -1) {
        detectedOS = 'Linux';
    }
    
    systemDisplay.textContent = detectedOS;
    return detectedOS;
}

// Setup copy buttons for installation commands
function setupCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const command = button.previousElementSibling.querySelector('code').textContent;
            
            try {
                await navigator.clipboard.writeText(command);
                showCopyFeedback(button, true);
            } catch (err) {
                console.error('Failed to copy text:', err);
                showCopyFeedback(button, false);
            }
        });
    });
}

// Show feedback when copying
function showCopyFeedback(button, success) {
    const originalIcon = button.innerHTML;
    
    if (success) {
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.classList.add('success');
    } else {
        button.innerHTML = '<i class="fas fa-times"></i>';
        button.classList.add('error');
    }
    
    setTimeout(() => {
        button.innerHTML = originalIcon;
        button.classList.remove('success', 'error');
    }, 2000);
}

// Setup download buttons
function setupDownloadButtons() {
    const downloadButtons = document.querySelectorAll('.download-btn');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = button.closest('.download-card').dataset.platform;
            initiateDownload(platform);
        });
    });
}

// Initiate download for selected platform
function initiateDownload(platform) {
    const downloads = {
        macos: 'https://ollama.ai/downloads/Ollama-1.0.0.dmg',
        windows: 'https://ollama.ai/downloads/Ollama-1.0.0.exe',
        linux: 'https://ollama.ai/downloads/ollama-1.0.0.tar.gz'
    };
    
    const downloadUrl = downloads[platform];
    
    if (downloadUrl) {
        // Track download event
        trackDownload(platform);
        
        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = downloadUrl.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Highlight recommended download based on detected system
function highlightRecommendedDownload() {
    const detectedOS = detectSystem().toLowerCase();
    const downloadCards = document.querySelectorAll('.download-card');
    
    downloadCards.forEach(card => {
        if (card.dataset.platform === detectedOS) {
            card.classList.add('recommended');
            
            // Scroll card into view with offset
            setTimeout(() => {
                const offset = 100;
                const cardPosition = card.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({
                    top: cardPosition,
                    behavior: 'smooth'
                });
            }, 500);
        }
    });
}

// Track download events
function trackDownload(platform) {
    // Analytics tracking code would go here
    console.log(`Download initiated for platform: ${platform}`);
}

// Handle version selection if available
document.querySelectorAll('.version-select').forEach(select => {
    select.addEventListener('change', (e) => {
        const platform = e.target.closest('.download-card').dataset.platform;
        const version = e.target.value;
        updateDownloadButton(platform, version);
    });
});

// Update download button based on selected version
function updateDownloadButton(platform, version) {
    const card = document.querySelector(`[data-platform="${platform}"]`);
    const button = card.querySelector('.download-btn');
    const sizeDisplay = card.querySelector('.size');
    
    // Update button text and download link
    button.href = `https://ollama.ai/downloads/Ollama-${version}.${getFileExtension(platform)}`;
    
    // Update size display (would normally come from an API)
    const sizes = {
        macos: '125 MB',
        windows: '138 MB',
        linux: '112 MB'
    };
    sizeDisplay.textContent = sizes[platform];
}

// Get file extension based on platform
function getFileExtension(platform) {
    const extensions = {
        macos: 'dmg',
        windows: 'exe',
        linux: 'tar.gz'
    };
    return extensions[platform];
}

// Handle system requirements modal if needed
document.querySelectorAll('.system-requirements').forEach(req => {
    req.addEventListener('click', () => {
        // Implementation for showing system requirements modal
        console.log('Show system requirements modal');
    });
}); 