// src/busqueda.js
// Filtro del buscador de productos (pestaña Productos).
// Busca en nombre, categoría y código de barras, sin distinguir
// mayúsculas ni tildes: "lacteos" encuentra "Lácteos".

// "Lácteos" → "lacteos"
// normalize('NFD') separa la letra de su tilde (á → a + ´)
// y el replace borra las tildes sueltas.
export const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

// Devuelve solo los productos que contienen el texto buscado.
// Con el buscador vacío devuelve la lista completa.
export function filtrarProductos(productos, texto) {
  const buscado = normalizar(texto);
  if (!buscado) return productos;
  return productos.filter((p) =>
    [p.nombre, p.categoria, p.codigoBarras].some((campo) => normalizar(campo).includes(buscado)),
  );
}
