import Fuse from 'fuse.js';

const productos = [
  { nombre: "Cadena dorada reforzada para moto Run" },
  { nombre: "Juego de direccionales tipo hacha" },
  { nombre: "Llanta posterior 130/70-17" },
  { nombre: "Filtro de aire de alto flujo" }
];

const fuseConfig = {
  keys: ['nombre'],
  threshold: 0.35,
  useExtendedSearch: true,
  ignoreLocation: true,
  includeScore: true,  
};

const fuse = new Fuse(productos, fuseConfig);

console.log("=== Buscar 'cadena run' ===");
console.log(fuse.search("cadena run"));

console.log("=== Buscar 'cadena rnu' (typo) ===");
console.log(fuse.search("cadena rnu"));
