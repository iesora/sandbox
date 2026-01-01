// LR consulting Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Back to Top Button
    const backToTopButton = document.getElementById('backToTop');
    
    // Show/hide back to top button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // Smooth scroll to top when back to top button is clicked
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just '#'
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone') || '',
                message: formData.get('message')
            };
            
            // Validate required fields
            if (!data.name || !data.email || !data.message) {
                alert('必須項目をすべて入力してください。');
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                alert('正しいメールアドレスを入力してください。');
                return;
            }
            
            // Store form data in sessionStorage for confirmation page
            sessionStorage.setItem('contactFormData', JSON.stringify(data));
            
            // Show confirmation (in a real application, this would redirect to a confirmation page)
            showConfirmation(data);
        });
    }
    
    // Show confirmation modal (simplified version)
    function showConfirmation(data) {
        const confirmed = confirm(
            `以下の内容でお問い合わせを送信してもよろしいですか？\n\n` +
            `お名前: ${data.name}\n` +
            `メールアドレス: ${data.email}\n` +
            `電話番号: ${data.phone || '(未入力)'}\n` +
            `お問い合わせ内容:\n${data.message}`
        );
        
        if (confirmed) {
            // In a real application, this would send the data to a server
            alert('お問い合わせを受け付けました。\n担当者より3営業日以内にご連絡させていただきます。\n\nありがとうございました。');
            contactForm.reset();
        }
    }
    
    // Animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.theme-card, .service-card, .service-item, .feature-bubble');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Mobile menu toggle (if needed in the future)
    const searchIcon = document.querySelector('.search-icon');
    const closeIcon = document.querySelector('.close-icon');
    
    if (searchIcon) {
        searchIcon.addEventListener('click', function() {
            // Placeholder for search functionality
            console.log('Search clicked');
        });
    }
    
    if (closeIcon) {
        closeIcon.addEventListener('click', function() {
            // Placeholder for close functionality
            console.log('Close clicked');
        });
    }
    
    // Add active class to current page in navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop().split('#')[0];
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.style.color = '#4A90E2';
            link.style.fontWeight = '600';
        }
    });
    
    // Form input focus effects
    const formInputs = document.querySelectorAll('.form-input, .form-textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
    
    // Header shadow on scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 10) {
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
        }
    });
    
    // Hover effects for buttons
    const buttons = document.querySelectorAll('.btn, .recruit-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
    
    // Mission Vision Value scroll image switching
    const mvvCards = document.querySelectorAll('.mvv-card');
    const mvvSideImages = document.querySelectorAll('.mvv-side-img');
    
    if (mvvCards.length > 0 && mvvSideImages.length > 0) {
        // Create intersection observer for MVV cards
        const mvvObserverOptions = {
            threshold: 0.3,
            rootMargin: '-20% 0px -20% 0px'
        };
        
        const mvvObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const imageType = entry.target.getAttribute('data-image');
                    
                    // Remove active class from all images
                    mvvSideImages.forEach(img => {
                        img.classList.remove('active');
                    });
                    
                    // Add active class to corresponding image
                    const targetImage = document.querySelector(`.mvv-side-img[data-for="${imageType}"]`);
                    if (targetImage) {
                        targetImage.classList.add('active');
                    }
                }
            });
        }, mvvObserverOptions);
        
        // Observe all MVV cards
        mvvCards.forEach(card => {
            mvvObserver.observe(card);
        });
    }
    
    console.log('LR consulting website loaded successfully!');
});