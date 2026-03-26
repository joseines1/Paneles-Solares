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

/* --- Formulario de contacto --- */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = form.querySelector('.form-submit');
        const originalBtnText = btn.innerHTML;
        btn.innerHTML = '⏳ Enviando...';
        btn.disabled = true;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            // Guardar en Supabase
            if (typeof supabaseClient !== 'undefined') {
                const { error } = await supabaseClient
                    .from('contact_messages')
                    .insert([
                        {
                            nombre: data.nombre,
                            empresa: data.empresa || null,
                            email: data.email,
                            telefono: data.telefono,
                            servicio: data.servicio,
                            factura: data.factura,
                            mensaje: data.mensaje,
                            status: 'Nuevo'
                        }
                    ]);
                
                if (error) throw error;
            } else {
                console.warn("Supabase no está inicializado. Fallback a LocalStorage.");
                // Fallback a LocalStorage por si acaso
                let quotes = JSON.parse(localStorage.getItem('solar_quotes')) || [];
                const newQuote = {
                    id: Date.now(),
                    ...data,
                    fecha: new Date().toISOString(),
                    status: 'Nuevo'
                };
                quotes.unshift(newQuote);
                localStorage.setItem('solar_quotes', JSON.stringify(quotes));
            }

            form.style.display = 'none';
            success.style.display = 'block';
            success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (error) {
            console.error('Error enviando formulario:', error);
            btn.innerHTML = '❌ Error al enviar. Reintentar';
            btn.disabled = false;
            setTimeout(() => {
                btn.innerHTML = originalBtnText;
            }, 3000);
        }
    });
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

/* --- Verificar que Supabase está cargado --- */
document.addEventListener('DOMContentLoaded', function() {
    // Pequeña verificación para asegurar que Supabase está disponible
    setTimeout(() => {
        if (typeof window.supabase === 'undefined') {
            console.warn('Supabase no está cargado. Algunas funciones pueden no funcionar.');
        } else {
            console.log('Supabase cargado correctamente.');
        }
    }, 1000);
});
