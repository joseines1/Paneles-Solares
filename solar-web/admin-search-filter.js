// admin-search-filter.js - Sistema de búsqueda, filtrado y paginación

// Estado global para búsqueda y filtrado
let searchState = {
    query: '',
    statusFilter: 'all',
    serviceFilter: 'all',
    currentPage: 1,
    itemsPerPage: 10,
    sortColumn: 'created_at',
    sortDirection: 'desc'
};

// Función de búsqueda principal
function searchClients(query) {
    searchState.query = query.toLowerCase().trim();
    searchState.currentPage = 1; // Resetear a primera página
    renderFilteredData();
}

// Función de filtrado por estado
function filterByStatus(status) {
    searchState.statusFilter = status;
    searchState.currentPage = 1; // Resetear a primera página
    renderFilteredData();
}

// Función de filtrado por servicio
function filterByService(service) {
    searchState.serviceFilter = service;
    searchState.currentPage = 1; // Resetear a primera página
    renderFilteredData();
}

// Función de ordenamiento
function sortBy(column) {
    if (searchState.sortColumn === column) {
        // Cambiar dirección si es la misma columna
        searchState.sortDirection = searchState.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        searchState.sortColumn = column;
        searchState.sortDirection = 'asc';
    }
    renderFilteredData();
}

// Función principal de filtrado y ordenamiento
function getFilteredData() {
    let filteredData = [...quotes];

    // Aplicar búsqueda
    if (searchState.query) {
        filteredData = filteredData.filter(item => {
            return (
                (item.nombre && item.nombre.toLowerCase().includes(searchState.query)) ||
                (item.empresa && item.empresa.toLowerCase().includes(searchState.query)) ||
                (item.email && item.email.toLowerCase().includes(searchState.query)) ||
                (item.telefono && item.telefono.includes(searchState.query)) ||
                (item.servicio && item.servicio.toLowerCase().includes(searchState.query)) ||
                (item.mensaje && item.mensaje.toLowerCase().includes(searchState.query)) ||
                (item.crmNote && item.crmNote.toLowerCase().includes(searchState.query))
            );
        });
    }

    // Aplicar filtro de estado
    if (searchState.statusFilter !== 'all') {
        filteredData = filteredData.filter(item => 
            (item.status || 'Nuevo') === searchState.statusFilter
        );
    }

    // Aplicar filtro de servicio
    if (searchState.serviceFilter !== 'all') {
        filteredData = filteredData.filter(item => 
            item.servicio === searchState.serviceFilter
        );
    }

    // Aplicar ordenamiento
    filteredData.sort((a, b) => {
        let aValue = a[searchState.sortColumn] || '';
        let bValue = b[searchState.sortColumn] || '';

        // Manejo especial para fechas
        if (searchState.sortColumn === 'created_at') {
            aValue = new Date(aValue).getTime() || 0;
            bValue = new Date(bValue).getTime() || 0;
        } else {
            aValue = aValue.toString().toLowerCase();
            bValue = bValue.toString().toLowerCase();
        }

        if (searchState.sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    return filteredData;
}

// Función de paginación
function getPaginatedData(data) {
    const startIndex = (searchState.currentPage - 1) * searchState.itemsPerPage;
    const endIndex = startIndex + searchState.itemsPerPage;
    return data.slice(startIndex, endIndex);
}

// Renderizar datos filtrados y paginados
function renderFilteredData() {
    const filteredData = getFilteredData();
    const paginatedData = getPaginatedData(filteredData);
    
    // Renderizar tablas
    renderCRMTable(paginatedData);
    renderQuotesTable(paginatedData);
    
    // Renderizar controles de paginación
    renderPagination(filteredData.length);
    
    // Actualizar contador de resultados
    updateResultsCount(filteredData.length);
}

// Renderizar tabla CRM
function renderCRMTable(data) {
    const crmTbody = document.getElementById('crmTableBody');
    crmTbody.innerHTML = '';
    
    data.forEach(quote => {
        const tr = document.createElement('tr');
        const statusText = quote.status || 'Nuevo';
        const pkId = quote.id;

        tr.innerHTML = `
            <td>
                <div class="client-cell">
                    <strong>${quote.nombre || ''} <br> <small style="color:var(--primary-light)">${quote.empresa || ''}</small></strong>
                </div>
            </td>
            <td>
                <span style="font-size:0.8rem;">📱 ${quote.telefono || ''}<br>📧 ${quote.email || ''}</span>
            </td>
            <td>${quote.factura || '—'}</td>
            <td>
                <input type="text" class="admin-input" style="font-size:0.8rem; padding:0.4rem; height:30px;"
                    placeholder="Agregar nota..." value="${quote.crmNote || ''}"
                    onchange="updateNote(${pkId}, this.value)" />
            </td>
            <td>
                <select class="admin-select" onchange="updateStatus(${pkId}, this.value)" style="padding:4px; height:30px; font-size:0.8rem;">
                    <option value="Nuevo"      ${statusText === 'Nuevo'      ? 'selected' : ''}>Nuevo</option>
                    <option value="En Proceso" ${statusText === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                    <option value="Cerrado"    ${statusText === 'Cerrado'    ? 'selected' : ''}>Cerrado</option>
                </select>
            </td>
            <td>
                <button class="btn-primary-sm" onclick="editClient(${pkId})">✏️ Editar</button>
                <button class="btn-action" style="color:#ef4444; border-color:rgba(239,68,68,0.3); margin-left:5px;" onclick="deleteClient(${pkId})">🗑️ Eliminar</button>
            </td>
        `;
        crmTbody.appendChild(tr);
    });
}

// Renderizar tabla Cotizaciones con barra de progreso
function renderQuotesTable(data) {
    const quotesTbody = document.getElementById('quotesTableBody');
    quotesTbody.innerHTML = '';
    
    data.forEach(quote => {
        const dateObj = new Date(quote.created_at);
        const dateStr = isNaN(dateObj) ? '—' : dateObj.toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' });
        const statusText = quote.status || 'Nuevo';
        const badgeClass = statusText === 'En Proceso' ? 'pending' : statusText === 'Cerrado' ? 'closed' : 'new';
        const pkId = quote.id;
        
        // Obtener progreso (10%, 20%, 40%, 60%, 80%, 100%)
        const progress = quote.progress || getProgressFromStatus(statusText);
        const progressData = QUOTATION_PIPELINE[progress];

        const tr2 = document.createElement('tr');
        tr2.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        
        // Fila principal con progreso
        tr2.innerHTML = `
            <td colspan="5">
                <div style="padding: 10px 0;">
                    <div style="display: grid; grid-template-columns: 1fr 2fr 1fr 2fr; gap: 15px; align-items: center;">
                        <!-- Cliente -->
                        <div>
                            <div class="client-cell">
                                <strong>${quote.nombre || ''}</strong>
                                <small style="color:var(--gray-400);">${quote.empresa || 'Freelance'}</small>
                            </div>
                        </div>
                        
                        <!-- Barra de progreso -->
                        <div class="progress-container">
                            <div class="progress-bar-wrapper">
                                <div class="progress-bar-fill" style="width: ${progress}%; background: linear-gradient(90deg, ${progressData.color}, ${progressData.color}dd);">
                                    <span class="progress-text">${progress}%</span>
                                </div>
                            </div>
                            <div class="progress-label" style="color: ${progressData.color}; font-size: 0.85rem;">
                                ${progressData.icon} ${progressData.label}
                            </div>
                        </div>
                        
                        <!-- Servicio y Fecha -->
                        <div>
                            <div style="font-size: 0.9rem; color: var(--gray-300);">
                                📊 ${quote.servicio || '—'}<br>
                                📅 ${dateStr}
                            </div>
                        </div>
                        
                        <!-- Acciones -->
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                            <button class="btn-action-sm" title="Descargar PDF" onclick="generateQuotationPDF(${pkId})">📄</button>
                            <button class="btn-action-sm" title="Enviar por Email" onclick="sendQuotationByEmail(${pkId})">✉️</button>
                            <button class="btn-action-sm" title="Enviar por WhatsApp" onclick="sendQuotationByWhatsApp(${pkId})">💬</button>
                            <button class="btn-action-sm danger" title="Eliminar" onclick="deleteQuote(${pkId})">🗑️</button>
                        </div>
                    </div>
                    
                    <!-- Selector de progreso-->
                    <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
                        <select class="progress-selector" onchange="updateQuotationProgress(${pkId}, this.value)" style="height: 32px; font-size: 0.8rem; flex: 0 1 auto;">
                            <option value="10" ${progress === 10 ? 'selected' : ''}>10% - Enviada</option>
                            <option value="20" ${progress === 20 ? 'selected' : ''}>20% - Espera</option>
                            <option value="40" ${progress === 40 ? 'selected' : ''}>40% - Interesado</option>
                            <option value="60" ${progress === 60 ? 'selected' : ''}>60% - Negociación</option>
                            <option value="80" ${progress === 80 ? 'selected' : ''}>80% - Instalando</option>
                            <option value="100" ${progress === 100 ? 'selected' : ''}>100% - Completada</option>
                        </select>
                        <input type="text" class="admin-input" placeholder="📝 Agregar nota..." 
                            value="${quote.crmNote || ''}" 
                            onchange="updateQuoteNote(${pkId}, this.value)"
                            style="flex: 1; height: 32px; font-size: 0.8rem; padding: 6px; min-width: 200px;" />
                    </div>
                    
                    <!-- Detalles (si aplica) -->
                    ${quote.mensaje ? `<div style="margin-top: 8px; font-size: 0.85rem; color: var(--gray-400); border-left: 2px solid ${progressData.color}; padding-left: 10px;"><strong>Solicitud:</strong> ${quote.mensaje.substring(0, 100)}${quote.mensaje.length > 100 ? '...' : ''}</div>` : ''}
                </div>
            </td>
        `;
        
        quotesTbody.appendChild(tr2);
    });
}

// Actualizar nota de cotización
function updateQuoteNote(quoteId, note) {
    const quotes = JSON.parse(localStorage.getItem('solar_quotes')) || [];
    const quote = quotes.find(q => q.id === quoteId);
    if (quote) {
        quote.crmNote = note;
        localStorage.setItem('solar_quotes', JSON.stringify(quotes));
        showNotification('Nota actualizada', 'success');
    }
}

// Renderizar controles de paginación
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / searchState.itemsPerPage);
    const paginationContainer = document.getElementById('paginationContainer');
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="pagination-controls">';
    
    // Botón anterior
    paginationHTML += `
        <button class="pagination-btn" ${searchState.currentPage === 1 ? 'disabled' : ''} 
                onclick="changePage(${searchState.currentPage - 1})">
            ← Anterior
        </button>
    `;
    
    // Números de página
    const maxVisiblePages = 5;
    let startPage = Math.max(1, searchState.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === searchState.currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">${i}</button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    // Botón siguiente
    paginationHTML += `
        <button class="pagination-btn" ${searchState.currentPage === totalPages ? 'disabled' : ''} 
                onclick="changePage(${searchState.currentPage + 1})">
            Siguiente →
        </button>
    `;
    
    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

// Cambiar página
function changePage(page) {
    const filteredData = getFilteredData();
    const totalPages = Math.ceil(filteredData.length / searchState.itemsPerPage);
    
    if (page >= 1 && page <= totalPages) {
        searchState.currentPage = page;
        renderFilteredData();
    }
}

// Actualizar contador de resultados
function updateResultsCount(count) {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `${count} resultado${count !== 1 ? 's' : ''}`;
    }
}

// Inicializar controles de búsqueda y filtrado
function initializeSearchFilters() {
    // Búsqueda
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchClients(e.target.value);
        });
    }
    
    // Filtros
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            filterByStatus(e.target.value);
        });
    }
    
    const serviceFilter = document.getElementById('serviceFilter');
    if (serviceFilter) {
        serviceFilter.addEventListener('change', (e) => {
            filterByService(e.target.value);
        });
    }
}

// Hacer funciones globales
window.searchClients = searchClients;
window.filterByStatus = filterByStatus;
window.filterByService = filterByService;
window.sortBy = sortBy;
window.changePage = changePage;
window.initializeSearchFilters = initializeSearchFilters;

// Funciones para editar y eliminar clientes
window.editClient = function(id) {
    const client = quotes.find(q => q.id === id);
    if (!client) return;
    
    // Crear modal de edición
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); display: flex; align-items: center;
        justify-content: center; z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: var(--secondary-dark); padding: 2rem; border-radius: 12px; width: 90%; max-width: 500px; border: 1px solid rgba(255,255,255,0.1);">
            <h3 style="margin-bottom: 1.5rem; color: var(--white);">Editar Cliente</h3>
            <form id="editClientForm">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Nombre *</label>
                    <input type="text" id="editNombre" value="${client.nombre || ''}" class="admin-input" required style="width: 100%;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Empresa</label>
                    <input type="text" id="editEmpresa" value="${client.empresa || ''}" class="admin-input" style="width: 100%;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Email *</label>
                    <input type="email" id="editEmail" value="${client.email || ''}" class="admin-input" required style="width: 100%;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Teléfono *</label>
                    <input type="tel" id="editTelefono" value="${client.telefono || ''}" class="admin-input" required style="width: 100%;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Servicio</label>
                    <select id="editServicio" class="admin-select" style="width: 100%;">
                        <option value="">Seleccionar...</option>
                        <option value="Instalación Residencial" ${client.servicio === 'Instalación Residencial' ? 'selected' : ''}>Instalación Residencial</option>
                        <option value="Instalación Comercial" ${client.servicio === 'Instalación Comercial' ? 'selected' : ''}>Instalación Comercial</option>
                        <option value="Instalación Industrial" ${client.servicio === 'Instalación Industrial' ? 'selected' : ''}>Instalación Industrial</option>
                    </select>
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Factura</label>
                    <input type="text" id="editFactura" value="${client.factura || ''}" class="admin-input" style="width: 100%;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Mensaje</label>
                    <textarea id="editMensaje" class="admin-input" rows="3" style="width: 100%; resize: vertical;">${client.mensaje || ''}</textarea>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button type="button" onclick="this.closest('.modal-overlay').remove()" class="btn-secondary" style="padding: 0.5rem 1rem;">Cancelar</button>
                    <button type="submit" class="btn-primary" style="padding: 0.5rem 1rem;">Guardar Cambios</button>
                </div>
            </form>
        </div>
    `;
    
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
    
    // Manejar envío del formulario
    document.getElementById('editClientForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const updatedData = {
            nombre: document.getElementById('editNombre').value,
            empresa: document.getElementById('editEmpresa').value,
            email: document.getElementById('editEmail').value,
            telefono: document.getElementById('editTelefono').value,
            servicio: document.getElementById('editServicio').value,
            factura: document.getElementById('editFactura').value,
            mensaje: document.getElementById('editMensaje').value
        };
            // Actualizar en localStorage directamente
            const index = quotes.findIndex(q => q.id === id);
            if (index !== -1) {
                quotes[index] = { ...quotes[index], ...updatedData };
                localStorage.setItem('solar_quotes', JSON.stringify(quotes));
            }
            
            // Recargar vista
            renderFilteredData();
            
            // Cerrar modal
            modal.remove();
            
            // Mostrar éxito
            showNotification('Cliente actualizado correctamente', 'success');
    });
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

window.deleteClient = function(id) {
    const client = quotes.find(q => q.id === id);
    if (!client) return;
    
    if (confirm(`¿Estás seguro de que deseas eliminar a "${client.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
        // Eliminar del localStorage garantizado
        quotes = quotes.filter(q => q.id !== id);
        localStorage.setItem('solar_quotes', JSON.stringify(quotes));
        renderFilteredData();
        showNotification('Cliente eliminado correctamente', 'success');
    }
};

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
        color: white; border-radius: 8px; z-index: 10001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ====== Funciones para cotizaciones ======

window.updateStatus = function(id, newStatus) {
    const quote = quotes.find(q => q.id === id);
    if (quote) {
        quote.status = newStatus;
        localStorage.setItem('solar_quotes', JSON.stringify(quotes));
        renderFilteredData();
    }
};

window.updateNote = function(id, noteText) {
    const quote = quotes.find(q => q.id === id);
    if (quote) {
        quote.crmNote = noteText;
        localStorage.setItem('solar_quotes', JSON.stringify(quotes));
    }
};

window.deleteQuote = function(id) {
    const quote = quotes.find(q => q.id === id);
    if (!quote) return;
    
    if (confirm(`¿Eliminar cotización de "${quote.nombre}"?\n\nCliente: ${quote.email}`)) {
        quotes = quotes.filter(q => q.id !== id);
        localStorage.setItem('solar_quotes', JSON.stringify(quotes));
        renderFilteredData();
        showNotification('Cotización eliminada', 'success');
    }
};
