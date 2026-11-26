import {
        addDoc,
        collection,
        deleteDoc,
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
        const lista = snapshot.docs.map(aProducto);
        lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
        alRecibir(lista);
    },
    alFallar,
  );
}

// Crea un producto nuevo.
export async function crearProducto(datos) {
  const referencia = await addDoc(collection(db, 'productos'), aDocumento(datos));
  return referencia.id;
}
 
// Modifica un producto que ya existe.
export async function actualizarProducto(id, datos) {
  await updateDoc(doc(db, 'productos', id), aDocumento(datos));
}
 
// Borra un producto.
export async function eliminarProducto(id) {
  await deleteDoc(doc(db, 'productos', id));
}