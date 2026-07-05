        // 1. Current Year for Copyright
        const currentYear = document.getElementById("current-year");
        if (currentYear) {
            currentYear.textContent = new Date().getFullYear();
        }

        // 2. Mobile Menu Toggle
        const menuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        menuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                menuBtn.setAttribute('aria-expanded', 'true');
            } else {
                mobileMenu.classList.add('hidden');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Close mobile menu on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                menuBtn.setAttribute('aria-expanded', 'false');
            });
        });

        // 3. Scroll Reveal Animation using Intersection Observer
        const revealOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };
        
        const revealObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    return;
                } else {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Run only once
                }
            });
        }, revealOptions);

        document.querySelectorAll('.reveal').forEach(el => {
            revealObserver.observe(el);
        });

        // 4. Number Counter Animation
        const counterOptions = {
            threshold: 0.5
        };
        
        const counterObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = entry.target.querySelectorAll('.counter');
                    const speed = 200; // lower is faster
                    
                    counters.forEach(counter => {
                        const updateCount = () => {
                            const target = +counter.getAttribute('data-target');
                            const count = +counter.innerText.replace(/,/g, '');
                            const inc = target / speed;
                            
                            if (count < target) {
                                counter.innerText = Math.ceil(count + inc).toLocaleString();
                                setTimeout(updateCount, 15);
                            } else {
                                counter.innerText = target.toLocaleString();
                                // Add '+' for specific counters if needed, handled in HTML structure
                            }
                        };
                        updateCount();
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, counterOptions);

        // Observe the stats section
        const statsSection = document.querySelector('#about .grid');
        if (statsSection) {
            counterObserver.observe(statsSection);
        }
