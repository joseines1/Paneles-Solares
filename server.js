const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Servir archivos estáticos del directorio actual
app.use(express.static(__dirname));

// Cualquier otra ruta redirige a index.html (fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor estático corriendo en el puerto ${PORT}`);
});
