import Fuse from 'fuse.js';

const productos = [
  { nombre: "Cadena dorada reforzada para moto Run" },
];

const fuseConfig = {
  keys: ['nombre'],
  threshold: 0.4,
  useExtendedSearch: true,
  ignoreLocation: true,
  includeScore: true,  
};

const fuse = new Fuse(productos, fuseConfig);

console.log("=== Buscar 'cadena honda' ===");
console.log(fuse.search("cadena honda"));
