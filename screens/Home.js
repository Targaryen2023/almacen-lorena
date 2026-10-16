// screens/Home.js
// Pestaña "Productos" (Figma 04 · Productos). Es lo primero que se ve al iniciar sesión.
// TAREA 3: SOLO INTERFAZ. Los productos son de ejemplo (fijos en el código) y
// los botones Ver / Editar / Eliminar / + y el buscador todavía no hacen nada.
// "Cerrar sesión" pasó a la pestaña Perfil (tarea 4).
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORES, FUENTES, MEDIDAS, estilosComunes } from '../src/estilos';

// Datos de ejemplo, iguales al Figma. Más adelante vendrán de la base de datos.
const PRODUCTOS_EJEMPLO = [
  { id: '1', nombre: 'Yerba mate 1 kg', categoria: 'Almacén', precio: 4800, stock: 24 },
  { id: '2', nombre: 'Aceite de girasol 900 ml', categoria: 'Almacén', precio: 3200, stock: 5 },
  { id: '3', nombre: 'Leche entera 1 L', categoria: 'Lácteos', precio: 1400, stock: 32 },
];

// Desde cuántas unidades se marca "Stock bajo"
const STOCK_BAJO = 5;

// 4800 → "$4.800" (punto de miles, como en Argentina)
const formatearPrecio = (numero) => '$' + String(numero).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ---------------------------------------------------------------------------
// Botón chico de la tarjeta (ícono + texto). Sin función por ahora.
// ---------------------------------------------------------------------------
function Accion({ icono, texto, color }) {
  return (
    <TouchableOpacity style={styles.accion} hitSlop={8} accessibilityRole="button">
      <Feather name={icono} size={16} color={color} />
      <Text style={[styles.textoAccion, { color }]}>{texto}</Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta de un producto
// ---------------------------------------------------------------------------
function TarjetaProducto({ producto }) {
  const stockBajo = producto.stock <= STOCK_BAJO;

  return (
    <View style={[estilosComunes.tarjeta, styles.tarjeta]}>
      {/* Parte de arriba: imagen + datos */}
      <View style={styles.filaDatos}>
        <View style={styles.imagen}>
          <Feather name="package" size={28} color={COLORES.violeta} />
        </View>

        <View style={styles.datos}>
          <Text style={styles.nombre} numberOfLines={1}>
            {producto.nombre}
          </Text>
          <Text style={styles.categoria}>{producto.categoria}</Text>
          <Text style={styles.precio}>{formatearPrecio(producto.precio)}</Text>
        </View>

        {/* Columna derecha: etiqueta "Stock bajo" (si corresponde) y unidades */}
        <View style={styles.columnaStock}>
          {stockBajo && (
            <View style={styles.etiquetaStockBajo}>
              <Text style={styles.textoStockBajo}>Stock bajo</Text>
            </View>
          )}
          <Text style={styles.stock}>{producto.stock} unidades</Text>
        </View>
      </View>

      {/* Parte de abajo: acciones */}
      <View style={styles.filaAcciones}>
        <Accion icono="eye" texto="Ver" color={COLORES.violeta} />
        <Accion icono="edit-2" texto="Editar" color={COLORES.verde} />
        <Accion icono="trash-2" texto="Eliminar" color={COLORES.rojo} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Pantalla
// ---------------------------------------------------------------------------
export default function Home() {
  const insets = useSafeAreaInsets();

  // Resumen del encabezado, calculado a partir de los datos
  const cantidadStockBajo = PRODUCTOS_EJEMPLO.filter((p) => p.stock <= STOCK_BAJO).length;

  return (
    <View style={estilosComunes.pantalla}>
      {/* Franja celeste con título y resumen */}
      <View style={[estilosComunes.franja, { paddingTop: insets.top + 24 }]}>
        <Text style={estilosComunes.titulo}>Productos</Text>
        <Text style={estilosComunes.subtitulo}>
          {PRODUCTOS_EJEMPLO.length} productos · {cantidadStockBajo} con stock bajo
        </Text>
      </View>

      {/* FlatList: lista eficiente (solo dibuja lo que se ve en pantalla) */}
      <FlatList
        data={PRODUCTOS_EJEMPLO}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TarjetaProducto producto={item} />}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          // Buscador (todavía no filtra)
          <View style={[estilosComunes.caja, styles.buscador]}>
            <Feather
              name="search"
              size={20}
              color={COLORES.textoSuave}
              style={styles.iconoBuscar}
            />
            <TextInput
              style={estilosComunes.input}
              placeholder="Buscar producto..."
              placeholderTextColor={COLORES.textoSuave}
            />
          </View>
        }
      />

      {/* Botón flotante "+" para agregar (sin función por ahora) */}
      <TouchableOpacity
        style={styles.botonAgregar}
        accessibilityRole="button"
        accessibilityLabel="Agregar producto"
      >
        <Feather name="plus" size={30} color={COLORES.blanco} />
      </TouchableOpacity>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos (medidas del Figma 04)
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  lista: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 100 }, // abajo: lugar para el "+"

  // Buscador
  buscador: { borderRadius: 24, height: 48, marginBottom: 20 },
  iconoBuscar: { marginRight: 12 },

  // Tarjeta
  tarjeta: { marginBottom: 12, overflow: 'hidden' },
  filaDatos: { flexDirection: 'row', padding: 12 },
  imagen: {
    width: 64,
    height: 64,
    borderRadius: MEDIDAS.radioCampo,
    backgroundColor: COLORES.violetaSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datos: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  nombre: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.titulo },
  categoria: { fontFamily: FUENTES.regular, fontSize: 13, color: COLORES.textoSuave, marginTop: 2 },
  precio: { fontFamily: FUENTES.negrita, fontSize: 18, color: COLORES.violeta, marginTop: 4 },
  columnaStock: { alignItems: 'flex-end', justifyContent: 'flex-end', marginLeft: 8 },
  etiquetaStockBajo: {
    backgroundColor: COLORES.amarillo,
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  textoStockBajo: { fontFamily: FUENTES.negrita, fontSize: 12, color: COLORES.negro },
  stock: { fontFamily: FUENTES.regular, fontSize: 13, color: COLORES.textoSuave },

  // Acciones
  filaAcciones: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORES.gris,
    paddingVertical: 10,
  },
  accion: { flexDirection: 'row', alignItems: 'center' },
  textoAccion: { fontFamily: FUENTES.media, fontSize: 14, marginLeft: 6 },

  // Botón flotante
  botonAgregar: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORES.verde,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
