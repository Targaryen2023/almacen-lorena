// src/componentes/ConfirmarInactivar.js
// Ventana de confirmación (hoja desde abajo) antes de inactivar un producto.
// Inactivar = borrado lógico: el producto se oculta de la lista pero sus datos se conservan.
//   - producto: el producto a inactivar (null = ventana cerrada)
//   - alCancelar: se llama al cerrar sin inactivar
//   - alConfirmar: función async que inactiva; si falla, se muestra el error acá
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORES, FUENTES, MEDIDAS, estilosComunes } from '../estilos';

export default function ConfirmarInactivar({ producto, alCancelar, alConfirmar }) {
  const insets = useSafeAreaInsets();
  const [inactivando, setInactivando] = useState(false); // true mientras espera a Firestore
  const [error, setError] = useState('');
  if (!producto) return null;

  const cancelar = () => {
    setError('');
    alCancelar();
  };

  const confirmar = async () => {
    if (inactivando) return;
    setInactivando(true);
    setError('');
    try {
      await alConfirmar(producto); // si sale bien, el Home cierra esta ventana
    } catch (e) {
      console.warn('Error al inactivar producto:', e.code);
      setError('No se pudo inactivar. Revisá tu conexión e intentá de nuevo.');
    } finally {
      setInactivando(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={cancelar}>
      <View style={styles.fondo}>
        <Pressable style={StyleSheet.absoluteFill} onPress={cancelar} accessibilityLabel="Cerrar" />
        <View style={[styles.tarjeta, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.manija} />

          <View style={styles.circulo}>
            <Feather name="archive" size={28} color={COLORES.violeta} />
          </View>

          <Text style={styles.titulo}>Inactivar producto</Text>
          <Text style={styles.texto}>
            <Text style={styles.nombre}>{producto.nombre}</Text> dejará de aparecer en la lista,
            pero sus datos se conservan.
          </Text>

          {error !== '' && (
            <View style={styles.cartelError}>
              <Feather name="alert-circle" size={18} color={COLORES.rojo} />
              <Text style={styles.textoError}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[estilosComunes.botonSecundario, inactivando && estilosComunes.botonDeshabilitado]}
            onPress={confirmar}
            disabled={inactivando}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Inactivar producto"
          >
            {inactivando ? (
              <ActivityIndicator color={COLORES.rojo} />
            ) : (
              <Text style={estilosComunes.textoBotonSecundario}>Inactivar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={cancelar} style={styles.botonCancelar} accessibilityRole="button">
            <Text style={estilosComunes.enlace}>Cancelar</Text>
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
  circulo: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORES.violetaSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  titulo: {
    fontFamily: FUENTES.extra,
    fontSize: 22,
    color: COLORES.titulo,
    textAlign: 'center',
  },
  texto: {
    fontFamily: FUENTES.regular,
    fontSize: 15,
    lineHeight: 22,
    color: COLORES.textoSuave,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  nombre: { fontFamily: FUENTES.negrita, color: COLORES.titulo },
  cartelError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.rojoSuave,
    borderRadius: MEDIDAS.radioCampo,
    padding: 12,
    marginBottom: 16,
  },
  textoError: { flex: 1, fontFamily: FUENTES.media, fontSize: 14, color: COLORES.rojo, marginLeft: 8 },
  botonCancelar: { alignSelf: 'center', marginTop: 14, minHeight: 24, justifyContent: 'center' },
});
