// Documentation Search
const searchInput = document.querySelector('.docs-search input');
const docsNavLinks = document.querySelectorAll('.docs-navigation a');

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    docsNavLinks.forEach(link => {
        const text = link.textContent.toLowerCase();
        const listItem = link.parentElement;
        
        if (text.includes(searchTerm)) {
            listItem.style.display = 'block';
        } else {
            listItem.style.display = 'none';
        }
    });
});

// Table of Contents Generation
const tocNav = document.querySelector('.docs-toc nav');
const headings = document.querySelectorAll('.docs-content h1, .docs-content h2, .docs-content h3');
const tocLinks = [];

function generateTOC() {
    const toc = document.createElement('ul');
    let currentList = toc;
    let previousLevel = 1;
    
    headings.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1));
        const text = heading.textContent;
        const slug = heading.id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        if (!heading.id) {
            heading.id = slug;
        }
        
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${slug}`;
        link.textContent = text;
        listItem.appendChild(link);
        
        if (level > previousLevel) {
            const newList = document.createElement('ul');
            currentList.lastChild.appendChild(newList);
            currentList = newList;
        } else if (level < previousLevel) {
            for (let i = 0; i < previousLevel - level; i++) {
                currentList = currentList.parentElement.parentElement;
            }
        }
        
        currentList.appendChild(listItem);
        previousLevel = level;
        tocLinks.push(link);
    });
    
    tocNav.innerHTML = '';
    tocNav.appendChild(toc);
}

generateTOC();

// Active section highlighting
function updateActiveSection() {
    const scrollPosition = window.scrollY;
    
    headings.forEach((heading, index) => {
        const nextHeading = headings[index + 1];
        const isLastHeading = index === headings.length - 1;
        
        const headingTop = heading.offsetTop - 100;
        const headingBottom = isLastHeading ? 
            document.documentElement.scrollHeight : 
            nextHeading.offsetTop - 100;
        
        if (scrollPosition >= headingTop && scrollPosition < headingBottom) {
            tocLinks.forEach(link => link.classList.remove('active'));
            const correspondingLink = tocLinks.find(link => link.getAttribute('href') === `#${heading.id}`);
            if (correspondingLink) {
                correspondingLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', updateActiveSection);
updateActiveSection();

// Code Copy Buttons
const copyButtons = document.querySelectorAll('.copy-button');

copyButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-clipboard-target');
        const codeElement = document.querySelector(targetId);
        const code = codeElement.textContent;
        
        navigator.clipboard.writeText(code).then(() => {
            button.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy code:', err);
            button.innerHTML = '<i class="fas fa-times"></i>';
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        });
    });
});

// Mobile sidebar toggle
const mobileSidebarToggle = document.createElement('button');
mobileSidebarToggle.className = 'mobile-sidebar-toggle';
mobileSidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
document.querySelector('.docs-container').prepend(mobileSidebarToggle);

mobileSidebarToggle.addEventListener('click', () => {
    document.querySelector('.docs-sidebar').classList.toggle('active');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.docs-sidebar');
    const toggle = document.querySelector('.mobile-sidebar-toggle');
    
    if (sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        !toggle.contains(e.target)) {
        sidebar.classList.remove('active');
    }
});

// Smooth scroll for documentation links
document.querySelectorAll('.docs-navigation a, .docs-toc a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Update URL without scrolling
            history.pushState(null, null, targetId);
            
            // Close mobile sidebar if open
            document.querySelector('.docs-sidebar').classList.remove('active');
        }
    });
});

// Handle initial hash in URL
if (window.location.hash) {
    const targetElement = document.querySelector(window.location.hash);
    if (targetElement) {
        setTimeout(() => {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }, 100);
    }
}

// Initialize any third-party libraries
document.addEventListener('DOMContentLoaded', () => {
    // Add initialization code for third-party libraries here
}); 