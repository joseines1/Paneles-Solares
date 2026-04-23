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
    const contactForm = document.getElementById('contactForm');
    const successMsg = document.getElementById('formSuccess');

    // Mostrar éxito si viene de redirección formsubmit
    if (successMsg && new URLSearchParams(location.search).get('success') === '1') {
        if (contactForm) contactForm.style.display = 'none';
        successMsg.style.display = 'block';
    }

    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const newLead = {
            nombre: formData.get('name') || formData.get('nombre'),
            email: formData.get('email'),
            telefono: formData.get('phone') || formData.get('telefono'),
            empresa: formData.get('company') || formData.get('empresa') || 'Particular',
            servicio: formData.get('service') || formData.get('servicio') || 'Consulta General',
            mensaje: formData.get('message') || formData.get('mensaje'),
            status: 'Nuevo',
            crmNote: 'Registrado vía sitio web',
            created_at: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(newLead)
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'No se pudo enviar tu solicitud');
            }

            if (contactForm) contactForm.style.display = 'none';
            if (successMsg) successMsg.style.display = 'block';
        } catch (err) {
            console.error('❌ Error guardando lead:', err);
            alert('No se pudo enviar tu solicitud. Intenta de nuevo en unos minutos.');
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

// Imágenes de respaldo para promociones sin kit vinculado
const DEFAULT_PROMO_IMAGES = [
    'img/solar_res_1.png',
    'img/solar_com_1.png',
    'img/solar_res_2.png',
    'img/solar_inst_1.png',
    'img/panel_residencial.png',
    'img/panel_comercial.png'
];

// Helper: obtener imagen de un kit (con fallback)
function getKitImage(kit) {
    if (kit.image && kit.image.trim() !== '') return kit.image;
    return Number(kit.capacity) > 5 ? 'img/panel_comercial.png' : 'img/panel_residencial.png';
}

// Normalizar kit_ids desde Supabase (puede llegar como "{1,2}" o [1,2])
function normalizeKitIds(raw) {
    if (!raw) return [];
    if (typeof raw === 'string') {
        return raw.replace(/[{}]/g, '').split(',').map(s => s.trim()).filter(Boolean).map(String);
    }
    if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
    return [];
}

window.loadPromotions = async function() {
    const homePromosGrid = document.getElementById('homePromosGrid');
    const promosGrid = document.getElementById('promosGrid');

    if (!homePromosGrid && !promosGrid) return;

    let promos = [];
    let kitsMap = {};

    try {
        const localPromos = localStorage.getItem('solar_promos');
        if (localPromos) promos = JSON.parse(localPromos);
        
        const localKits = localStorage.getItem('solar_kits');
        if (localKits) {
            const kitsArr = JSON.parse(localKits);
            kitsArr.forEach(k => { kitsMap[String(k.id)] = k; });
        }
        
        // Filtrar promociones activas
        promos = promos.filter(p => p.status !== 'Inactiva' && p.status !== 'Oculto');
        
        if (promos.length > 0) console.log(`✅ ${promos.length} promociones desde LocalStorage`);
    } catch (err) {
        console.warn('⚠️ Error leyendo promociones locales:', err);
    }

    if (promos.length === 0) {
        const emptyHTML = '<p style="text-align:center; width:100%; color:var(--gray-400); padding: 3rem;">No hay promociones activas en este momento.</p>';
        if (homePromosGrid) homePromosGrid.innerHTML = emptyHTML;
        if (promosGrid) promosGrid.innerHTML = emptyHTML;
        return;
    }

    // Renderizar tarjetas
    const renderCards = (container) => {
        if (!container) return;
        container.innerHTML = '';

        promos.forEach((promo, index) => {
            const kitIds = normalizeKitIds(promo.kit_ids || promo.product_ids);
            const color = promo.badge_color || promo.color || '#f97316';

            // --- Construir bloque de imagen ---
            let imageHTML = '';

            if (promo.image && promo.image.trim() !== '') {
                // Imagen propia de la promo
                imageHTML = `<div style="height:210px; border-radius:12px; overflow:hidden; margin-bottom:1rem;">
                    <img src="${promo.image}" alt="${promo.title || promo.name}" loading="lazy"
                        style="width:100%; height:100%; object-fit:cover;">
                </div>`;

            } else if (kitIds.length > 0 && Object.keys(kitsMap).length > 0) {
                // Imágenes de los kits vinculados
                const linkedKits = kitIds.map(id => kitsMap[id]).filter(Boolean);

                if (linkedKits.length > 0) {
                    const cols = linkedKits.slice(0, 3).map(kit => {
                        const src = getKitImage(kit);
                        return `<div style="flex:1; min-width:0;">
                            <img src="${src}" alt="${kit.name || 'Kit Solar'}" loading="lazy"
                                style="width:100%; height:210px; object-fit:cover; display:block;">
                        </div>`;
                    });
                    const gap = cols.length > 1 ? 'gap:3px;' : '';
                    imageHTML = `<div style="display:flex; ${gap} border-radius:12px; overflow:hidden; margin-bottom:1rem;">
                        ${cols.join('')}
                    </div>`;
                }
            }

            // Fallback: imagen genérica según índice + overlay con badge color
            if (!imageHTML) {
                const fallbackSrc = DEFAULT_PROMO_IMAGES[index % DEFAULT_PROMO_IMAGES.length];
                imageHTML = `<div style="height:210px; border-radius:12px; overflow:hidden; margin-bottom:1rem; position:relative;">
                    <img src="${fallbackSrc}" alt="${promo.title || promo.name}" loading="lazy"
                        style="width:100%; height:100%; object-fit:cover; display:block;">
                    <div style="position:absolute; inset:0; background:${color}15;"></div>
                </div>`;
            }

            const featuresHTML = promo.features
                ? promo.features.split(',').map(f => `<li>${f.trim()}</li>`).join('')
                : '';

            const origPriceHtml = promo.original_price
                ? `<span style="text-decoration:line-through; color:var(--gray-400); font-size:0.9rem; margin-right:0.5rem;">${promo.original_price}</span>`
                : '';
                
            const promoPrice = promo.promo_price || (promo.discount_type === 'percentage' 
                ? `-${promo.discount_value}%` 
                : `-$${Number(promo.discount_value).toLocaleString('es-MX')}`);

            const ctaHref = kitIds.length > 0
                ? `productos.html?kit=${encodeURIComponent(kitIds[0])}`
                : `contacto.html?promo=${encodeURIComponent(promo.id)}`;

            const card = document.createElement('div');
            card.className = 'service-card reveal visible';
            card.style.cssText = `border:2px solid ${color}; overflow:hidden; padding:0;`;
            card.innerHTML = `
                ${imageHTML}
                <div style="padding: 1.25rem 1.25rem 1.5rem;">
                    <div style="text-align:center; margin-bottom:0.8rem;">
                        <span style="background:${color}; color:white; padding:0.35rem 0.9rem; border-radius:20px; font-size:0.75rem; font-weight:800; letter-spacing:0.5px; text-transform:uppercase;">${promo.badge || 'OFERTA'}</span>
                    </div>
                    <h3 style="margin-bottom:0.4rem;">${promo.title || promo.name}</h3>
                    <p style="color:var(--gray-400); margin-bottom:0.8rem; font-size:0.88rem; line-height:1.5;">${promo.description || ''}</p>
                    <div style="margin:0.8rem 0; background:rgba(0,0,0,0.2); padding:0.9rem; border-radius:8px; text-align:center;">
                        ${origPriceHtml}
                        <span style="color:${color}; font-size:1.75rem; font-weight:700; display:block; margin-top:0.2rem;">${promoPrice}</span>
                    </div>
                    ${featuresHTML ? `<ul class="service-features" style="margin-bottom:1rem;">${featuresHTML}</ul>` : ''}
                    <a href="${ctaHref}" class="btn-primary" style="width:100%; text-align:center; display:block; box-sizing:border-box; background-color:${color}; border-color:${color};">Aprovechar Oferta</a>
                </div>
            `;
            container.appendChild(card);
        });
    };

    renderCards(homePromosGrid);
    renderCards(promosGrid);
};

// Llamar al cargar la página (el script está al final del body, DOM ya listo)
loadPromotions();
