// src/componentes/FormularioProducto.js
// Formulario para AGREGAR o EDITAR un producto. Se abre como hoja desde abajo
// (Modal), igual que la ficha de detalle.
//   - Si llega "producto" → modo EDITAR: los campos vienen cargados.
//   - Si "producto" es null → modo AGREGAR: los campos vienen vacíos.
// PASO 2 (tarea 2 del Sp 4): maquetación.
// PASO 3 (tarea 3 del Sp 4): validación al salir de cada campo (borde rojo / verde
//         y mensaje debajo, como el Registro). Reglas en src/validaciones.js.
//         El botón queda deshabilitado hasta que todo sea válido.
// PASO 4: guardar en Firestore con crearProducto.
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORES, FUENTES, MEDIDAS, estilosComunes } from '../estilos';
import { validarProducto } from '../validaciones';

// Valores de un formulario vacío (modo AGREGAR).
// Todo es texto porque TextInput siempre trabaja con texto;
// recién al guardar (paso 4) precio y stock se pasan a número.
const VACIO = { nombre: '', categoria: '', precio: '', stock: '', codigoBarras: '' };

// Pasa un producto de la lista (precio y stock son números) a valores de formulario.
const aValores = (producto) => ({
  nombre: producto.nombre,
  categoria: producto.categoria,
  precio: String(producto.precio),
  stock: String(producto.stock),
  codigoBarras: producto.codigoBarras,
});

// ---------------------------------------------------------------------------
// Campo: etiqueta + caja con ícono + mensaje de error debajo.
// Mismo aspecto que los campos del Registro.
//   estado: 'neutral' | 'error' | 'ok' → color del borde (se usa en el paso 3)
//   obligatorio: muestra " *"; si es false muestra el cartel "Opcional"
//   ...propsInput: el resto va directo al TextInput (value, onChangeText, etc.)
// ---------------------------------------------------------------------------
function Campo({ etiqueta, icono, obligatorio = true, estado = 'neutral', mensajeError = '', ...propsInput }) {
  const colorBorde =
    estado === 'error' ? COLORES.rojo : estado === 'ok' ? COLORES.verde : COLORES.gris;

  return (
    <View style={styles.campo}>
      <View style={styles.filaEtiqueta}>
        <Text style={estilosComunes.etiqueta}>
          {etiqueta}
          {obligatorio && <Text style={styles.asterisco}> *</Text>}
        </Text>
        {!obligatorio && (
          <View style={styles.cartelOpcional}>
            <Text style={styles.textoOpcional}>Opcional</Text>
          </View>
        )}
      </View>

      <View style={[estilosComunes.caja, { borderColor: colorBorde }]}>
        <Feather name={icono} size={20} color={COLORES.violeta} style={styles.icono} />
        <TextInput
          style={estilosComunes.input}
          placeholderTextColor={COLORES.textoSuave}
          {...propsInput}
        />
        {estado === 'ok' && <Feather name="check-circle" size={20} color={COLORES.verde} />}
      </View>

      {estado === 'error' && mensajeError !== '' && (
        <View style={styles.filaError}>
          <Feather name="alert-circle" size={14} color={COLORES.rojo} />
          <Text style={styles.textoError}>{mensajeError}</Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Formulario. Props (las manda el Home):
//   visible  → true para mostrarlo
//   producto → el producto a editar, o null para agregar uno nuevo
//   alCerrar → función que lo cierra
// ---------------------------------------------------------------------------
export default function FormularioProducto({ visible, producto, alCerrar }) {
  const insets = useSafeAreaInsets();
  const [valores, setValores] = useState(VACIO);
  // Campos que el usuario ya visitó y dejó (onBlur). El error se muestra
  // recién después de salir del campo, para no marcar rojo mientras escribe.
  const [tocados, setTocados] = useState({});

  const editando = producto != null; // true = modo EDITAR

  // Cada vez que se abre, carga los datos del producto o deja todo vacío.
  // Sin esto, al abrir "Agregar" después de "Editar" quedarían los datos viejos.
  useEffect(() => {
    if (visible) {
      setValores(editando ? aValores(producto) : VACIO);
      setTocados({}); // al abrir, ningún campo está marcado
    }
  }, [visible, producto]);

  // Cambia un solo campo y deja el resto igual: cambiar('precio', '4800')
  const cambiar = (campo, texto) => setValores((v) => ({ ...v, [campo]: texto }));

  // Marca un campo como visitado: tocar('precio')
  const tocar = (campo) => setTocados((t) => ({ ...t, [campo]: true }));

  // Se recalcula en cada render: si ya saliste del campo, el error
  // se actualiza mientras corregís (pasa de rojo a verde sin volver a salir).
  const errores = validarProducto(valores);
  const formularioValido = Object.values(errores).every((e) => e === '');

  // Qué color lleva cada campo:
  //   sin tocar → neutral · con error → rojo · bien → verde
  //   (el código de barras vacío queda neutral: es opcional)
  const estadoDe = (campo) => {
    if (!tocados[campo]) return 'neutral';
    if (errores[campo]) return 'error';
    if (valores[campo].trim() === '') return 'neutral';
    return 'ok';
  };

  // Props que repiten todos los campos: estado, mensaje y onBlur
  const validacion = (campo) => ({
    estado: estadoDe(campo),
    mensajeError: errores[campo],
    onBlur: () => tocar(campo),
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={alCerrar}>
      {/* KeyboardAvoidingView: sube el formulario cuando aparece el teclado (iOS) */}
      <KeyboardAvoidingView
        style={styles.fondo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Tocar la parte oscura de arriba también cierra */}
        <Pressable style={StyleSheet.absoluteFill} onPress={alCerrar} accessibilityLabel="Cerrar" />

        <View style={[styles.hoja, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.manija} />

          <TouchableOpacity
            style={styles.cerrar}
            onPress={alCerrar}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Feather name="x" size={22} color={COLORES.textoSuave} />
          </TouchableOpacity>

          <Text style={styles.titulo}>{editando ? 'Editar producto' : 'Nuevo producto'}</Text>

          {/* ScrollView: en celulares chicos los 5 campos no entran sin desplazar */}
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Campo
              etiqueta="Nombre"
              icono="tag"
              placeholder="Ej.: Yerba mate 1 kg"
              value={valores.nombre}
              onChangeText={(t) => cambiar('nombre', t)}
              {...validacion('nombre')}
            />
            <Campo
              etiqueta="Categoría"
              icono="grid"
              placeholder="Ej.: Almacén"
              value={valores.categoria}
              onChangeText={(t) => cambiar('categoria', t)}
              {...validacion('categoria')}
            />

            {/* Precio y stock lado a lado: son cortos */}
            <View style={styles.fila}>
              <View style={styles.mitad}>
                <Campo
                  etiqueta="Precio"
                  icono="dollar-sign"
                  placeholder="4800"
                  keyboardType="decimal-pad"
                  value={valores.precio}
                  onChangeText={(t) => cambiar('precio', t)}
                  {...validacion('precio')}
                />
              </View>
              <View style={styles.mitad}>
                <Campo
                  etiqueta="Stock"
                  icono="layers"
                  placeholder="24"
                  keyboardType="number-pad"
                  value={valores.stock}
                  onChangeText={(t) => cambiar('stock', t)}
                  {...validacion('stock')}
                />
              </View>
            </View>

            <Campo
              etiqueta="Código de barras"
              icono="hash"
              obligatorio={false}
              placeholder="Ej.: 7790387000017"
              keyboardType="number-pad"
              value={valores.codigoBarras}
              onChangeText={(t) => cambiar('codigoBarras', t)}
              {...validacion('codigoBarras')}
            />

            {/* Guardar: deshabilitado hasta que todo sea válido. Guarda en el paso 4 */}
            <TouchableOpacity
              style={[
                estilosComunes.boton,
                styles.boton,
                !formularioValido && estilosComunes.botonDeshabilitado,
              ]}
              disabled={!formularioValido}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ disabled: !formularioValido }}
            >
              <Text style={estilosComunes.textoBoton}>
                {editando ? 'Guardar cambios' : 'Agregar producto'}
              </Text>
            </TouchableOpacity>
            {!formularioValido && (
              <Text style={styles.ayudaBoton}>Completá los campos obligatorios (*)</Text>
            )}

            <TouchableOpacity onPress={alCerrar} style={styles.cancelar} accessibilityRole="button">
              <Text style={estilosComunes.enlace}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Fondo oscuro y hoja blanca desde abajo (igual que DetalleProducto)
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  hoja: {
    backgroundColor: COLORES.fondo,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: MEDIDAS.margen,
    paddingTop: 24,
    maxHeight: '92%',
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
  titulo: { fontFamily: FUENTES.extra, fontSize: 22, color: COLORES.titulo, marginBottom: 18 },

  // Campo
  campo: { marginBottom: 14 },
  filaEtiqueta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, marginLeft: 2 },
  asterisco: { color: COLORES.rojo },
  cartelOpcional: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: COLORES.gris,
  },
  textoOpcional: { fontFamily: FUENTES.media, fontSize: 11, color: COLORES.textoSuave },
  icono: { marginRight: 12 },
  filaError: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginLeft: 4 },
  textoError: { fontFamily: FUENTES.media, fontSize: 13, color: COLORES.rojo, marginLeft: 6, flexShrink: 1 },

  // Precio y stock en la misma fila
  fila: { flexDirection: 'row', gap: 12 },
  mitad: { flex: 1 },

  // Botones
  boton: { marginTop: 10 },
  ayudaBoton: {
    fontFamily: FUENTES.regular,
    fontSize: 13,
    color: COLORES.textoSuave,
    textAlign: 'center',
    marginTop: 8,
  },
  cancelar: { alignSelf: 'center', marginTop: 14, minHeight: 24, justifyContent: 'center' },
});
