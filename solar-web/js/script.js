// =============================
//  SOLAR WEB — script.js
// =============================

/* --- Navbar scroll --- */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

/* --- Hamburger menu --- */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
    hamburger.setAttribute('aria-controls', 'navLinks');
    hamburger.setAttribute('aria-expanded', 'false');

    hamburger.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        document.body.classList.toggle('nav-open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        if (!isOpen) hamburger.focus();
    });

    // Cerrar al hacer click en enlace
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
            document.body.classList.remove('nav-open');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.focus();
        });
    });

    // Cerrar al hacer click en el backdrop (fuera del menú)
    document.addEventListener('click', (e) => {
        if (
            navLinks.classList.contains('open') &&
            !navLinks.contains(e.target) &&
            !hamburger.contains(e.target)
        ) {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
            document.body.classList.remove('nav-open');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.focus();
        }
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('open')) {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
            document.body.classList.remove('nav-open');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.focus();
        }
    });
}

/* --- Marcar enlace activo --- */
(function setActiveNav() {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
        if (a.getAttribute('href') === page) {
            a.classList.add('active');
        }
    });
})();

/* --- Scroll reveal --- */
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) {
            el.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

/* --- Partículas hero --- */
function createParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    const count = 25;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        p.style.left = Math.random() * 100 + '%';
        p.style.bottom = '-10px';
        p.style.width = (Math.random() * 4 + 2) + 'px';
        p.style.height = p.style.width;
        p.style.animationDuration = (Math.random() * 15 + 10) + 's';
        p.style.animationDelay = (Math.random() * 10) + 's';
        container.appendChild(p);
    }
}

createParticles();

/* --- Counter animado (hero stats) --- */
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-count');
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const update = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current) + suffix;
                requestAnimationFrame(update);
            } else {
                counter.textContent = target + suffix;
            }
        };

        // Activar cuando sea visible
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                update();
                observer.disconnect();
            }
        }, { threshold: 0.5 });
        observer.observe(counter);
    });
}

animateCounters();

/* --- Filtro proyectos --- */
function initProjectFilter() {
    const btns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');

    if (!btns.length) return;

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            cards.forEach(card => {
                const cat = card.getAttribute('data-category');
                if (filter === 'all' || cat === filter) {
                    card.style.display = '';
                    card.style.animation = 'fadeInUp 0.4s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

initProjectFilter();

/* --- Formulario de contacto (manejado por formsubmit.co) --- */
function initContactForm() {
    // El formulario usa action="https://formsubmit.co/..." para enviar por email.
    // No se requiere JS adicional. Solo mostramos el mensaje de éxito si hay ?success=1
    const success = document.getElementById('formSuccess');
    if (success && new URLSearchParams(location.search).get('success') === '1') {
        const form = document.getElementById('contactForm');
        if (form) form.style.display = 'none';
        success.style.display = 'block';
    }
}

initContactForm();

/* --- FAQ accordion --- */
function initFAQ() {
    const faqs = document.querySelectorAll('.faq-q');
    if (!faqs.length) return;

    faqs.forEach(q => {
        q.addEventListener('click', () => {
            const item = q.closest('.faq-item');
            const isOpen = item.classList.contains('open');

            // Cerrar otros abiertos
            document.querySelectorAll('.faq-item').forEach(i => {
                if (i !== item) i.classList.remove('open');
            });

            // Toggle actual
            item.classList.toggle('open');
        });

        // Soporte teclado (Enter/Espacio)
        q.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                q.click();
            }
        });
    });
}

initFAQ();

/* --- Tooltip specs en productos --- */
document.querySelectorAll('.spec-item').forEach(item => {
    item.title = item.querySelector('.spec-key')?.textContent || '';
});

/* --- Smooth scroll interno --- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

/* --- Lazy load images --- */
if ('IntersectionObserver' in window) {
    const lazyImgs = document.querySelectorAll('img[data-src]');
    const imgObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imgObserver.unobserve(img);
            }
        });
    });
    lazyImgs.forEach(img => imgObserver.observe(img));
}

/* --- Año dinámico en footer --- */
const yearEl = document.getElementById('currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', function() {
    // Cargar promociones dinámicas
    loadPromotions();
});

function loadPromotions() {
    const promosGrid = document.getElementById('promosGrid') || document.getElementById('homePromosGrid');
    if (!promosGrid) return;

    let promos = JSON.parse(localStorage.getItem('solar_promotions')) || [];

    if (promos.length === 0) {
        // Fallback promos just in case
        promos = [
            {
                id: 1,
                title: "Kit Residencial Básico",
                description: "Perfecto para hogares pequeños. Reduce hasta un 60% tu recibo bimestral.",
                originalPrice: "$65,000 MXN",
                promoPrice: "$54,999 MXN",
                badge: "¡Más Vendido!",
                badgeColor: "#ef4444",
                icon: "🏷️",
                features: "4 Paneles de 550W, Inversor de cadena, Instalación estándar incluida, Trámite ante CFE gratis"
            },
            {
                id: 2,
                title: "Kit Residencial Plus",
                description: "Ideal para hogares con alto consumo o aires acondicionados.",
                originalPrice: "$110,000 MXN",
                promoPrice: "$92,500 MXN",
                badge: "Premium",
                badgeColor: "#10b981",
                icon: "🔋",
                features: "8 Paneles de 550W, Microinversores, Monitoreo por panel individual, Mantenimiento gratis 1er año"
            },
            {
                id: 3,
                title: "Meses Sin Intereses",
                description: "Financia tu sistema solar pagando cómodas mensualidades con tarjetas participantes.",
                originalPrice: "",
                promoPrice: "Hasta 12 MSI",
                badge: "Facilidades",
                badgeColor: "#3b82f6",
                icon: "💳",
                features: "Aplica en todos los paquetes, Aprobación inmediata, Sin enganche requerido, Tarjetas Visa, Mastercard y AMEX"
            }
        ];
        localStorage.setItem('solar_promotions', JSON.stringify(promos));
    }

    promosGrid.innerHTML = '';

    promos.forEach(promo => {
        const featuresList = promo.features.split(',').map(f => `<li>${f.trim()}</li>`).join('');
        const origPriceHtml = promo.originalPrice ? `<span style="text-decoration: line-through; color: var(--gray-400); font-size: 0.9rem;">${promo.originalPrice}</span>` : '';
        
        const card = document.createElement('div');
        card.className = 'service-card reveal';
        card.style.border = `2px solid ${promo.badgeColor}`;
        card.innerHTML = `
            <div class="service-img-wrapper" style="height: 180px; display: flex; align-items: center; justify-content: center; background: ${promo.badgeColor}15;">
                <div style="font-size: 4rem;">${promo.icon}</div>
                <span class="service-tag-badge" style="background: ${promo.badgeColor};">${promo.badge}</span>
            </div>
            <div class="service-body">
                <h3>${promo.title}</h3>
                <div style="margin: 1rem 0;">
                    ${origPriceHtml}
                    <span style="color: var(--primary); font-size: 1.8rem; font-weight: 700; display: block;">${promo.promoPrice}</span>
                </div>
                <p>${promo.description}</p>
                <ul class="service-features">
                    ${featuresList}
                </ul>
                <a href="contacto.html?promo=${promo.id}" class="btn-primary" style="width: 100%; text-align: center; display: block; margin-top: 1rem; box-sizing: border-box; background-color: ${promo.badgeColor}; border-color: ${promo.badgeColor};">Aprovechar Oferta</a>
            </div>
        `;
        promosGrid.appendChild(card);
    });
}
