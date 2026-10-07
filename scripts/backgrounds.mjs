// Genera los fondos optimizados de public/bg a partir de las fotos originales en assets/
import sharp from 'sharp';

const src = 'assets/bosque-original.jpg';
await sharp(src).resize({ width: 2560 }).webp({ quality: 72 }).toFile('public/bg/bosque-2560.webp');
await sharp(src).resize({ width: 360, height: 240, fit: 'cover' }).webp({ quality: 70 }).toFile('public/bg/bosque-thumb.webp');
console.log('Fondos generados');
