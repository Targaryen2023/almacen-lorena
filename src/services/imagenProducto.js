// Busca la foto del producto en OpenFoodFacts por código de barras.
// Devuelve la URL, o '' si no hay código o no se encontró foto.
export async function buscarImagenProducto({ codigoBarras }) {
  if (!codigoBarras) return '';
  try {
    const r = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(codigoBarras)}.json?fields=image_url`
    );
    if (!r.ok) return '';
    const d = await r.json();
    return d.status === 1 && d.product?.image_url ? d.product.image_url : '';
  } catch (error) {
    console.warn('No se pudo obtener la foto en OpenFoodFacts:', error.message);
    return '';
  }
}