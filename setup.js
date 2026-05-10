/**
 * setup.js — copia todos los .env.example a .env si no existen aún.
 * Ejecutar una sola vez: node setup.js
 */
const fs = require('fs');
const path = require('path');

const services = [
  'academic-record',
  'backend-library',
  'backend-laboratories',
  'core-dwh',
];

services.forEach((service) => {
  const example = path.join(__dirname, service, '.env.example');
  const target  = path.join(__dirname, service, '.env');

  if (fs.existsSync(target)) {
    console.log(`[skip]   ${service}/.env ya existe`);
    return;
  }

  if (!fs.existsSync(example)) {
    console.log(`[warn]   ${service}/.env.example no encontrado`);
    return;
  }

  fs.copyFileSync(example, target);
  console.log(`[ok]     ${service}/.env creado — edita las credenciales`);
});

console.log('\nListo. Edita cada .env con tus credenciales reales antes de correr npm run dev.');
