// src/componentes/DetalleProducto.js
// Ficha de un producto (botón "Ver"): foto grande y todos sus datos.
import React from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORES, FUENTES, MEDIDAS, estilosComunes } from '../estilos';
 
const STOCK_BAJO = 5;

const formatearPrecio = (numero) => '$' + String(numero).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
 
// Fila "Etiqueta ........ valor"
function Dato({ etiqueta, valor }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.datoEtiqueta}>{etiqueta}</Text>
      <Text style={styles.datoValor}>{valor}</Text>
    </View>
  );
}
 
// "producto" trae además "foto": la URL que se está mostrando en la tarjeta (puede estar vacía).
export default function DetalleProducto({ producto, alCerrar, alEditar }) {
  const insets = useSafeAreaInsets();
  if (!producto) return null;
 
  const stockBajo = producto.stock <= STOCK_BAJO;
 
  return (
    <Modal visible transparent animationType="slide" onRequestClose={alCerrar}>
      <View style={styles.fondo}>
        <Pressable style={StyleSheet.absoluteFill} onPress={alCerrar} accessibilityLabel="Cerrar" />
        <View style={[styles.tarjeta, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.manija} />
 
          <TouchableOpacity
            style={styles.cerrar}
            onPress={alCerrar}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Feather name="x" size={22} color={COLORES.textoSuave} />
          </TouchableOpacity>
 
          <View style={styles.imagen}>
            {producto.foto ? (
              <Image
                source={{ uri: producto.foto }}
                style={styles.fotoProducto}
                resizeMode="contain"
                accessibilityLabel={`Foto de ${producto.nombre}`}
              />
            ) : (
              <Feather name="package" size={56} color={COLORES.violeta} />
            )}
          </View>
 
          <Text style={styles.nombre}>{producto.nombre}</Text>
          <Text style={styles.precio}>{formatearPrecio(producto.precio)}</Text>
          {stockBajo && (
            <View style={styles.etiquetaStockBajo}>
              <Text style={styles.textoStockBajo}>Stock bajo</Text>
            </View>
          )}
 
          <View style={styles.datos}>
            <Dato etiqueta="Categoría" valor={producto.categoria || '—'} />
            <Dato etiqueta="Stock" valor={`${producto.stock} unidades`} />
            <Dato etiqueta="Código de barras" valor={producto.codigoBarras || '—'} />
          </View>
 
          <TouchableOpacity
            style={estilosComunes.boton}
            onPress={() => alEditar(producto)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Editar producto"
          >
            <Text style={estilosComunes.textoBoton}>Editar producto</Text>
          </TouchableOpacity>
 
          <TouchableOpacity onPress={alCerrar} style={styles.botonCerrar} accessibilityRole="button">
            <Text style={estilosComunes.enlace}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
 
const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  tarjeta: {
    backgroundColor: COLORES.blanco,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: MEDIDAS.margen,
    paddingTop: 24,
    maxHeight: '90%',
  },
  manija: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORES.gris,
    marginTop: -12,
    marginBottom: 16,
  },
  cerrar: { position: 'absolute', top: 16, right: 20, zIndex: 1 },
 
  imagen: {
    alignSelf: 'center',
    width: 180,
    height: 180,
    borderRadius: MEDIDAS.radioCampo,
    backgroundColor: COLORES.violetaSuave,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  fotoProducto: { width: '100%', height: '100%' },
 
  nombre: {
    fontFamily: FUENTES.extra,
    fontSize: 22,
    color: COLORES.titulo,
    textAlign: 'center',
  },
  precio: {
    fontFamily: FUENTES.negrita,
    fontSize: 24,
    color: COLORES.violeta,
    textAlign: 'center',
    marginTop: 4,
  },
  etiquetaStockBajo: {
    alignSelf: 'center',
    backgroundColor: COLORES.amarillo,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginTop: 10,
  },
  textoStockBajo: { fontFamily: FUENTES.negrita, fontSize: 12, color: COLORES.negro },
 
  datos: {
    marginVertical: 20,
    borderTopWidth: 1,
    borderTopColor: COLORES.gris,
  },
  dato: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.gris,
  },
  datoEtiqueta: { fontFamily: FUENTES.regular, fontSize: 15, color: COLORES.textoSuave },
  datoValor: { fontFamily: FUENTES.semi, fontSize: 15, color: COLORES.negro },
 
  botonCerrar: { alignSelf: 'center', marginTop: 14, minHeight: 24, justifyContent: 'center' },
});
 
