// admin-kits.js - Sistema de gestión de kits solares

// Estado global para gestión de kits
let kitsState = {
    kits: [],
    currentPage: 1,
    itemsPerPage: 10,
    editingKit: null
};

// Cargar kits desde Supabase
async function loadKits() {
    try {
        console.log('Cargando kits...');
        if (typeof supabaseClient !== 'undefined') {
            const { data, error } = await supabaseClient
                .from('kits')
                .select('*')
                .order('id', { ascending: false }); // Cambiado de created_at a id
            
            if (error) {
                console.error('Error de Supabase cargando kits:', error);
                throw error;
            }
            
            kitsState.kits = data || [];
            console.log(`Cargados ${kitsState.kits.length} kits de Supabase`);
        } else {
            kitsState.kits = JSON.parse(localStorage.getItem('solar_kits')) || [];
            console.log(`Cargados ${kitsState.kits.length} kits de localStorage`);
        }
    } catch (err) {
        console.error("Error cargando kits:", err);
        kitsState.kits = [];
        showNotification('Error al cargar kits', 'error');
    }
    
    renderKitsTable();
}

// Subir imagen a Supabase Storage
async function uploadImage(file) {
    if (!supabaseClient) {
        throw new Error('Cliente de Supabase no disponible');
    }
    
    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `kits/${fileName}`;
    
    try {
        // Subir archivo a Supabase Storage
        const { data, error } = await supabaseClient.storage
            .from('kit-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) {
            throw error;
        }
        
        // Obtener URL pública
        const { data: { publicUrl } } = supabaseClient.storage
            .from('kit-images')
            .getPublicUrl(filePath);
        
        return publicUrl;
        
    } catch (error) {
        console.error('Error en uploadImage:', error);
        throw new Error('No se pudo subir la imagen');
    }
}

// Renderizar tabla de kits
function renderKitsTable() {
    const kitsTbody = document.getElementById('kitsTableBody');
    if (!kitsTbody) {
        console.log('No se encontró kitsTableBody');
        return;
    }
    
    console.log('Renderizando tabla con', kitsState.kits.length, 'kits');
    kitsTbody.innerHTML = '';
    
    // Paginación
    const startIndex = (kitsState.currentPage - 1) * kitsState.itemsPerPage;
    const endIndex = startIndex + kitsState.itemsPerPage;
    const paginatedKits = kitsState.kits.slice(startIndex, endIndex);
    
    if (paginatedKits.length === 0) {
        kitsTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--gray-400);">No hay kits registrados</td></tr>';
        renderKitsPagination();
        return;
    }
    
    paginatedKits.forEach(kit => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="kit-cell">
                    <strong>${kit.name}</strong>
                    <small style="color:var(--gray-400); display:block;">${kit.category}</small>
                </div>
            </td>
            <td>${kit.capacity}W</td>
            <td>$${parseFloat(kit.price).toLocaleString('es-MX')}</td>
            <td>${kit.stock || 0}</td>
            <td>
                <span class="status-badge ${kit.is_active ? 'active' : 'inactive'}">
                    ${kit.is_active ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td style="display:flex; gap:8px;">
                <button class="btn-action" onclick="editKit(${kit.id})">✏️</button>
                <button class="btn-action" style="color:#ef4444; border-color:rgba(239,68,68,0.3);" onclick="deleteKit(${kit.id})">🗑️</button>
            </td>
        `;
        kitsTbody.appendChild(tr);
    });
    
    // Renderizar paginación
    renderKitsPagination();
}

// Renderizar paginación de kits
function renderKitsPagination() {
    const paginationContainer = document.getElementById('kitsPaginationContainer');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(kitsState.kits.length / kitsState.itemsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="pagination-controls">';
    
    // Botón anterior
    paginationHTML += `
        <button class="pagination-btn" ${kitsState.currentPage === 1 ? 'disabled' : ''}
                onclick="changeKitsPage(${kitsState.currentPage - 1})">
            ← Anterior
        </button>
    `;
    
    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === kitsState.currentPage ? 'active' : ''}"
                    onclick="changeKitsPage(${i})">${i}</button>
        `;
    }
    
    // Botón siguiente
    paginationHTML += `
        <button class="pagination-btn" ${kitsState.currentPage === totalPages ? 'disabled' : ''}
                onclick="changeKitsPage(${kitsState.currentPage + 1})">
            Siguiente →
        </button>
    `;
    
    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

// Cambiar página de kits
function changeKitsPage(page) {
    const totalPages = Math.ceil(kitsState.kits.length / kitsState.itemsPerPage);
    
    if (page >= 1 && page <= totalPages) {
        kitsState.currentPage = page;
        renderKitsTable();
    }
}

// Mostrar modal para agregar/editar kit
function showKitModal(kit = null) {
    kitsState.editingKit = kit;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); display: flex; align-items: center;
        justify-content: center; z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: var(--secondary-dark); padding: 2rem; border-radius: 12px; width: 90%; max-width: 600px; border: 1px solid rgba(255,255,255,0.1); max-height: 90vh; overflow-y: auto;">
            <h3 style="margin-bottom: 1.5rem; color: var(--white);">${kit ? 'Editar Kit' : 'Agregar Nuevo Kit'}</h3>
            <form id="kitForm">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Nombre del Kit *</label>
                        <input type="text" id="kitName" value="${kit?.name || ''}" class="admin-input" required style="width: 100%;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Categoría *</label>
                        <select id="kitCategory" class="admin-select" required style="width: 100%;">
                            <option value="">Seleccionar...</option>
                            <option value="Residencial" ${kit?.category === 'Residencial' ? 'selected' : ''}>Residencial</option>
                            <option value="Comercial" ${kit?.category === 'Comercial' ? 'selected' : ''}>Comercial</option>
                            <option value="Industrial" ${kit?.category === 'Industrial' ? 'selected' : ''}>Industrial</option>
                        </select>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Capacidad (W) *</label>
                        <input type="number" id="kitCapacity" value="${kit?.capacity || ''}" class="admin-input" required style="width: 100%;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Precio (MXN) *</label>
                        <input type="number" id="kitPrice" value="${kit?.price || ''}" step="0.01" class="admin-input" required style="width: 100%;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Stock *</label>
                        <input type="number" id="kitStock" value="${kit?.stock || 0}" class="admin-input" required style="width: 100%;">
                    </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Descripción</label>
                    <textarea id="kitDescription" class="admin-input" rows="3" style="width: 100%; resize: vertical;">${kit?.description || ''}</textarea>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Imagen del Kit</label>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <input type="file" id="kitImage" accept="image/*" style="display: none;">
                        <button type="button" onclick="document.getElementById('kitImage').click()" class="btn-secondary" style="padding: 0.5rem 1rem;">
                            📷 Seleccionar Imagen
                        </button>
                        <span id="imageFileName" style="color: var(--gray-400); font-size: 0.9rem;">
                            ${kit?.image_url ? 'Imagen actual: ' + kit.image_url.split('/').pop() : 'Ninguna imagen seleccionada'}
                        </span>
                    </div>
                    <div id="imagePreview" style="margin-top: 1rem;">
                        ${kit?.image_url ? `<img src="${kit.image_url}" alt="Vista previa" style="max-width: 200px; max-height: 150px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">` : ''}
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Número de Paneles *</label>
                        <input type="number" id="kitPanels" value="${kit?.panels || ''}" class="admin-input" required style="width: 100%;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Inversor (kW) *</label>
                        <input type="number" id="kitInverter" value="${kit?.inverter || ''}" step="0.1" class="admin-input" required style="width: 100%;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Batería (kWh)</label>
                        <input type="number" id="kitBattery" value="${kit?.battery || ''}" step="0.1" class="admin-input" style="width: 100%;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--gray-300);">Garantía (años)</label>
                        <input type="number" id="kitWarranty" value="${kit?.warranty || ''}" class="admin-input" style="width: 100%;">
                    </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--gray-300); cursor: pointer;">
                        <input type="checkbox" id="kitIsActive" ${kit?.is_active !== false ? 'checked' : ''} style="margin: 0;">
                        Kit Activo
                    </label>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button type="button" onclick="this.closest('.modal-overlay').remove()" class="btn-secondary" style="padding: 0.5rem 1rem;">Cancelar</button>
                    <button type="submit" class="btn-primary" style="padding: 0.5rem 1rem;">${kit ? 'Actualizar' : 'Agregar'} Kit</button>
                </div>
            </form>
        </div>
    `;
    
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
    
    // Manejar envío del formulario
    document.getElementById('kitForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validar campos requeridos
        const name = document.getElementById('kitName').value.trim();
        const category = document.getElementById('kitCategory').value;
        const capacity = document.getElementById('kitCapacity').value;
        const price = document.getElementById('kitPrice').value;
        const stock = document.getElementById('kitStock').value;
        const panels = document.getElementById('kitPanels').value;
        const inverter = document.getElementById('kitInverter').value;
        
        if (!name || !category || !capacity || !price || !stock || !panels || !inverter) {
            showNotification('Por favor completa todos los campos requeridos', 'error');
            return;
        }
        
        let imageUrl = kit?.image_url || null;
        
        // Subir imagen si se seleccionó una nueva
        const imageFile = document.getElementById('kitImage').files[0];
        if (imageFile) {
            try {
                showNotification('Subiendo imagen...', 'info');
                imageUrl = await uploadImage(imageFile);
                showNotification('Imagen subida correctamente', 'success');
            } catch (error) {
                console.error('Error subiendo imagen:', error);
                showNotification('Error al subir la imagen', 'error');
                return;
            }
        }
        
        const kitData = {
            name: name,
            category: category,
            capacity: parseInt(capacity),
            price: parseFloat(price),
            stock: parseInt(stock),
            description: document.getElementById('kitDescription').value.trim(),
            panels: parseInt(panels),
            inverter: parseFloat(inverter),
            battery: document.getElementById('kitBattery').value ? parseFloat(document.getElementById('kitBattery').value) : null,
            warranty: document.getElementById('kitWarranty').value ? parseInt(document.getElementById('kitWarranty').value) : null,
            image_url: imageUrl,
            is_active: document.getElementById('kitIsActive').checked
        };
        
        console.log('Datos del kit a guardar:', kitData);
        
        try {
            if (kit) {
                // Actualizar kit existente
                console.log('Actualizando kit existente:', kit.id);
                if (typeof supabaseClient !== 'undefined') {
                    const { error } = await supabaseClient
                        .from('kits')
                        .update(kitData)
                        .eq('id', kit.id);
                    
                    if (error) {
                        console.error('Error de Supabase al actualizar:', error);
                        throw error;
                    }
                    console.log('Kit actualizado exitosamente en Supabase');
                } else {
                    const index = kitsState.kits.findIndex(k => k.id === kit.id);
                    if (index !== -1) {
                        kitsState.kits[index] = { ...kitsState.kits[index], ...kitData };
                        localStorage.setItem('solar_kits', JSON.stringify(kitsState.kits));
                    }
                }
                showNotification('Kit actualizado correctamente', 'success');
            } else {
                // Agregar nuevo kit
                console.log('Agregando nuevo kit...');
                if (typeof supabaseClient !== 'undefined') {
                    const { data, error } = await supabaseClient
                        .from('kits')
                        .insert([kitData])
                        .select();
                    
                    if (error) {
                        console.error('Error de Supabase al insertar:', error);
                        throw error;
                    }
                    console.log('Kit insertado exitosamente:', data);
                    kitsState.kits.unshift(data[0]);
                } else {
                    const newKit = { ...kitData, id: Date.now() };
                    kitsState.kits.unshift(newKit);
                    localStorage.setItem('solar_kits', JSON.stringify(kitsState.kits));
                }
                showNotification('Kit agregado correctamente', 'success');
            }
            
            renderKitsTable();
            modal.remove();
            
        } catch (error) {
            console.error('Error guardando kit:', error);
            let errorMessage = 'Error al guardar kit';
            
            if (error.message) {
                if (error.message.includes('duplicate key')) {
                    errorMessage = 'Ya existe un kit con ese nombre';
                } else if (error.message.includes('null value')) {
                    errorMessage = 'Faltan campos requeridos';
                } else if (error.message.includes('invalid input')) {
                    errorMessage = 'Verifica los valores numéricos';
                } else {
                    errorMessage = `Error: ${error.message}`;
                }
            }
            
            showNotification(errorMessage, 'error');
        }
    });
    
    // Manejar selección de imagen
    document.getElementById('kitImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                showNotification('Por favor selecciona un archivo de imagen válido', 'error');
                e.target.value = '';
                return;
            }
            
            // Validar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('La imagen no debe superar los 5MB', 'error');
                e.target.value = '';
                return;
            }
            
            // Mostrar vista previa
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('imagePreview').innerHTML = 
                    `<img src="${e.target.result}" alt="Vista previa" style="max-width: 200px; max-height: 150px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">`;
                document.getElementById('imageFileName').textContent = `Archivo: ${file.name}`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Editar kit
function editKit(id) {
    const kit = kitsState.kits.find(k => k.id === id);
    if (kit) {
        showKitModal(kit);
    }
}

// Eliminar kit
function deleteKit(id) {
    const kit = kitsState.kits.find(k => k.id === id);
    if (!kit) return;
    
    if (confirm(`¿Estás seguro de que deseas eliminar el kit "${kit.name}"?\n\nEsta acción no se puede deshacer.`)) {
        if (typeof supabaseClient !== 'undefined') {
            supabaseClient
                .from('kits')
                .delete()
                .eq('id', id)
                .then(({ error }) => {
                    if (error) {
                        console.error('Error eliminando kit:', error);
                        showNotification('Error al eliminar kit', 'error');
                    } else {
                        kitsState.kits = kitsState.kits.filter(k => k.id !== id);
                        renderKitsTable();
                        showNotification('Kit eliminado correctamente', 'success');
                    }
                });
        } else {
            kitsState.kits = kitsState.kits.filter(k => k.id !== id);
            localStorage.setItem('solar_kits', JSON.stringify(kitsState.kits));
            renderKitsTable();
            showNotification('Kit eliminado correctamente', 'success');
        }
    }
}

// Mostrar notificación (reutilizar función existente)
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

// Hacer funciones globales
window.showKitModal = showKitModal;
window.editKit = editKit;
window.deleteKit = deleteKit;
window.changeKitsPage = changeKitsPage;
window.loadKits = loadKits;
