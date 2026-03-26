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

// Renderizar tabla Cotizaciones
function renderQuotesTable(data) {
    const quotesTbody = document.getElementById('quotesTableBody');
    quotesTbody.innerHTML = '';
    
    data.forEach(quote => {
        const dateObj = new Date(quote.created_at);
        const dateStr = isNaN(dateObj) ? '—' : dateObj.toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' });
        const statusText = quote.status || 'Nuevo';
        const badgeClass = statusText === 'En Proceso' ? 'pending' : statusText === 'Cerrado' ? 'closed' : 'new';
        const pkId = quote.id;

        const tr2 = document.createElement('tr');
        tr2.innerHTML = `
            <td><div class="client-cell"><strong>${quote.nombre || ''}</strong></div></td>
            <td>${quote.servicio || '—'}</td>
            <td>${dateStr}</td>
            <td><span class="status-badge ${badgeClass}">${statusText}</span></td>
            <td style="display:flex; gap:8px;">
                <button class="btn-action" onclick="alert('Generando PDF para ${(quote.nombre||'').replace(/'/g,'')}')">📄 PDF</button>
                <button class="btn-action" onclick="window.open('https://wa.me/52${(quote.telefono || '').replace(/\D/g,'')}?text=Hola%20${encodeURIComponent(quote.nombre||'')},%20te%20compartimos%20tu%20cotizaci%C3%B3n%20solar...','_blank')">💬 WA</button>
                <button class="btn-action" style="color:#ef4444; border-color:rgba(239,68,68,0.3);" onclick="deleteQuote(${pkId})">Del</button>
            </td>
        `;
        quotesTbody.appendChild(tr2);
    });
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
        
        try {
            // Actualizar en Supabase
            if (typeof supabaseClient !== 'undefined') {
                const { error } = await supabaseClient
                    .from('contact_messages')
                    .update(updatedData)
                    .eq('id', id);
                
                if (error) throw error;
            } else {
                // Fallback a localStorage
                const index = quotes.findIndex(q => q.id === id);
                if (index !== -1) {
                    quotes[index] = { ...quotes[index], ...updatedData };
                    localStorage.setItem('solar_quotes', JSON.stringify(quotes));
                }
            }
            
            // Actualizar datos locales
            const index = quotes.findIndex(q => q.id === id);
            if (index !== -1) {
                quotes[index] = { ...quotes[index], ...updatedData };
            }
            
            // Recargar vista
            renderFilteredData();
            
            // Cerrar modal
            modal.remove();
            
            // Mostrar éxito
            showNotification('Cliente actualizado correctamente', 'success');
            
        } catch (error) {
            console.error('Error actualizando cliente:', error);
            showNotification('Error al actualizar cliente', 'error');
        }
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
        // Eliminar de Supabase
        if (typeof supabaseClient !== 'undefined') {
            supabaseClient
                .from('contact_messages')
                .delete()
                .eq('id', id)
                .then(({ error }) => {
                    if (error) {
                        console.error('Error eliminando cliente:', error);
                        showNotification('Error al eliminar cliente', 'error');
                    } else {
                        // Eliminar del array local
                        quotes = quotes.filter(q => q.id !== id);
                        renderFilteredData();
                        showNotification('Cliente eliminado correctamente', 'success');
                    }
                });
        } else {
            // Fallback a localStorage
            quotes = quotes.filter(q => q.id !== id);
            localStorage.setItem('solar_quotes', JSON.stringify(quotes));
            renderFilteredData();
            showNotification('Cliente eliminado correctamente', 'success');
        }
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
