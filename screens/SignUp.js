// screens/SignUp.js
// Pantalla de Registro (Figma 03 · Registro, con los cambios acordados).
// TAREA 1: maquetación.
// TAREA 2: validación de nombre, apellido y correo al salir del campo,
//          con borde rojo (error) / verde (correcto) y mensaje debajo.
// Pendiente: contraseña y confirmación (tarea 3), botón (tarea 4), Firebase (tarea 5).

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons'; // íconos de línea, como en el Figma
import { auth } from '../src/config/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { validarNombre, validarCorreo } from '../src/validaciones';

// ---------------------------------------------------------------------------
// Colores: paleta del Manual de Identidad + verde del Figma.
// Cuando Maxi suba src/estilos.js, se reemplazan por los de ese archivo.
// ---------------------------------------------------------------------------
const COLORES = {
  celeste: '#ADE3FF',     // franja superior (manual)
  violeta: '#8C63D6',     // íconos y enlaces (manual)
  negro: '#100F13',       // texto principal (manual)
  rojo: '#E1493D',        // error (manual)
  gris: '#D9D9D9',        // bordes neutros (manual)
  verde: '#5E9136',       // botón y "cumplido" (Figma, no está en el manual)
  fondo: '#F3F9FF',       // fondo de la pantalla (Figma)
  titulo: '#2B2452',      // título "Crear cuenta" (Figma)
  textoSuave: '#6B6880',  // subtítulos, placeholders y ayudas
  blanco: '#FFFFFF',
};

// Requisitos de la contraseña. En la tarea 3 cada uno se pinta de verde al cumplirse.
const REQUISITOS = [
  'Mínimo 8 caracteres',
  'Una letra mayúscula',
  'Una letra minúscula',
  'Un número',
];

// ---------------------------------------------------------------------------
// Componente Campo: etiqueta + caja con ícono + mensaje/ayuda debajo.
//   estado: 'neutral' | 'error' | 'ok'  → cambia el color del borde.
//   mensajeError: texto rojo que aparece debajo cuando estado es 'error'.
//   obligatorio: muestra " *"; si es false muestra el cartel "Opcional"
//   (hoy no hay campos opcionales, queda listo por si se agrega alguno).
// ---------------------------------------------------------------------------
function Campo({
  etiqueta,
  obligatorio = true,
  icono,
  estado = 'neutral',
  mensajeError = '',
  esContrasena = false,
  children, // contenido que va debajo de la caja (ayudas, requisitos)
  ...propsInput // el resto de las props va directo al TextInput (value, onBlur, etc.)
}) {
  const [visible, setVisible] = useState(false); // ojo de la contraseña

  // Color del borde según el estado
  const colorBorde =
    estado === 'error' ? COLORES.rojo : estado === 'ok' ? COLORES.verde : COLORES.gris;

  return (
    <View style={styles.campo}>
      {/* Etiqueta: asterisco si es obligatorio, cartel si es opcional */}
      <View style={styles.filaEtiqueta}>
        <Text style={styles.etiqueta}>
          {etiqueta}
          {obligatorio && <Text style={styles.asterisco}> *</Text>}
        </Text>
        {!obligatorio && (
          <View style={styles.cartelOpcional}>
            <Text style={styles.textoOpcional}>Opcional</Text>
          </View>
        )}
      </View>

      {/* Caja del campo */}
      <View style={[styles.caja, { borderColor: colorBorde }]}>
        <Feather name={icono} size={20} color={COLORES.violeta} style={styles.icono} />
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORES.textoSuave}
          secureTextEntry={esContrasena && !visible}
          {...propsInput}
        />
        {/* Tilde verde cuando el campo está bien (no en contraseñas: ahí va el ojo) */}
        {estado === 'ok' && !esContrasena && (
          <Feather name="check-circle" size={20} color={COLORES.verde} />
        )}
        {esContrasena && (
          <TouchableOpacity onPress={() => setVisible(!visible)} hitSlop={10}>
            <Feather name={visible ? 'eye-off' : 'eye'} size={20} color={COLORES.textoSuave} />
          </TouchableOpacity>
        )}
      </View>

      {/* Mensaje de error debajo de la caja */}
      {estado === 'error' && mensajeError !== '' && (
        <View style={styles.filaError}>
          <Feather name="alert-circle" size={14} color={COLORES.rojo} />
          <Text style={styles.textoError}>{mensajeError}</Text>
        </View>
      )}

      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Pantalla
// ---------------------------------------------------------------------------
export default function SignUp({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');

  // "Tocado" = el usuario ya salió del campo al menos una vez.
  // Antes de eso el campo queda neutro (gris): no mostramos errores
  // de algo que la persona todavía no empezó a escribir.
  const [tocados, setTocados] = useState({ nombre: false, apellido: false, correo: false });
  const marcarTocado = (campo) => setTocados((prev) => ({ ...prev, [campo]: true }));

  // Errores calculados en cada render a partir del valor actual.
  // Así, una vez tocado, el error se borra apenas el usuario lo corrige.
  const errores = {
    nombre: validarNombre(nombre),
    apellido: validarNombre(apellido),
    correo: validarCorreo(correo),
  };

  // neutral (sin tocar) → error (tocado y con error) → ok (tocado y sin error)
  const estadoDe = (campo) => {
    if (!tocados[campo]) return 'neutral';
    return errores[campo] ? 'error' : 'ok';
  };

  // Lógica de la guía, sin cambios: se reemplaza en la tarea 5.
  // Se deja para que el registro siga funcionando mientras se avanza.
  const handleSignUp = async () => {
    if (!nombre.trim() || !apellido.trim() || !correo.trim() || !contrasena || !confirmacion) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }
    if (contrasena !== confirmacion) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    try {
      const credencial = await createUserWithEmailAndPassword(auth, correo.trim(), contrasena);
      await updateProfile(credencial.user, { displayName: `${nombre.trim()} ${apellido.trim()}` });
    } catch (error) {
      Alert.alert('Error', `No se pudo registrar.\n\nCódigo: ${error.code ?? 'desconocido'}`);
    }
  };

  return (
    <View style={styles.pantalla}>
      {/* Franja celeste con la flecha para volver */}
      <SafeAreaView edges={['top']} style={styles.franja}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.volver}>
          <Feather name="arrow-left" size={24} color={COLORES.titulo} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* KeyboardAvoidingView + ScrollView: con 5 campos el teclado tapa los de abajo */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.titulo}>Crear cuenta</Text>
          <Text style={styles.subtitulo}>Completá tus datos para registrarte</Text>

          <Campo
            etiqueta="Nombre"
            icono="user"
            placeholder="Ej: María"
            value={nombre}
            onChangeText={setNombre}
            onBlur={() => marcarTocado('nombre')} // valida al salir del campo
            estado={estadoDe('nombre')}
            mensajeError={errores.nombre}
            autoCapitalize="words"
          />

          <Campo
            etiqueta="Apellido"
            icono="user"
            placeholder="Ej: Gómez"
            value={apellido}
            onChangeText={setApellido}
            onBlur={() => marcarTocado('apellido')}
            estado={estadoDe('apellido')}
            mensajeError={errores.apellido}
            autoCapitalize="words"
          />

          <Campo
            etiqueta="Correo electrónico"
            icono="mail"
            placeholder="Ej: maria.gomez@correo.com"
            value={correo}
            onChangeText={setCorreo}
            onBlur={() => marcarTocado('correo')}
            estado={estadoDe('correo')}
            mensajeError={errores.correo}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Campo
            etiqueta="Contraseña"
            icono="lock"
            placeholder="Escribí tu contraseña"
            value={contrasena}
            onChangeText={setContrasena}
            esContrasena
          >
            {/* Lista de requisitos: en la tarea 3 cada uno pasa a verde */}
            <View style={styles.requisitos}>
              {REQUISITOS.map((texto) => (
                <View key={texto} style={styles.requisito}>
                  <Feather name="circle" size={14} color={COLORES.textoSuave} />
                  <Text style={styles.textoRequisito}>{texto}</Text>
                </View>
              ))}
            </View>
          </Campo>

          <Campo
            etiqueta="Confirmar contraseña"
            icono="lock"
            placeholder="Repetí tu contraseña"
            value={confirmacion}
            onChangeText={setConfirmacion}
            esContrasena
          >
            {/* En la tarea 3: "Las contraseñas coinciden" (verde) / "no coinciden" (rojo) */}
            <Text style={styles.ayuda}>Las dos contraseñas deben coincidir</Text>
          </Campo>

          <TouchableOpacity style={styles.boton} onPress={handleSignUp}>
            <Text style={styles.textoBoton}>Registrarse</Text>
          </TouchableOpacity>

          {/* Pie: pregunta y enlace en la misma línea */}
          <View style={styles.pie}>
            <Text style={styles.textoPie}>¿Ya tenés cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} hitSlop={8}>
              <Text style={styles.enlace}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos (medidas tomadas del Figma: pantalla de 390 px, márgenes de 24 px)
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.fondo },

  // Franja superior
  franja: { backgroundColor: COLORES.celeste },
  volver: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, alignSelf: 'flex-start' },

  // Contenido desplazable
  contenido: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  titulo: { fontSize: 30, fontWeight: '800', color: COLORES.titulo },
  subtitulo: { fontSize: 14, color: COLORES.textoSuave, marginTop: 2, marginBottom: 16 },

  // Campo
  campo: { marginBottom: 14 },
  filaEtiqueta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, marginLeft: 2 },
  etiqueta: { fontSize: 14, color: COLORES.negro },
  asterisco: { color: COLORES.rojo },
  cartelOpcional: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: COLORES.gris,
  },
  textoOpcional: { fontSize: 11, color: COLORES.textoSuave },
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: COLORES.blanco,
  },
  icono: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: COLORES.negro, height: '100%' },

  // Error debajo del campo
  filaError: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginLeft: 4 },
  textoError: { fontSize: 13, color: COLORES.rojo, marginLeft: 6, flexShrink: 1 },

  // Ayudas debajo de las contraseñas
  requisitos: { marginTop: 8, marginLeft: 4 },
  requisito: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  textoRequisito: { fontSize: 13, color: COLORES.textoSuave, marginLeft: 8 },
  ayuda: { fontSize: 13, color: COLORES.textoSuave, marginTop: 6, marginLeft: 4 },

  // Botón
  boton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORES.verde,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  textoBoton: { color: COLORES.blanco, fontSize: 18, fontWeight: '700' },

  // Pie
  pie: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  textoPie: { fontSize: 15, color: COLORES.textoSuave },
  enlace: { fontSize: 15, fontWeight: '700', color: COLORES.violeta },
});
