const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const fileRoutes = require('./routes/file.routes');
const { mongoURI } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de EJS y layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(express.json());
app.use('/', fileRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 