// screens/SignUp.js
// Pantalla de Registro (Figma 03 · Registro, con los cambios acordados).
// TAREA 1: maquetación.
// TAREA 2: validación de nombre, apellido y correo al salir del campo,
//          con borde rojo (error) / verde (correcto) y mensaje debajo.
// TAREA 3: requisitos de la contraseña que se pintan de verde mientras se escribe,
//          y aviso en vivo de si la confirmación coincide o no.
// TAREA 4: botón "Registrarse" deshabilitado hasta que todos los campos sean válidos.
// TAREA 5: crea el usuario en Firebase (nombre y apellido en displayName),
//          avisa si el correo ya existe, muestra los mensajes en pantalla
//          (Alert no funciona en el navegador) y al terminar vuelve a Login.
// ESTILOS: colores y tipografía Montserrat desde src/estilos.js (manual + Figma);
//          franja celeste con logo, título y subtítulo, como en Login.

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
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons'; // íconos de línea, como en el Figma
import { auth } from '../src/config/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { estadoRegistro } from '../src/estadoRegistro';
import {
  validarNombre,
  validarCorreo,
  validarContrasena,
  validarConfirmacion,
  REQUISITOS_CONTRASENA,
  MENSAJES,
} from '../src/validaciones';

// Colores, tipografía y estilos comunes (manual de identidad + Figma)
import { COLORES, FUENTES, MEDIDAS, estilosComunes } from '../src/estilos';

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
  const insets = useSafeAreaInsets(); // alto de la barra de estado / notch
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');

  // "Tocado" = el usuario ya salió del campo al menos una vez.
  // Antes de eso el campo queda neutro (gris): no mostramos errores
  // de algo que la persona todavía no empezó a escribir.
  const [tocados, setTocados] = useState({
    nombre: false,
    apellido: false,
    correo: false,
    contrasena: false,
    confirmacion: false,
  });
  const marcarTocado = (campo) => setTocados((prev) => ({ ...prev, [campo]: true }));

  // TAREA 5: estados del envío a Firebase
  const [enviando, setEnviando] = useState(false); // muestra "Creando cuenta…"
  const [exito, setExito] = useState(false); // muestra el cartel verde
  const [errorGeneral, setErrorGeneral] = useState(''); // cartel rojo (sin conexión, etc.)
  const [correoRegistrado, setCorreoRegistrado] = useState(''); // correo que Firebase rechazó por repetido

  // Errores calculados en cada render a partir del valor actual.
  // Así, una vez tocado, el error se borra apenas el usuario lo corrige.
  const errores = {
    nombre: validarNombre(nombre),
    apellido: validarNombre(apellido),
    // Además del formato, el correo da error si es el mismo que Firebase ya rechazó.
    // Apenas el usuario lo cambia, el error desaparece.
    correo:
      validarCorreo(correo) ||
      (correo.trim().toLowerCase() === correoRegistrado ? MENSAJES.correoRegistrado : ''),
    contrasena: validarContrasena(contrasena),
    confirmacion: validarConfirmacion(contrasena, confirmacion),
  };

  // neutral (sin tocar) → error (tocado y con error) → ok (tocado y sin error)
  const estadoDe = (campo) => {
    if (!tocados[campo]) return 'neutral';
    return errores[campo] ? 'error' : 'ok';
  };

  // La contraseña y la confirmación avisan EN VIVO (mientras se escribe),
  // por eso no esperan al "tocado" para ponerse en verde.
  const estadoContrasena = contrasena && !errores.contrasena ? 'ok' : estadoDe('contrasena');

  // Confirmación: en cuanto hay algo escrito, se compara con la contraseña.
  const estadoConfirmacion = confirmacion
    ? errores.confirmacion
      ? 'error'
      : 'ok'
    : estadoDe('confirmacion'); // vacía: solo marca error si ya saliste del campo

  // TAREA 4: el formulario es válido solo si NINGÚN campo tiene error.
  // Object.values(errores) → ['', '', 'Este campo es obligatorio', ...]
  // .every(...)            → true únicamente si todos son '' (sin error)
  const formularioValido = Object.values(errores).every((error) => error === '');
  const botonDeshabilitado = !formularioValido || enviando || exito;

  // TAREA 5: registro en Firebase
  const handleSignUp = async () => {
    // Doble seguro: aunque el botón esté deshabilitado, no se envía nada inválido.
    if (!formularioValido || enviando) return;

    setEnviando(true);
    setErrorGeneral('');
    estadoRegistro.enCurso = true; // Navigation no salta a Home mientras dura esto

    try {
      // 1) Crear la cuenta (Firebase además inicia sesión con ella)
      const credencial = await createUserWithEmailAndPassword(
        auth,
        correo.trim().toLowerCase(),
        contrasena
      );

      // 2) Guardar "Nombre Apellido". Si falla, la cuenta igual quedó creada.
      try {
        await updateProfile(credencial.user, {
          displayName: `${nombre.trim()} ${apellido.trim()}`,
        });
      } catch (e) {
        console.warn('No se pudo guardar el nombre:', e.code);
      }

      // 3) Cerrar la sesión automática: el usuario tiene que entrar desde Login
      await signOut(auth);

      // 4) Avisar y volver a Login
      setExito(true);
      setTimeout(() => navigation.navigate('Login'), 2000);
    } catch (error) {
      console.warn('Error de registro:', error.code);
      if (error.code === 'auth/email-already-in-use') {
        // El error se muestra en el propio campo de correo
        setCorreoRegistrado(correo.trim().toLowerCase());
        marcarTocado('correo');
      } else if (error.code === 'auth/network-request-failed') {
        setErrorGeneral(MENSAJES.sinConexion);
      } else {
        setErrorGeneral(MENSAJES.errorGeneral);
      }
    } finally {
      estadoRegistro.enCurso = false;
      setEnviando(false);
    }
  };

  return (
    <View style={estilosComunes.pantalla}>
      {/* KeyboardAvoidingView + ScrollView: con 5 campos el teclado tapa los de abajo */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Franja celeste: flecha para volver + logo + título (va dentro del scroll
              para que en pantallas chicas no ocupe lugar fijo) */}
          <View style={[estilosComunes.franja, styles.franja, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={12}
              style={styles.volver}
              accessibilityLabel="Volver"
            >
              <Feather name="arrow-left" size={24} color={COLORES.titulo} />
            </TouchableOpacity>

            <View style={styles.logoCirculo}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="Logo de Almacén Lorena"
              />
            </View>
            <Text style={[estilosComunes.titulo, styles.centrado]}>Crear cuenta</Text>
            <Text style={[estilosComunes.subtitulo, styles.centrado]}>
              Completá tus datos para registrarte
            </Text>
          </View>

          <View style={styles.contenido}>
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
              onBlur={() => marcarTocado('contrasena')}
              estado={estadoContrasena}
              esContrasena
            >
              {/* Lista de requisitos, se actualiza en cada tecla:
                  cumplido            → verde con tilde
                  no cumplido         → gris (rojo si ya saliste del campo) */}
              <View style={styles.requisitos}>
                {REQUISITOS_CONTRASENA.map((req) => {
                  const ok = req.cumple(contrasena);
                  const color = ok
                    ? COLORES.verde
                    : tocados.contrasena
                      ? COLORES.rojo
                      : COLORES.textoSuave;
                  return (
                    <View key={req.texto} style={styles.requisito}>
                      <Feather name={ok ? 'check-circle' : 'circle'} size={14} color={color} />
                      <Text style={[styles.textoRequisito, { color }]}>{req.texto}</Text>
                    </View>
                  );
                })}
              </View>
            </Campo>

            <Campo
              etiqueta="Confirmar contraseña"
              icono="lock"
              placeholder="Repetí tu contraseña"
              value={confirmacion}
              onChangeText={setConfirmacion}
              onBlur={() => marcarTocado('confirmacion')}
              estado={estadoConfirmacion}
              mensajeError={errores.confirmacion} // "no coinciden" u "obligatorio", en rojo
              esContrasena
            >
              {/* Ayuda gris mientras está vacía; verde cuando coinciden */}
              {estadoConfirmacion === 'neutral' && (
                <Text style={styles.ayuda}>Las dos contraseñas deben coincidir</Text>
              )}
              {estadoConfirmacion === 'ok' && (
                <View style={styles.filaError}>
                  <Feather name="check-circle" size={14} color={COLORES.verde} />
                  <Text style={[styles.textoError, { color: COLORES.verde }]}>
                    {MENSAJES.coinciden}
                  </Text>
                </View>
              )}
            </Campo>

            {/* Botón: deshabilitado (atenuado y sin acción) hasta que todo sea válido */}
            {/* Carteles de resultado (en pantalla, porque Alert no se ve en el navegador) */}
            {errorGeneral !== '' && (
              <View style={[styles.cartel, styles.cartelError]}>
                <Feather name="alert-circle" size={18} color={COLORES.rojo} />
                <Text style={[styles.textoCartel, { color: COLORES.rojo }]}>{errorGeneral}</Text>
              </View>
            )}
            {exito && (
              <View style={[styles.cartel, styles.cartelExito]}>
                <Feather name="check-circle" size={18} color={COLORES.verde} />
                <Text style={[styles.textoCartel, { color: COLORES.verde }]}>{MENSAJES.exito}</Text>
              </View>
            )}

            {/* Botón: deshabilitado hasta que todo sea válido, mientras envía y después del éxito */}
            <TouchableOpacity
              style={[styles.boton, botonDeshabilitado && styles.botonDeshabilitado]}
              onPress={handleSignUp}
              disabled={botonDeshabilitado}
              accessibilityState={{ disabled: botonDeshabilitado }} // lo anuncia el lector de pantalla
            >
              {enviando ? (
                <View style={styles.filaCargando}>
                  <ActivityIndicator color={COLORES.blanco} />
                  <Text style={[styles.textoBoton, { marginLeft: 10 }]}>Creando cuenta…</Text>
                </View>
              ) : (
                <Text style={styles.textoBoton}>Registrarse</Text>
              )}
            </TouchableOpacity>
            {!formularioValido && !exito && (
              <Text style={styles.ayudaBoton}>Completá todos los campos para continuar</Text>
            )}

            {/* Pie: pregunta y enlace en la misma línea */}
            <View style={styles.pie}>
              <Text style={styles.textoPie}>¿Ya tenés cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} hitSlop={8}>
                <Text style={estilosComunes.enlace}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos propios de esta pantalla. Lo compartido viene de estilosComunes.
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },

  // Franja superior
  franja: { alignItems: 'center', paddingBottom: 22 },
  volver: { alignSelf: 'flex-start', paddingVertical: 4 },
  logoCirculo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORES.blanco,
    borderWidth: 3,
    borderColor: COLORES.blanco,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 4, // sombra en Android
    shadowColor: '#000', // sombra en iOS
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  logo: { width: '100%', height: '100%' },
  centrado: { textAlign: 'center' },

  // Formulario
  contenido: { paddingHorizontal: MEDIDAS.margen, paddingTop: 20, paddingBottom: 40 },

  // Campo
  campo: { marginBottom: 14 },
  filaEtiqueta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, marginLeft: 2 },
  etiqueta: estilosComunes.etiqueta,
  asterisco: { color: COLORES.rojo },
  cartelOpcional: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: COLORES.gris,
  },
  textoOpcional: { fontFamily: FUENTES.media, fontSize: 11, color: COLORES.textoSuave },
  caja: estilosComunes.caja,
  icono: { marginRight: 12 },
  input: estilosComunes.input,

  // Error debajo del campo
  filaError: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginLeft: 4 },
  textoError: {
    fontFamily: FUENTES.media,
    fontSize: 13,
    color: COLORES.rojo,
    marginLeft: 6,
    flexShrink: 1,
  },

  // Ayudas debajo de las contraseñas
  requisitos: { marginTop: 8, marginLeft: 4 },
  requisito: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  textoRequisito: {
    fontFamily: FUENTES.regular,
    fontSize: 13,
    color: COLORES.textoSuave,
    marginLeft: 8,
  },
  ayuda: {
    fontFamily: FUENTES.regular,
    fontSize: 13,
    color: COLORES.textoSuave,
    marginTop: 6,
    marginLeft: 4,
  },

  // Botón (base común + separación)
  boton: { ...estilosComunes.boton, marginTop: 18 },
  textoBoton: estilosComunes.textoBoton,
  botonDeshabilitado: estilosComunes.botonDeshabilitado,
  filaCargando: { flexDirection: 'row', alignItems: 'center' },

  // Carteles de resultado
  cartel: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: MEDIDAS.radioCampo,
    borderWidth: 1,
    marginTop: 8,
  },
  cartelError: { backgroundColor: COLORES.rojoSuave, borderColor: COLORES.rojo },
  cartelExito: { backgroundColor: COLORES.verdeSuave, borderColor: COLORES.verde },
  textoCartel: { fontFamily: FUENTES.media, fontSize: 14, marginLeft: 8, flexShrink: 1 },
  ayudaBoton: {
    fontFamily: FUENTES.regular,
    fontSize: 13,
    color: COLORES.textoSuave,
    textAlign: 'center',
    marginTop: 8,
  },

  // Pie
  pie: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  textoPie: { fontFamily: FUENTES.regular, fontSize: 15, color: COLORES.textoSuave },
});
