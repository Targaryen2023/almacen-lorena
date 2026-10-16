// src/estilos.js
// Estilos comunes de la app, basados en el Manual de Identidad de Almacén Lorena
// y en las pantallas del Figma. Todas las pantallas importan de acá para verse iguales.
import { StyleSheet } from 'react-native';

// ---------------------------------------------------------------------------
// COLORES
// ---------------------------------------------------------------------------
export const COLORES = {
  // Paleta del manual
  celeste: '#ADE3FF', // franjas superiores
  violeta: '#8C63D6', // íconos, enlaces, precios
  negro: '#100F13', // texto principal
  rojo: '#E1493D', // errores, eliminar, cerrar sesión
  gris: '#D9D9D9', // bordes neutros
  amarillo: '#FFDE59', // etiqueta "Stock bajo"

  // Tomados del Figma (no están en la paleta del manual)
  verde: '#5E9136', // botón principal y estados "cumplido" (el manual lo nombra en el logotipo)
  fondo: '#F3F9FF', // fondo de las pantallas
  titulo: '#2B2452', // títulos
  textoSuave: '#6B6880', // subtítulos, placeholders y ayudas
  violetaSuave: '#EFE8FA', // fondo de íconos y pestaña activa
  rojoSuave: '#FDECEA', // fondo de carteles de error
  verdeSuave: '#EEF6E8', // fondo de carteles de éxito
  blanco: '#FFFFFF',
};

// ---------------------------------------------------------------------------
// TIPOGRAFÍA: Montserrat (manual). Se carga en App.js con useFonts.
// Con fuentes propias, el grosor se elige por NOMBRE de fuente,
// no con fontWeight (en Android fontWeight no cambia la fuente).
// ---------------------------------------------------------------------------
export const FUENTES = {
  regular: 'Montserrat_400Regular',
  media: 'Montserrat_500Medium',
  semi: 'Montserrat_600SemiBold',
  negrita: 'Montserrat_700Bold',
  extra: 'Montserrat_800ExtraBold',
};

// Medidas del Figma (pantalla de 390 px)
export const MEDIDAS = {
  margen: 24, // margen lateral
  radioCampo: 12, // esquinas de campos y tarjetas
  radioBoton: 14, // esquinas de botones
  altoCampo: 52,
  altoBoton: 56,
};

// ---------------------------------------------------------------------------
// ESTILOS COMUNES (se combinan con los de cada pantalla)
// ---------------------------------------------------------------------------
export const estilosComunes = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.fondo },

  // Franja celeste superior
  franja: {
    backgroundColor: COLORES.celeste,
    paddingHorizontal: MEDIDAS.margen,
    paddingBottom: 20,
  },

  // Textos
  titulo: { fontFamily: FUENTES.extra, fontSize: 30, color: COLORES.titulo },
  subtitulo: { fontFamily: FUENTES.regular, fontSize: 14, color: COLORES.textoSuave },
  etiqueta: { fontFamily: FUENTES.media, fontSize: 14, color: COLORES.negro },
  enlace: { fontFamily: FUENTES.negrita, fontSize: 15, color: COLORES.violeta },

  // Caja de un campo de texto
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    height: MEDIDAS.altoCampo,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: COLORES.gris,
    borderRadius: MEDIDAS.radioCampo,
    backgroundColor: COLORES.blanco,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: FUENTES.regular,
    fontSize: 16,
    color: COLORES.negro,
  },

  // Botón principal (verde) y secundario (borde rojo, ej. "Cerrar sesión")
  boton: {
    height: MEDIDAS.altoBoton,
    borderRadius: MEDIDAS.radioBoton,
    backgroundColor: COLORES.verde,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBoton: { fontFamily: FUENTES.negrita, fontSize: 18, color: COLORES.blanco },
  botonDeshabilitado: { opacity: 0.45 },
  botonSecundario: {
    height: 52,
    borderRadius: MEDIDAS.radioBoton,
    borderWidth: 1.5,
    borderColor: COLORES.rojo,
    backgroundColor: COLORES.blanco,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotonSecundario: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.rojo },

  // Tarjeta blanca (productos, etc.)
  tarjeta: {
    backgroundColor: COLORES.blanco,
    borderRadius: MEDIDAS.radioCampo,
    borderWidth: 1,
    borderColor: COLORES.gris,
  },
});
