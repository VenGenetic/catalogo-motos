import Fuse from 'fuse.js';

const productos = [
  { nombre: "faro delantero honda" },
  { nombre: "luz posterior honda" },
  { nombre: "faro delantero yamaha" },
  { nombre: "luz posterior yamaha" },
];

const fuseConfig = {
  keys: ['nombre'],
  threshold: 0.4,
  useExtendedSearch: true,
  ignoreLocation: true,
  includeScore: true,  
};

const fuse = new Fuse(productos, fuseConfig);

console.log("=== Buscar 'faro | luz honda' ===");
console.log(fuse.search("faro | luz honda").map(r => r.item.nombre));
