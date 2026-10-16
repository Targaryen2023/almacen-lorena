// screens/Perfil.js
// Pestaña "Perfil" (Figma 09 · Perfil).
// TAREA 4: INTERFAZ + Cerrar sesión funcionando.
//   - Nombre y correo se completan con los datos de la cuenta (Firebase).
//   - "Guardar cambios", el lápiz del avatar y el teléfono todavía NO guardan nada.
//   - "Cerrar sesión" SÍ funciona: al cerrar, Navigation muestra Login solo.
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { COLORES, FUENTES, estilosComunes } from '../src/estilos';

// Rol fijo como en el Figma; los roles se definen más adelante.
const ROL = 'Administradora';

// ---------------------------------------------------------------------------
// Campo con etiqueta e ícono (mismo aspecto que en el registro)
// ---------------------------------------------------------------------------
function CampoPerfil({ etiqueta, icono, ...propsInput }) {
  return (
    <View style={styles.campo}>
      <Text style={[estilosComunes.etiqueta, styles.etiqueta]}>{etiqueta}</Text>
      <View style={estilosComunes.caja}>
        <Feather name={icono} size={20} color={COLORES.violeta} style={styles.icono} />
        <TextInput
          style={estilosComunes.input}
          placeholderTextColor={COLORES.textoSuave}
          {...propsInput}
        />
      </View>
    </View>
  );
}

export default function Perfil() {
  const insets = useSafeAreaInsets();

  // Usuario con sesión iniciada. displayName = "Nombre Apellido" guardado en el registro.
  const usuario = auth.currentUser;
  const [nombre, setNombre] = useState(usuario?.displayName ?? '');
  const [correo, setCorreo] = useState(usuario?.email ?? '');
  const [telefono, setTelefono] = useState('');

  const [cerrando, setCerrando] = useState(false);
  const [error, setError] = useState('');

  // Inicial del avatar: primera letra del nombre (o del correo si no hay nombre)
  const inicial = (nombre.trim() || correo || '?').charAt(0).toUpperCase();

  // Cerrar sesión: Firebase avisa a Navigation (onAuthStateChanged) y aparece Login.
  const handleCerrarSesion = async () => {
    setCerrando(true);
    setError('');
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Error al cerrar sesión:', e.code);
      setError('No se pudo cerrar la sesión. Intentá de nuevo.');
      setCerrando(false);
    }
  };

  return (
    <View style={estilosComunes.pantalla}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Franja celeste: título + avatar */}
        <View style={[estilosComunes.franja, styles.franja, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.tituloFranja}>Mi perfil</Text>

          <View style={styles.avatar}>
            <Text style={styles.inicial}>{inicial}</Text>
            {/* Lápiz para cambiar la foto (sin función por ahora) */}
            <TouchableOpacity style={styles.botonEditarFoto} accessibilityLabel="Cambiar foto">
              <Feather name="edit-2" size={13} color={COLORES.blanco} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contenido}>
          {/* Nombre y rol */}
          <Text style={styles.nombreUsuario}>{nombre || 'Sin nombre'}</Text>
          <Text style={[estilosComunes.subtitulo, styles.rol]}>{ROL}</Text>

          <CampoPerfil
            etiqueta="Nombre completo"
            icono="user"
            placeholder="Ej: María Gómez"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
          />
          <CampoPerfil
            etiqueta="Correo electrónico"
            icono="mail"
            placeholder="Ej: maria.gomez@correo.com"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <CampoPerfil
            etiqueta="Teléfono"
            icono="phone"
            placeholder="Ej: 387 555-0123"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />

          {/* Guardar cambios: sin función por ahora */}
          <TouchableOpacity style={[estilosComunes.boton, styles.botonGuardar]}>
            <Text style={estilosComunes.textoBoton}>Guardar cambios</Text>
          </TouchableOpacity>

          {/* Cerrar sesión: funciona */}
          <TouchableOpacity
            style={[estilosComunes.botonSecundario, styles.botonCerrar]}
            onPress={handleCerrarSesion}
            disabled={cerrando}
          >
            {cerrando ? (
              <ActivityIndicator color={COLORES.rojo} />
            ) : (
              <>
                <Feather name="log-out" size={18} color={COLORES.rojo} />
                <Text style={[estilosComunes.textoBotonSecundario, styles.textoCerrar]}>
                  Cerrar sesión
                </Text>
              </>
            )}
          </TouchableOpacity>

          {error !== '' && <Text style={styles.error}>{error}</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos (medidas del Figma 09)
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },

  // Franja + avatar
  franja: { alignItems: 'center', paddingBottom: 28 },
  tituloFranja: {
    fontFamily: FUENTES.negrita,
    fontSize: 18,
    color: COLORES.titulo,
    marginBottom: 14,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORES.violeta,
    borderWidth: 4,
    borderColor: COLORES.blanco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: { fontFamily: FUENTES.extra, fontSize: 40, color: COLORES.blanco },
  botonEditarFoto: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORES.verde,
    borderWidth: 2,
    borderColor: COLORES.blanco,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Contenido
  contenido: { paddingHorizontal: 24, paddingTop: 22, paddingBottom: 32 },
  nombreUsuario: {
    fontFamily: FUENTES.extra,
    fontSize: 22,
    color: COLORES.titulo,
    textAlign: 'center',
  },
  rol: { textAlign: 'center', marginTop: 2, marginBottom: 14 },

  // Campos
  campo: { marginBottom: 14 },
  etiqueta: { marginBottom: 6, marginLeft: 2 },
  icono: { marginRight: 12 },

  // Botones
  botonGuardar: { marginTop: 14 },
  botonCerrar: { marginTop: 12 },
  textoCerrar: { marginLeft: 8 },
  error: {
    fontFamily: FUENTES.media,
    fontSize: 13,
    color: COLORES.rojo,
    textAlign: 'center',
    marginTop: 10,
  },
});
