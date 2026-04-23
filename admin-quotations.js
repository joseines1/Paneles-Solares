// admin-quotations.js - Cotizaciones manuales con partidas, totales y exportación a PDF

const QUOTATION_PIPELINE = {
    10: { label: 'Cotización Enviada', color: '#3b82f6', icon: '📮' },
    20: { label: 'Espera Respuesta', color: '#8b5cf6', icon: '⏳' },
    40: { label: 'Cliente Interesado', color: '#f59e0b', icon: '👍' },
    60: { label: 'En Negociación', color: '#10b981', icon: '💼' },
    80: { label: 'En Instalación', color: '#f97316', icon: '🔧' },
    100: { label: 'Completada', color: '#34d399', icon: '✅' }
};

function getProgressFromStatus(status) {
    const map = { 'Nuevo': 10, 'En Proceso': 40, 'Cerrado': 100 };
    return map[status] || 10;
}

function getStatusFromProgress(progress) {
    if (progress <= 20) return 'Nuevo';
    if (progress <= 80) return 'En Proceso';
    return 'Cerrado';
}

function renderProgressBar(progress) {
    const pipelineData = QUOTATION_PIPELINE[progress];
    if (!pipelineData) return '';
    return `
        <div class="progress-container">
            <div class="progress-bar-wrapper">
                <div class="progress-bar-fill" style="width: ${progress}%; background: linear-gradient(90deg, ${pipelineData.color}, ${pipelineData.color}dd);">
                    <span class="progress-text">${progress}%</span>
                </div>
            </div>
            <div class="progress-label" style="color: ${pipelineData.color};">
                ${pipelineData.icon} ${pipelineData.label}
            </div>
            <div class="progress-controls">
                <select class="admin-select progress-selector" onchange="updateQuotationProgress(this.dataset.quoteId, this.value)" data-quote-id="" style="height:32px;font-size:0.8rem;">
                    <option value="10" ${progress===10?'selected':''}>10% - Enviada</option>
                    <option value="20" ${progress===20?'selected':''}>20% - Espera</option>
                    <option value="40" ${progress===40?'selected':''}>40% - Interesado</option>
                    <option value="60" ${progress===60?'selected':''}>60% - Negociación</option>
                    <option value="80" ${progress===80?'selected':''}>80% - Instalando</option>
                    <option value="100" ${progress===100?'selected':''}>100% - Completada</option>
                </select>
            </div>
        </div>
    `;
}

async function updateQuotationProgress(quoteId, newProgress) {
    const progress = parseInt(newProgress);
    const newStatus = getStatusFromProgress(progress);
    const id = parseInt(quoteId);
    const quote = (window.quotes || []).find(q => q.id === id);
    if (quote) { quote.progress = progress; quote.status = newStatus; }

    try {
        await window.adminApiRequest(`/api/admin/contacts/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus, progress })
        });
        showNotification(`Cotización actualizada al ${newProgress}%`, 'success');
    } catch (err) {
        showNotification('Error al actualizar progreso', 'error');
    }

    if (typeof renderFilteredData === 'function') renderFilteredData();
}
window.updateQuotationProgress = updateQuotationProgress;

// ─────────────────────────────────────────────
//  MODAL DE COTIZACIÓN MANUAL
// ─────────────────────────────────────────────

// Estado de partidas por cotización (quoteId → [items])
const _quoteItems = {};

function getQuoteItems(quoteId) {
    if (!_quoteItems[quoteId]) {
        // Precargar con kits activos del catálogo si existen
        const kits = (window.kits || []).filter(k => k.is_active !== false).slice(0, 3);
        _quoteItems[quoteId] = kits.length > 0
            ? kits.map(k => ({
                descripcion: k.name || k.nombre || '',
                cantidad: 1,
                precio: Number(k.price || k.precio || 0)
            }))
            : [{ descripcion: '', cantidad: 1, precio: 0 }];
    }
    return _quoteItems[quoteId];
}

function calcTotals(items, descuento) {
    const subtotal = items.reduce((s, i) => s + (i.cantidad * i.precio), 0);
    const descAmount = subtotal * (descuento / 100);
    const total = subtotal - descAmount;
    return { subtotal, descAmount, total };
}

function openQuoteEditor(quoteId) {
    const quote = (window.quotes || []).find(q => q.id === parseInt(quoteId));
    if (!quote) { showNotification('Cotización no encontrada', 'error'); return; }

    // Cerrar si ya existe
    const old = document.getElementById('quoteEditorModal');
    if (old) old.remove();

    const items = getQuoteItems(quoteId);
    let descuento = quote._descuento || 0;
    let notas = quote._notas || '';

    const modal = document.createElement('div');
    modal.id = 'quoteEditorModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;z-index:10000;padding:1rem;box-sizing:border-box;';

    function renderModal() {
        const { subtotal, descAmount, total } = calcTotals(items, descuento);
        modal.innerHTML = `
        <div style="background:#1e293b;border:1px solid rgba(255,255,255,0.1);border-radius:14px;width:100%;max-width:800px;max-height:90vh;overflow-y:auto;display:flex;flex-direction:column;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:1.2rem 1.5rem;border-radius:14px 14px 0 0;display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <h2 style="color:#fff;margin:0;font-size:1.1rem;">🧾 Armar Cotización</h2>
                    <p style="color:rgba(255,255,255,0.8);margin:0.2rem 0 0;font-size:0.8rem;">
                        ${quote.nombre}${quote.empresa ? ' — ' + quote.empresa : ''} &nbsp;|&nbsp; COT-${quote.id}
                    </p>
                </div>
                <button id="btnCloseEditor" style="background:rgba(0,0,0,0.2);border:none;color:#fff;font-size:1.4rem;cursor:pointer;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">×</button>
            </div>

            <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1.2rem;">

                <!-- Tabla de partidas -->
                <div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem;">
                        <span style="color:#f97316;font-weight:700;font-size:0.9rem;">PARTIDAS</span>
                        <button id="btnAddItem" style="background:rgba(249,115,22,0.15);border:1px solid rgba(249,115,22,0.5);color:#f97316;padding:0.35rem 0.9rem;border-radius:6px;cursor:pointer;font-size:0.82rem;font-weight:600;">+ Agregar línea</button>
                    </div>

                    <!-- Encabezados -->
                    <div style="display:grid;grid-template-columns:2fr 90px 120px 100px 36px;gap:6px;margin-bottom:4px;">
                        ${['Descripción','Cant.','P. Unitario','Subtotal',''].map(h=>`<span style="color:#64748b;font-size:0.75rem;font-weight:600;text-transform:uppercase;">${h}</span>`).join('')}
                    </div>

                    <!-- Filas -->
                    <div id="itemsContainer">
                        ${items.map((item, idx) => renderItemRow(item, idx)).join('')}
                    </div>
                </div>

                <!-- Descuento y notas -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                    <div>
                        <label style="color:#94a3b8;font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.4rem;">DESCUENTO (%)</label>
                        <input id="inputDescuento" type="number" min="0" max="100" value="${descuento}"
                            style="width:100%;padding:0.6rem;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.12);color:#fff;border-radius:6px;font-size:0.95rem;box-sizing:border-box;">
                    </div>
                    <div>
                        <label style="color:#94a3b8;font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.4rem;">NOTAS PARA EL CLIENTE</label>
                        <input id="inputNotas" type="text" value="${notas}" placeholder="Vigencia, condiciones, etc."
                            style="width:100%;padding:0.6rem;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.12);color:#fff;border-radius:6px;font-size:0.95rem;box-sizing:border-box;">
                    </div>
                </div>

                <!-- Totales -->
                <div style="background:rgba(0,0,0,0.25);border-radius:10px;padding:1rem 1.2rem;display:flex;flex-direction:column;gap:0.4rem;align-items:flex-end;">
                    <div style="display:flex;gap:2rem;">
                        <span style="color:#94a3b8;font-size:0.9rem;">Subtotal</span>
                        <span id="totSubtotal" style="color:#fff;font-size:0.9rem;min-width:120px;text-align:right;">${fmtMXN(subtotal)}</span>
                    </div>
                    <div style="display:flex;gap:2rem;">
                        <span style="color:#94a3b8;font-size:0.9rem;">Descuento (${descuento}%)</span>
                        <span id="totDesc" style="color:#ef4444;font-size:0.9rem;min-width:120px;text-align:right;">− ${fmtMXN(descAmount)}</span>
                    </div>
                    <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:0.4rem;margin-top:0.2rem;display:flex;gap:2rem;">
                        <span style="color:#f97316;font-weight:700;">TOTAL</span>
                        <span id="totTotal" style="color:#f97316;font-weight:700;font-size:1.1rem;min-width:120px;text-align:right;">${fmtMXN(total)}</span>
                    </div>
                </div>

                <!-- Acciones -->
                <div style="display:flex;flex-wrap:wrap;gap:0.75rem;justify-content:flex-end;">
                    <button id="btnCloseEditor2" style="padding:0.55rem 1.2rem;background:rgba(100,116,139,0.2);color:#94a3b8;border:1px solid rgba(100,116,139,0.3);border-radius:6px;cursor:pointer;font-weight:600;">Cancelar</button>
                    <button id="btnDownloadPDF" style="padding:0.55rem 1.2rem;background:rgba(59,130,246,0.2);color:#60a5fa;border:1px solid rgba(59,130,246,0.4);border-radius:6px;cursor:pointer;font-weight:600;">⬇️ Descargar PDF</button>
                    <button id="btnSendEmail" style="padding:0.55rem 1.2rem;background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(16,185,129,0.4);border-radius:6px;cursor:pointer;font-weight:600;">✉️ Enviar por Email</button>
                    <button id="btnSendWA" style="padding:0.55rem 1.2rem;background:rgba(37,211,102,0.15);color:#25d366;border:1px solid rgba(37,211,102,0.4);border-radius:6px;cursor:pointer;font-weight:600;">💬 WhatsApp</button>
                </div>
            </div>
        </div>`;

        bindEditorEvents();
    }

    function renderItemRow(item, idx) {
        const sub = item.cantidad * item.precio;
        return `
        <div class="item-row" data-idx="${idx}" style="display:grid;grid-template-columns:2fr 90px 120px 100px 36px;gap:6px;margin-bottom:5px;align-items:center;">
            <input class="item-desc" type="text" value="${escHtml(item.descripcion)}" placeholder="Descripción del producto/servicio"
                style="padding:0.5rem 0.6rem;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:6px;font-size:0.85rem;width:100%;box-sizing:border-box;">
            <input class="item-cant" type="number" min="1" value="${item.cantidad}"
                style="padding:0.5rem;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:6px;font-size:0.85rem;width:100%;box-sizing:border-box;text-align:center;">
            <input class="item-precio" type="number" min="0" step="0.01" value="${item.precio}"
                style="padding:0.5rem;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:6px;font-size:0.85rem;width:100%;box-sizing:border-box;text-align:right;">
            <span class="item-sub" style="color:#e2e8f0;font-size:0.85rem;text-align:right;padding-right:4px;">${fmtMXN(sub)}</span>
            <button class="item-del" data-idx="${idx}" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#ef4444;border-radius:6px;cursor:pointer;height:32px;width:32px;font-size:1rem;display:flex;align-items:center;justify-content:center;">×</button>
        </div>`;
    }

    function readItemsFromDOM() {
        document.querySelectorAll('#itemsContainer .item-row').forEach(row => {
            const idx = parseInt(row.dataset.idx);
            if (items[idx]) {
                items[idx].descripcion = row.querySelector('.item-desc').value;
                items[idx].cantidad = Math.max(1, parseFloat(row.querySelector('.item-cant').value) || 1);
                items[idx].precio = parseFloat(row.querySelector('.item-precio').value) || 0;
            }
        });
    }

    function updateTotals() {
        readItemsFromDOM();
        descuento = parseFloat(document.getElementById('inputDescuento')?.value) || 0;
        notas = document.getElementById('inputNotas')?.value || '';

        // Actualizar subtotales en filas
        document.querySelectorAll('#itemsContainer .item-row').forEach(row => {
            const idx = parseInt(row.dataset.idx);
            if (items[idx]) {
                const sub = items[idx].cantidad * items[idx].precio;
                row.querySelector('.item-sub').textContent = fmtMXN(sub);
            }
        });

        const { subtotal, descAmount, total } = calcTotals(items, descuento);
        const ts = document.getElementById('totSubtotal');
        const td = document.getElementById('totDesc');
        const tt = document.getElementById('totTotal');
        if (ts) ts.textContent = fmtMXN(subtotal);
        if (td) { td.textContent = `− ${fmtMXN(descAmount)}`; td.previousElementSibling.textContent = `Descuento (${descuento}%)`; }
        if (tt) tt.textContent = fmtMXN(total);

        // Guardar en quote
        quote._descuento = descuento;
        quote._notas = notas;
        _quoteItems[quoteId] = [...items];
    }

    function bindEditorEvents() {
        document.getElementById('btnCloseEditor')?.addEventListener('click', () => modal.remove());
        document.getElementById('btnCloseEditor2')?.addEventListener('click', () => modal.remove());

        document.getElementById('btnAddItem')?.addEventListener('click', () => {
            readItemsFromDOM();
            items.push({ descripcion: '', cantidad: 1, precio: 0 });
            const container = document.getElementById('itemsContainer');
            const idx = items.length - 1;
            container.insertAdjacentHTML('beforeend', renderItemRow(items[idx], idx));
            bindRowEvents();
        });

        document.getElementById('inputDescuento')?.addEventListener('input', updateTotals);
        document.getElementById('inputNotas')?.addEventListener('input', () => {
            notas = document.getElementById('inputNotas').value;
            quote._notas = notas;
        });

        bindRowEvents();

        document.getElementById('btnDownloadPDF')?.addEventListener('click', async () => {
            readItemsFromDOM();
            descuento = parseFloat(document.getElementById('inputDescuento')?.value) || 0;
            notas = document.getElementById('inputNotas')?.value || '';
            quote._descuento = descuento; quote._notas = notas;
            _quoteItems[quoteId] = [...items];
            try {
                const { doc, filename } = await buildQuotationPDF(quote, items, descuento, notas);
                doc.save(filename);
                showNotification(`PDF descargado: ${filename}`, 'success');
            } catch (err) { showNotification('Error al generar PDF: ' + err.message, 'error'); }
        });

        document.getElementById('btnSendEmail')?.addEventListener('click', async () => {
            readItemsFromDOM();
            descuento = parseFloat(document.getElementById('inputDescuento')?.value) || 0;
            notas = document.getElementById('inputNotas')?.value || '';
            quote._descuento = descuento; quote._notas = notas;
            _quoteItems[quoteId] = [...items];
            modal.remove();
            await sendQuotationByEmail(quoteId);
        });

        document.getElementById('btnSendWA')?.addEventListener('click', () => {
            readItemsFromDOM();
            _quoteItems[quoteId] = [...items];
            modal.remove();
            sendQuotationByWhatsApp(quoteId);
        });
    }

    function bindRowEvents() {
        document.querySelectorAll('#itemsContainer .item-row').forEach(row => {
            row.querySelector('.item-desc')?.addEventListener('input', updateTotals);
            row.querySelector('.item-cant')?.addEventListener('input', updateTotals);
            row.querySelector('.item-precio')?.addEventListener('input', updateTotals);
            row.querySelector('.item-del')?.addEventListener('click', function () {
                const idx = parseInt(this.dataset.idx);
                readItemsFromDOM();
                items.splice(idx, 1);
                const container = document.getElementById('itemsContainer');
                container.innerHTML = items.map((item, i) => renderItemRow(item, i)).join('');
                bindRowEvents();
                updateTotals();
            });
        });
    }

    // Cerrar al hacer clic fuera
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

    document.body.appendChild(modal);
    renderModal();
}
window.openQuoteEditor = openQuoteEditor;

// ─────────────────────────────────────────────
//  GENERAR PDF CON PARTIDAS MANUALES
// ─────────────────────────────────────────────

async function buildQuotationPDF(quote, items, descuento, notas) {
    // Si se llama sin items (ruta antigua), usar los del estado guardado
    if (!items) {
        items = getQuoteItems(quote.id);
        descuento = quote._descuento || 0;
        notas = quote._notas || '';
    }

    const jsPDFConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (!jsPDFConstructor) throw new Error('jsPDF no está cargado. Recarga la página.');
    const doc = new jsPDFConstructor({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFont('Helvetica');

    // Header naranja
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 0, 210, 32, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('Helvetica', 'bold');
    doc.text('SOLAR WEB', 20, 18);
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text('Energia Solar Fotovoltaica', 20, 26);

    const fecha = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.text(`Fecha: ${fecha}`, 140, 18);
    doc.text(`Folio: COT-${quote.id || Date.now()}`, 140, 25);

    // Título
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text('COTIZACION DE SISTEMA SOLAR', 20, 48);
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(0.8);
    doc.line(20, 51, 190, 51);

    // Datos del cliente
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(249, 115, 22);
    doc.text('DATOS DEL CLIENTE', 20, 60);
    doc.setTextColor(50, 50, 50);
    doc.setFont('Helvetica', 'normal');
    const clientRows = [
        ['Nombre:', quote.nombre || 'N/A'],
        ['Empresa:', quote.empresa || 'Persona Fisica'],
        ['Email:', quote.email || 'N/A'],
        ['Telefono:', quote.telefono || 'N/A'],
        ['Servicio:', quote.servicio || 'No especificado'],
    ];
    let y = 68;
    clientRows.forEach(([label, value]) => {
        doc.setFont('Helvetica', 'bold'); doc.text(label, 22, y);
        doc.setFont('Helvetica', 'normal'); doc.text(value, 58, y);
        y += 7;
    });

    // Mensaje del cliente
    if (quote.mensaje) {
        y += 2;
        doc.setFont('Helvetica', 'bold'); doc.text('Necesidad:', 22, y); y += 6;
        doc.setFont('Helvetica', 'normal');
        const lines = doc.splitTextToSize(quote.mensaje, 160);
        doc.text(lines, 22, y);
        y += lines.length * 5 + 4;
    }

    // Tabla de partidas
    y += 4;
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(249, 115, 22);
    doc.text('DETALLE DE LA COTIZACION', 20, y); y += 8;

    // Encabezado de tabla
    doc.setFillColor(249, 115, 22);
    doc.rect(20, y - 5, 170, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('Descripción', 24, y);
    doc.text('Cant.', 130, y, { align: 'center' });
    doc.text('P. Unitario', 155, y, { align: 'right' });
    doc.text('Subtotal', 188, y, { align: 'right' });
    y += 8;

    // Filas de partidas
    doc.setTextColor(50, 50, 50);
    items.forEach((item, i) => {
        if (y > 255) { doc.addPage(); y = 20; }
        doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 252 : 255);
        doc.rect(20, y - 5, 170, 9, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.rect(20, y - 5, 170, 9);
        doc.setFont('Helvetica', 'normal'); doc.setFontSize(9);
        const descLines = doc.splitTextToSize(item.descripcion || '—', 100);
        doc.text(descLines[0], 24, y);
        doc.text(String(item.cantidad), 130, y, { align: 'center' });
        doc.text(fmtMXN(item.precio), 155, y, { align: 'right' });
        doc.text(fmtMXN(item.cantidad * item.precio), 188, y, { align: 'right' });
        y += 9;
    });

    // Totales
    const { subtotal, descAmount, total } = calcTotals(items, descuento);
    y += 4;
    doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.3);
    doc.line(110, y, 190, y); y += 6;

    const totRows = [
        ['Subtotal:', fmtMXN(subtotal)],
        [`Descuento (${descuento}%):`, `− ${fmtMXN(descAmount)}`],
    ];
    totRows.forEach(([l, v]) => {
        doc.setFont('Helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(80, 80, 80);
        doc.text(l, 130, y);
        doc.text(v, 188, y, { align: 'right' });
        y += 7;
    });

    doc.setLineWidth(0.6); doc.setDrawColor(249, 115, 22);
    doc.line(110, y, 190, y); y += 7;
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(249, 115, 22);
    doc.text('TOTAL:', 130, y);
    doc.text(fmtMXN(total), 188, y, { align: 'right' });
    y += 10;

    // Notas
    if (notas && notas.trim()) {
        y += 2;
        doc.setFont('Helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(80, 80, 80);
        doc.text('Notas:', 22, y); y += 6;
        doc.setFont('Helvetica', 'normal');
        const notaLines = doc.splitTextToSize(notas, 160);
        doc.text(notaLines, 22, y);
        y += notaLines.length * 5 + 4;
    }

    // Pie de página
    y = Math.max(y + 10, 265);
    doc.setDrawColor(249, 115, 22); doc.setLineWidth(0.5);
    doc.line(20, y, 190, y); y += 6;
    doc.setFont('Helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120, 120, 120);
    doc.text('Esta cotizacion es valida por 30 dias a partir de la fecha de emision.', 20, y); y += 5;
    doc.text('Para mas informacion: www.solarweb.com | contacto@solarweb.com', 20, y);

    const filename = `Cotizacion_${(quote.nombre || 'Cliente').replace(/\s+/g, '_')}_${quote.id || Date.now()}.pdf`;
    const base64 = doc.output('datauristring').split(',')[1];
    return { doc, base64, filename };
}

// ─────────────────────────────────────────────
//  DESCARGA DIRECTA (sin abrir editor)
// ─────────────────────────────────────────────

async function generateQuotationPDF(quoteId) {
    const quote = (window.quotes || []).find(q => q.id === parseInt(quoteId));
    if (!quote) { showNotification('Cotización no encontrada', 'error'); return; }
    // Abrir el editor en lugar de descargar directamente
    openQuoteEditor(quoteId);
}

// ─────────────────────────────────────────────
//  ENVÍO POR EMAIL
// ─────────────────────────────────────────────

async function sendQuotationByEmail(quoteId) {
    const quote = (window.quotes || []).find(q => q.id === parseInt(quoteId));
    if (!quote) { showNotification('Cotización no encontrada', 'error'); return; }

    let emailConfigured = false;
    try {
        const status = await window.adminApiRequest('/api/email-status');
        emailConfigured = status.configured;
    } catch (e) {}

    // Construir modal
    const overlay = document.createElement('div');
    overlay.id = 'sendEmailOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;z-index:10002;';

    const items = getQuoteItems(quoteId);
    const descuento = quote._descuento || 0;
    const notas = quote._notas || '';
    const { subtotal, descAmount, total } = calcTotals(items, descuento);

    overlay.innerHTML = `
        <div style="background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:2rem;width:90%;max-width:500px;box-shadow:0 25px 50px rgba(0,0,0,0.5);">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem;">
                <h3 style="color:#fff;margin:0;font-size:1.05rem;">✉️ Enviar Cotización por Email</h3>
                <button id="btnCloseEmail" style="background:none;border:none;color:#94a3b8;font-size:1.3rem;cursor:pointer;line-height:1;">×</button>
            </div>

            <!-- Resumen -->
            <div style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.25);border-radius:8px;padding:0.8rem 1rem;margin-bottom:1.2rem;font-size:0.85rem;">
                <div style="color:#f97316;font-weight:700;margin-bottom:0.4rem;">COT-${quote.id} — ${quote.nombre}</div>
                <div style="color:#94a3b8;">${items.length} partida(s) &nbsp;·&nbsp;
                    ${descuento > 0 ? `Descuento ${descuento}% &nbsp;·&nbsp; ` : ''}
                    <strong style="color:#e2e8f0;">Total: ${fmtMXN(total)}</strong>
                </div>
            </div>

            <!-- Destinatario -->
            <div style="margin-bottom:1rem;">
                <label style="color:#94a3b8;font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.4rem;text-transform:uppercase;">Para (email del cliente) *</label>
                <input id="emailTo" type="email" value="${escHtml(quote.email || '')}" placeholder="cliente@ejemplo.com"
                    style="width:100%;padding:0.7rem;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.15);color:#fff;border-radius:6px;font-size:0.95rem;box-sizing:border-box;">
            </div>

            <!-- Asunto -->
            <div style="margin-bottom:1rem;">
                <label style="color:#94a3b8;font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.4rem;text-transform:uppercase;">Asunto</label>
                <input id="emailSubject" type="text" value="Tu cotización solar — SolarWeb"
                    style="width:100%;padding:0.7rem;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.15);color:#fff;border-radius:6px;font-size:0.95rem;box-sizing:border-box;">
            </div>

            <!-- Mensaje adicional -->
            <div style="margin-bottom:1.2rem;">
                <label style="color:#94a3b8;font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.4rem;text-transform:uppercase;">Mensaje adicional (opcional)</label>
                <textarea id="emailMsg" rows="3" placeholder="Hola, adjunto tu cotización personalizada..."
                    style="width:100%;padding:0.7rem;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.15);color:#fff;border-radius:6px;font-size:0.9rem;box-sizing:border-box;resize:vertical;font-family:inherit;"></textarea>
            </div>

            ${!emailConfigured ? `
            <div style="background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.35);border-radius:8px;padding:0.8rem 1rem;margin-bottom:1.2rem;font-size:0.82rem;color:#fbbf24;">
                ⚠️ El servidor no tiene email configurado (EMAIL_USER / EMAIL_PASS). Se descargará el PDF y se abrirá tu cliente de correo para adjuntarlo.
            </div>` : `
            <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:8px;padding:0.8rem 1rem;margin-bottom:1.2rem;font-size:0.82rem;color:#34d399;">
                ✅ Email configurado. El PDF se enviará directamente al cliente.
            </div>`}

            <div style="display:flex;gap:0.75rem;justify-content:flex-end;">
                <button id="btnCancelEmail" style="padding:0.55rem 1.2rem;background:rgba(100,116,139,0.2);color:#94a3b8;border:1px solid rgba(100,116,139,0.3);border-radius:6px;cursor:pointer;font-weight:600;">Cancelar</button>
                <button id="btnConfirmEmail" style="padding:0.55rem 1.4rem;background:#f97316;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:700;display:flex;align-items:center;gap:0.4rem;">
                    📤 ${emailConfigured ? 'Enviar PDF' : 'Descargar y abrir correo'}
                </button>
            </div>
        </div>`;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('#btnCloseEmail').addEventListener('click', close);
    overlay.querySelector('#btnCancelEmail').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    overlay.querySelector('#btnConfirmEmail').addEventListener('click', async () => {
        const toEmail = overlay.querySelector('#emailTo').value.trim();
        const subject = overlay.querySelector('#emailSubject').value.trim() || 'Tu cotización solar — SolarWeb';
        const extraMsg = overlay.querySelector('#emailMsg').value.trim();

        if (!toEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
            overlay.querySelector('#emailTo').style.borderColor = '#ef4444';
            showNotification('Ingresa un email válido', 'error');
            return;
        }

        const btn = overlay.querySelector('#btnConfirmEmail');
        btn.innerHTML = '⏳ Generando PDF...'; btn.disabled = true;

        let pdfBase64, filename;
        try {
            const r = await buildQuotationPDF(quote, items, descuento, notas);
            pdfBase64 = r.base64; filename = r.filename;
        } catch (err) {
            showNotification('Error al generar PDF: ' + err.message, 'error');
            close(); return;
        }

        if (emailConfigured) {
            btn.innerHTML = '📡 Enviando...';
            try {
                const result = await window.adminApiRequest('/api/send-quote', {
                    method: 'POST',
                    body: JSON.stringify({
                        to: toEmail,
                        subject,
                        extraMsg,
                        clientName: quote.nombre,
                        pdfBase64,
                        filename,
                        quoteDetails: { servicio: quote.servicio, mensaje: quote.mensaje, total: fmtMXN(total) }
                    })
                });
                if (result.success) {
                    showNotification(`✅ Cotización enviada a ${toEmail}`, 'success');
                } else {
                    showNotification('Error del servidor: ' + (result.message || result.error), 'error');
                }
            } catch (err) {
                showNotification('Error de red. Verifica que el servidor esté activo.', 'error');
            }
        } else {
            // Fallback: descargar PDF y abrir mailto
            const a = document.createElement('a');
            a.href = 'data:application/pdf;base64,' + pdfBase64;
            a.download = filename; a.click();
            setTimeout(() => {
                const subjectEnc = encodeURIComponent(subject);
                const bodyEnc = encodeURIComponent(
                    `Hola ${quote.nombre},\n\n` +
                    (extraMsg ? extraMsg + '\n\n' : '') +
                    `Adjunto encontrarás tu cotización de sistema solar fotovoltaico.\n` +
                    `Folio: COT-${quote.id} | Total: ${fmtMXN(total)}\n\n` +
                    `Equipo SolarWeb`
                );
                window.open(`mailto:${toEmail}?subject=${subjectEnc}&body=${bodyEnc}`);
                showNotification('PDF descargado. Adjúntalo al correo que se abrió.', 'success');
            }, 600);
        }
        close();
    });
}

// ─────────────────────────────────────────────
//  ENVÍO POR WHATSAPP
// ─────────────────────────────────────────────

async function sendQuotationByWhatsApp(quoteId) {
    const quote = (window.quotes || []).find(q => q.id === parseInt(quoteId));
    if (!quote) { showNotification('Cotización no encontrada', 'error'); return; }

    const items = getQuoteItems(quoteId);
    const descuento = quote._descuento || 0;
    const notas = quote._notas || '';
    const { subtotal, descAmount, total } = calcTotals(items, descuento);

    // Construir desglose de partidas para el mensaje
    const desglose = items
        .filter(i => i.descripcion && i.descripcion.trim())
        .map(i => `  • ${i.descripcion} x${i.cantidad} — ${fmtMXN(i.cantidad * i.precio)}`)
        .join('\n');

    const phoneNumber = (quote.telefono || '').replace(/\D/g, '');
    if (!phoneNumber) { showNotification('El cliente no tiene teléfono registrado', 'error'); return; }

    // Primero descargar el PDF, luego abrir WhatsApp
    showNotification('Generando PDF...', 'info');
    try {
        const { doc, filename } = await buildQuotationPDF(quote, items, descuento, notas);
        doc.save(filename);
    } catch (err) {
        showNotification('Error al generar PDF: ' + err.message, 'error'); return;
    }

    const fecha = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
    let msg = `Hola ${quote.nombre}! 👋\n\n`;
    msg += `Te enviamos tu cotización de sistema solar ☀️\n`;
    msg += `📋 Folio: COT-${quote.id} | 📅 ${fecha}\n\n`;
    if (desglose) { msg += `*Detalle:*\n${desglose}\n\n`; }
    if (descuento > 0) { msg += `Descuento (${descuento}%): -${fmtMXN(descAmount)}\n`; }
    msg += `*💰 Total: ${fmtMXN(total)}*\n\n`;
    if (notas && notas.trim()) { msg += `📝 ${notas}\n\n`; }
    msg += `El PDF con todos los detalles acaba de descargarse — te lo podemos enviar por email también.\n¿Tienes alguna duda? Estamos para ayudarte 📞`;

    window.open(`https://wa.me/52${phoneNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    showNotification(`PDF descargado. Abriendo WhatsApp para +52${phoneNumber}`, 'success');
}

// ─────────────────────────────────────────────
//  UTILIDADES
// ─────────────────────────────────────────────

function fmtMXN(n) {
    return '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showNotification(message, type = 'info') {
    const n = document.createElement('div');
    n.style.cssText = `position:fixed;top:20px;right:20px;padding:15px 20px;border-radius:8px;color:white;font-weight:bold;z-index:20000;animation:slideIn 0.3s ease;box-shadow:0 10px 25px rgba(0,0,0,0.2);${type==='success'?'background:#10b981;':type==='error'?'background:#ef4444;':'background:#3b82f6;'}`;
    n.textContent = message;
    document.body.appendChild(n);
    setTimeout(() => { n.style.animation='slideOut 0.3s ease'; setTimeout(()=>n.remove(), 300); }, 3000);
}

// CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
    .progress-container { background:rgba(0,0,0,0.1);padding:15px;border-radius:8px;margin:10px 0;border-left:4px solid var(--primary); }
    .progress-bar-wrapper { width:100%;height:28px;background:rgba(255,255,255,0.1);border-radius:14px;overflow:hidden;margin-bottom:10px;border:1px solid rgba(255,255,255,0.2);position:relative; }
    .progress-bar-fill { height:100%;display:flex;align-items:center;justify-content:center;transition:width 0.4s ease; }
    .progress-text { color:white;font-size:0.75rem;font-weight:bold;text-shadow:0 1px 2px rgba(0,0,0,0.3); }
    .progress-label { font-size:0.9rem;font-weight:600;margin-bottom:10px; }
    .progress-controls { display:flex;gap:10px; }
    .progress-selector { flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);color:var(--gray-200);padding:6px 10px;border-radius:6px;cursor:pointer;font-family:'Inter',sans-serif; }
    .progress-selector:hover { background:rgba(255,255,255,0.1);border-color:var(--primary); }
    .progress-selector option { background:#1e293b;color:white; }
    #quoteEditorModal input:focus { outline:none;border-color:#f97316 !important; }
`;
document.head.appendChild(style);
