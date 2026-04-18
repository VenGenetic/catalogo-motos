import Fuse from 'fuse.js';

const productos = [
  { nombre: "faro delantero honda", codigo_referencia: "F-100" },
  { nombre: "luz posterior honda", codigo_referencia: "L-200" },
  { nombre: "faro delantero yamaha", codigo_referencia: "F-300" },
];

const fuseConfig = {
  keys: ['nombre', 'codigo_referencia'],
  threshold: 0.4,
  useExtendedSearch: true, // Necessary to use complex AND/OR logic? Yes.
  ignoreLocation: true,
  includeScore: true,  
};

const fuse = new Fuse(productos, fuseConfig);

const query = {
  $and: [
    { 
       $or: [
         { $or: [{ nombre: 'faro' }, { codigo_referencia: 'faro' }] },
         { $or: [{ nombre: 'luz' }, { codigo_referencia: 'luz' }] }
       ] 
    },
    { 
       $or: [
         { $or: [{ nombre: 'honda' }, { codigo_referencia: 'honda' }] }
       ] 
    }
  ]
};

console.log("=== Buscar Objeto 'faro | luz' AND 'honda' ===");
console.log(fuse.search(query).map(r => r.item.nombre));
