// admin-quotations.js - Sistema de cotizaciones con barra de progreso y exportación a PDF

// Estilos de pipeline (estados de progreso)
const QUOTATION_PIPELINE = {
    10: { label: 'Cotización Enviada', color: '#3b82f6', icon: '📮' },
    20: { label: 'Espera Respuesta', color: '#8b5cf6', icon: '⏳' },
    40: { label: 'Cliente Interesado', color: '#f59e0b', icon: '👍' },
    60: { label: 'En Negociación', color: '#10b981', icon: '💼' },
    80: { label: 'En Instalación', color: '#f97316', icon: '🔧' },
    100: { label: 'Completada', color: '#34d399', icon: '✅' }
};

// Obtener el progreso por estado
function getProgressFromStatus(status) {
    const progressMap = {
        'Nuevo': 10,
        'En Proceso': 40,
        'Cerrado': 100
    };
    return progressMap[status] || 10;
}

// Obtener estado por progreso
function getStatusFromProgress(progress) {
    if (progress <= 20) return 'Nuevo';
    if (progress <= 80) return 'En Proceso';
    return 'Cerrado';
}

// Renderizar barra de progreso visual
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
                <select class="admin-select progress-selector" onchange="updateQuotationProgress(this.dataset.quoteId, this.value)" data-quote-id="" style="height: 32px; font-size: 0.8rem;">
                    <option value="10" ${progress === 10 ? 'selected' : ''}>10% - Enviada</option>
                    <option value="20" ${progress === 20 ? 'selected' : ''}>20% - Espera</option>
                    <option value="40" ${progress === 40 ? 'selected' : ''}>40% - Interesado</option>
                    <option value="60" ${progress === 60 ? 'selected' : ''}>60% - Negociación</option>
                    <option value="80" ${progress === 80 ? 'selected' : ''}>80% - Instalando</option>
                    <option value="100" ${progress === 100 ? 'selected' : ''}>100% - Completada</option>
                </select>
            </div>
        </div>
    `;
}

// Actualizar progreso de cotización
function updateQuotationProgress(quoteId, newProgress) {
    const quotes = JSON.parse(localStorage.getItem('solar_quotes')) || [];
    const quote = quotes.find(q => q.id === parseInt(quoteId));
    
    if (quote) {
        quote.progress = parseInt(newProgress);
        quote.status = getStatusFromProgress(parseInt(newProgress));
        quote.updated_at = new Date().toISOString();
        localStorage.setItem('solar_quotes', JSON.stringify(quotes));
        renderFilteredData();
        showNotification(`Cotización actualizada al ${newProgress}%`, 'success');
    }
}

// Generar PDF de cotización
async function generateQuotationPDF(quoteId) {
    try {
        const quotes = JSON.parse(localStorage.getItem('solar_quotes')) || [];
        const quote = quotes.find(q => q.id === parseInt(quoteId));
        
        if (!quote) {
            showNotification('Cotización no encontrada', 'error');
            return;
        }

        const kits = JSON.parse(localStorage.getItem('solar_kits')) || [];
        
        // Crear documento PDF
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Configurar fuentes
        doc.setFont('Helvetica');
        
        // Header
        doc.setFillColor(249, 115, 22); // Orange
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('☀️ SOLAR WEB', 20, 20);
        
        // Empresa info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text('www.solarweb.com | Tel: +52 123 456 7890', 20, 42);
        
        // Título
        doc.setFontSize(16);
        doc.setFont('Helvetica', 'bold');
        doc.text('COTIZACIÓN DE SISTEMA SOLAR', 20, 55);
        
        // Información del cliente
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(11);
        doc.text('CLIENTE:', 20, 70);
        doc.setFont('Helvetica', 'bold');
        doc.text(quote.nombre || 'N/A', 50, 70);
        
        doc.setFont('Helvetica', 'normal');
        doc.text('Empresa:', 20, 80);
        doc.setFont('Helvetica', 'bold');
        doc.text(quote.empresa || 'Persona Física', 50, 80);
        
        doc.setFont('Helvetica', 'normal');
        doc.text('Email:', 20, 90);
        doc.setFont('Helvetica', 'bold');
        doc.text(quote.email || 'N/A', 50, 90);
        
        doc.setFont('Helvetica', 'normal');
        doc.text('Teléfono:', 20, 100);
        doc.setFont('Helvetica', 'bold');
        doc.text(quote.telefono || 'N/A', 50, 100);
        
        // Detalles de la solicitud
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(11);
        doc.text('DETALLES DE LA SOLICITUD:', 20, 115);
        
        doc.setFont('Helvetica', 'bold');
        doc.text('Servicio:', 20, 125);
        doc.setFont('Helvetica', 'normal');
        doc.text(quote.servicio || 'No especificado', 70, 125);
        
        doc.setFont('Helvetica', 'bold');
        doc.text('Consumo/Necesidad:', 20, 135);
        doc.setFont('Helvetica', 'normal');
        const splitMsg = doc.splitTextToSize(quote.mensaje || 'N/A', 110);
        doc.text(splitMsg, 70, 135);
        
        // Kits recomendados
        let yPos = 155;
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('KITS SOLARES RECOMENDADOS:', 20, yPos);
        yPos += 10;
        
        kits.slice(0, 3).forEach((kit, index) => {
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(`${index + 1}. ${kit.nombre || kit.name}`, 20, yPos);
            
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(9);
            const potencia = kit.potencia || kit.capacity || 'N/A';
            const precio = '$' + (kit.precio || kit.price || 0).toLocaleString('es-MX');
            doc.text(`Potencia: ${potencia}kW | Precio: ${precio}`, 30, yPos + 5);
            
            yPos += 10;
            
            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }
        });
        
        // Pie de página
        doc.setFont('Helvetica', 'italic');
        doc.setFontSize(9);
        doc.text('Esta cotización es válida por 30 días. Para más información contacte con nuestro equipo.', 20, 280);
        doc.text(`Generada: ${new Date().toLocaleDateString('es-MX')}`, 20, 285);
        
        // Descargar
        const filename = `Cotizacion_${quote.nombre || 'Cliente'}_${new Date().getTime()}.pdf`;
        doc.save(filename);
        
        showNotification(`PDF descargado: ${filename}`, 'success');
    } catch (error) {
        console.error('Error generando PDF:', error);
        showNotification('Error al generar PDF: ' + error.message, 'error');
    }
}

// Enviar cotización por email
function sendQuotationByEmail(quoteId) {
    const quotes = JSON.parse(localStorage.getItem('solar_quotes')) || [];
    const quote = quotes.find(q => q.id === parseInt(quoteId));
    
    if (!quote) {
        showNotification('Cotización no encontrada', 'error');
        return;
    }

    const subject = encodeURIComponent('Tu Cotización Solar de SolarWeb');
    const body = encodeURIComponent(
        `Hola ${quote.nombre},\n\n` +
        `Te compartimos tu cotización personalizada de sistema solar.\n\n` +
        `Servicio: ${quote.servicio}\n` +
        `Fecha: ${new Date().toLocaleDateString('es-MX')}\n\n` +
        `Para ver la cotización detallada, por favor descarga el PDF adjunto.\n\n` +
        `¿Preguntas? Contáctanos en www.solarweb.com\n\n` +
        `Saludos cordiales,\n` +
        `Equipo de SolarWeb`
    );
    
    // Abrir cliente de email
    window.open(`mailto:${quote.email}?subject=${subject}&body=${body}`);
    
    showNotification(`Abriendo cliente de email para ${quote.email}`, 'success');
    
    // Registrar envío en historial
    quote.lastEmailSent = new Date().toISOString();
    localStorage.setItem('solar_quotes', JSON.stringify(quotes));
}

// Enviar cotización por WhatsApp
function sendQuotationByWhatsApp(quoteId) {
    const quotes = JSON.parse(localStorage.getItem('solar_quotes')) || [];
    const quote = quotes.find(q => q.id === parseInt(quoteId));
    
    if (!quote) {
        showNotification('Cotización no encontrada', 'error');
        return;
    }

    const phoneNumber = quote.telefono.replace(/\D/g, '');
    const message = encodeURIComponent(
        `Hola ${quote.nombre}! 👋\n\n` +
        `Te compartimos tu cotización de sistema solar ☀️\n\n` +
        `📊 Servicio: ${quote.servicio}\n` +
        `📅 Fecha: ${new Date().toLocaleDateString('es-MX')}\n\n` +
        `Para ver los detalles completos, puedes descargar el PDF desde tu panel.\n\n` +
        `¿Preguntas? Estamos aquí para ayudarte. Responde este mensaje o llámanos. 📞`
    );
    
    const whatsappUrl = `https://wa.me/52${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    showNotification(`Abriendo WhatsApp para +52${phoneNumber}`, 'success');
    
    // Registrar envío en historial
    quote.lastWhatsAppSent = new Date().toISOString();
    localStorage.setItem('solar_quotes', JSON.stringify(quotes));
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: #10b981;' : type === 'error' ? 'background: #ef4444;' : 'background: #3b82f6;'}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// CSS para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .progress-container {
        background: rgba(0, 0, 0, 0.1);
        padding: 15px;
        border-radius: 8px;
        margin: 10px 0;
        border-left: 4px solid var(--primary);
    }
    
    .progress-bar-wrapper {
        width: 100%;
        height: 28px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        overflow: hidden;
        margin-bottom: 10px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        position: relative;
    }
    
    .progress-bar-fill {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: width 0.4s ease;
        min-width: 0;
    }
    
    .progress-text {
        color: white;
        font-size: 0.75rem;
        font-weight: bold;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    .progress-label {
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 10px;
    }
    
    .progress-controls {
        display: flex;
        gap: 10px;
    }
    
    .progress-selector {
        flex: 1;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: var(--gray-200);
        padding: 6px 10px;
        border-radius: 6px;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
    }
    
    .progress-selector:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: var(--primary);
    }
    
    .progress-selector option {
        background: #1e293b;
        color: white;
    }
    
    .notification {
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }
`;
document.head.appendChild(style);
