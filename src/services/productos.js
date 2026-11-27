import {
        addDoc,
        collection,
        doc,
        onSnapshot,
        updateDoc,
    } from 'firebase/firestore';

import {db} from '../config/firebaseConfig';

// Convierte un documento de Firestore al formato que usa la app.
// (En Firestore el nombre se llama "prod_nombre"; en la app, "nombre".)
const aProducto = (documento) => {
    const d = documento.data();
    return {
        id: documento.id,
        nombre: d.prod_nombre ?? '',
        categoria: d.categoria ?? '',
        precio:Number(d.precio) || 0,
        stock:Number(d.stock) || 0,
        codigoBarras: d.codigoBarras ? String(d.codigoBarras) : '',
        imagen_url: d.imagen_url || '',
        activo: d.activo !== false, // los productos viejos no tienen el campo: cuentan como activos
    };
};

const aDocumento = ({nombre, categoria, precio, stock, codigoBarras, imagen_url}) => ({
    prod_nombre: nombre.trim(),
    categoria,
    precio: Number(precio),
    stock: Number(stock),
    codigoBarras: (codigoBarras || '').trim(),
    imagen_url: imagen_url || '',
});


// Devuelve una función para dejar de escuchar (se llama al salir de la pantalla).
export function escucharProductos(alRecibir, alFallar) {
    return onSnapshot(
     collection(db, 'productos'),
     (snapshot) => {
        const lista = snapshot.docs.map(aProducto).filter((p) => p.activo); // los inactivos no se muestran
        lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
        alRecibir(lista);
    },
    alFallar,
  );
}

// Crea un producto nuevo.
export async function crearProducto(datos) {
  const referencia = await addDoc(collection(db, 'productos'), {
    ...aDocumento(datos),
    origen: datos.origen || 'propio', // 'muestra' = producto de ejemplo
    activo: true,
  });
  return referencia.id;
}
 
// Modifica un producto que ya existe.
export async function actualizarProducto(id, datos) {
  await updateDoc(doc(db, 'productos', id), aDocumento(datos));
}
 
// Borrado lógico: el producto no se borra de Firestore, se marca como inactivo
// y deja de mostrarse en la lista.
export async function inactivarProducto(id) {
  await updateDoc(doc(db, 'productos', id), { activo: false });
}