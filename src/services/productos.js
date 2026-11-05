import {collection, onSnapshot} from 'firebase/firestore';
import {db} from '../config/firebaseConfig';

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