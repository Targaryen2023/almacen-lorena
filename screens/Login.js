import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import {COLORES, FUENTES, MEDIDAS, estilosComunes} from '../src/estilos';


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOGO = require('../assets/logo.png');
// const LOGO_LIGHT = require('../assets/logo.png');
// const LOGO_DARK = require('../assets/logo-dark.png');


// Traduce el código de error de Firebase a un mensaje claro para el usuario.
// Para credenciales incorrectas no se aclara si falló el correo o la clave (buena práctica de seguridad).
const getAuthErrorMessage = (code) => {
  switch (code) {
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos.';
    case 'auth/user-disabled':
      return 'Esta cuenta fue deshabilitada.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.';
    case 'auth/network-request-failed':
      return 'Sin conexión. Revisá tu internet e intentá de nuevo.';
    case 'auth/invalid-api-key':
      return 'La clave API de Firebase no es válida. Revisá la configuración.';
    default:
      return 'No pudimos iniciar sesión. Intentá de nuevo.';
  }
};

// Errores propios de la recuperación de contraseña.
const getResetErrorMessage = (code) => {
  switch (code) {
    case 'auth/invalid-email':
    case 'auth/missing-email':
      return 'El formato del correo electrónico no es válido.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.';
    case 'auth/network-request-failed':
      return 'Sin conexión. Revisá tu internet e intentá de nuevo.';
    default:
      return 'No pudimos enviar el correo. Intentá de nuevo.';
  }
};

// Texto de ejemplo con fines académicos: revisar y ajustar con el equipo antes de la entrega.
const LEGAL_DOCS = {
  terms: {
    title: 'Términos y condiciones',
    sections: [
      {
        heading: '1. Uso de la aplicación',
        body: 'La aplicación está destinada a la gestión del inventario del negocio. El acceso es personal: cada usuario debe ingresar con su propia cuenta.',
      },
      {
        heading: '2. Cuenta y contraseña',
        body: 'Sos responsable de mantener la confidencialidad de tu contraseña y de la actividad realizada con tu cuenta. Si sospechás un uso no autorizado, cambiá tu contraseña.',
      },
      {
        heading: '3. Uso adecuado',
        body: 'No está permitido intentar acceder a cuentas ajenas ni usar la aplicación para fines distintos a los previstos.',
      },
      {
        heading: '4. Cambios',
        body: 'Estos términos pueden actualizarse. Cuando eso ocurra, se publicará la nueva versión en la aplicación.',
      },
    ],
  },
  privacy: {
    title: 'Política de privacidad',
    sections: [
      {
        heading: '1. Datos que se recopilan',
        body: 'Para crear tu cuenta y permitirte iniciar sesión se utilizan tu correo electrónico y una contraseña.',
      },
      {
        heading: '2. Cómo se usan',
        body: 'Los datos se usan únicamente para identificarte y dar acceso a la aplicación. La autenticación se realiza mediante Firebase Authentication.',
      },
      {
        heading: '3. Seguridad',
        body: 'La aplicación no almacena tu contraseña: la gestiona el servicio de autenticación.',
      },
      {
        heading: '4. Consultas',
        body: 'Para consultas sobre tus datos, comunicate con el responsable del negocio.',
      },
    ],
  },
};

export default function Login({ navigation }) {
  const insets = useSafeAreaInsets();
  const emailRef = useRef(null);
  const resetEmailRef = useRef(null);
  const passwordRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);


  const [legalDoc, setLegalDoc] = useState(null); // null | 'terms' | 'privacy'
  // Modal "¿Olvidaste tu contraseña?"
  const [forgotVisible, setForgotVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetFocused, setResetFocused] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [sentNotice, setSentNotice] = useState(false); // aviso flotante "enlace enviado"

  // const systemScheme = useColorScheme();
  // const [isDark, setIsDark] = useState(systemScheme === 'dark');
  // const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;
  // const styles = useMemo(() => createStyles(COLORS), [isDark]);

  const busy = loading;

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

    const validate = () => {
    const next = {};
    const trimmed = email.trim();
    if (!trimmed) next.email = 'ejemplo:usuario@email.com';
    else if (!EMAIL_REGEX.test(trimmed)) next.email = 'El formato del correo no es válido.';
    if (!password) next.password = 'Ingresá tu contraseña.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const clearMessages = () => {
    setFormError('');
    setNotice('');
  };

  const handleLogin = async () => {
    if (busy) return;
    clearMessages();
    if (!validate()) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Si sale bien, onAuthStateChanged (en Navigation.js) cambia solo a la pantalla Home.
    } catch (error) {
      console.error('Error de inicio de sesión:', error.code, error.message);
      setFormError(getAuthErrorMessage(error.code));
      setLoading(false);
    }
  };
  
  

  // ----- Recuperación de contraseña (modal) -----
  const openForgot = () => {
    if (busy) return;
    clearMessages();
    setResetEmail(email.trim()); // reutiliza el correo que ya escribió en el login
    setResetError('');
    setSentNotice(false);
    setForgotVisible(true);
  };

  const closeForgot = () => {
    if (resetLoading) return;
    if (resetEmail.trim()) setEmail(resetEmail.trim());
    setForgotVisible(false);
  };

  // Cierra el modal y muestra el aviso flotante (no ocupa toda la pantalla).
  const onResetSuccess = (sentTo) => {
    setEmail(sentTo);
    setForgotVisible(false);
    setSentNotice(true);
  };

  const handleSendReset = async () => {
    if (resetLoading) return;

    const trimmed = resetEmail.trim();
    if (!trimmed) {
      setResetError('Ingresá tu correo electrónico.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setResetError('El formato del correo no es válido.');
      return;
    }

    setResetError('');
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmed);
      onResetSuccess(trimmed);
    } catch (error) {
      console.error('Error al recuperar contraseña:', error.code, error.message);
      if (error.code === 'auth/user-not-found') {
        // Por seguridad no revelamos si el correo existe o no: se muestra el mismo aviso de éxito.
        onResetSuccess(trimmed);
      } else {
        setResetError(getResetErrorMessage(error.code));
      }
    } finally {
      setResetLoading(false);
    }
  };


  // Color del borde de cada campo: rojo si hay error, violeta si está enfocado, gris si no.
  const inputBorder = (field) => {
    if (errors[field]) return COLORES.rojo;
    if (focusedField === field) return COLORES.violeta;
    return COLORES.gris;
  };
    const resetBorder = resetError
      ? COLORES.rojo
      : resetFocused
        ? COLORES.violeta
        : COLORES.gris;

   return (
    <KeyboardAvoidingView
      style={estilosComunes.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera franja celeste con logo, título y subtítulo */}
        <View style={[estilosComunes.franja,styles.franja,{ paddingTop: insets.top + 28 }]}>

          <View style={styles.logoWrapper}>
            <Image
              source={LOGO}
              style={styles.logo}
              resizeMode="cover"
              accessibilityLabel="Logo del negocio"
            />
          </View>

          <Text style={estilosComunes.titulo} accessibilityRole="header">
            Iniciá sesión
          </Text>
          <Text style={[estilosComunes.subtitulo, styles.subtitulo]}>Ingresá para gestionar tu inventario</Text>
        </View>

        {/* Formulario  */}
        <View style={styles.form}>
              {!!formError && (
            <View style={[styles.banner, styles.bannerError]} accessibilityLiveRegion="polite">
              <Feather name="alert-circle" size={18} color={COLORES.rojo} />
              <Text style={[styles.bannerText, { color: COLORES.rojo }]}>{formError}</Text>
            </View>
          )}
          {!!notice && (
            <View style={[styles.banner, styles.bannerSuccess]} accessibilityLiveRegion="polite">
              <Feather name="check-circle" size={18} color={COLORES.verde} />
              <Text style={[styles.bannerText, { color: COLORES.verde }]}>{notice}</Text>
            </View>
          )}

          <Text style={[estilosComunes.etiqueta, styles.etiqueta]}>Correo electrónico</Text>
          <View style={[estilosComunes.caja, { borderColor: inputBorder('email') }]}>
            <Feather name="mail" size={20} color={COLORES.violeta} style={styles.icon} />
            <TextInput
              ref={emailRef}
              style={estilosComunes.input}
              placeholder="nombre@correo.com"
              placeholderTextColor={COLORES.textoSuave}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                if (formError) setFormError('');
              }}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!busy}
              accessibilityLabel="Correo electrónico"
            />
          </View>
          {!!errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}

          <Text style={[estilosComunes.etiqueta, styles.etiqueta, styles.etiquetaSeparada]}>Contraseña</Text>
          <View style={[estilosComunes.caja, { borderColor: inputBorder('password') }]}>
            <Feather name="lock" size={20} color={COLORES.violeta} style={styles.icon} />
            <TextInput
              ref={passwordRef}
              style={estilosComunes.input}
              placeholder="Tu contraseña"
              placeholderTextColor={COLORES.textoSuave}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                if (formError) setFormError('');
              }}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              editable={!busy}
              accessibilityLabel="Contraseña"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORES.textoSuave} />
            </TouchableOpacity>
          </View>
          {!!errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}


          <TouchableOpacity
            onPress={openForgot}
            disabled={busy}
            style={styles.forgotButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Recuperar contraseña"
          >
            <Text style={estilosComunes.enlace}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={[estilosComunes.boton, busy && estilosComunes.botonDeshabilitado]}
            onPress={handleLogin}
            disabled={busy}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
          >
            {loading ? (
              <ActivityIndicator color={COLORES.blanco} />
            ) : (
              <Text style={estilosComunes.textoBoton}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tenés cuenta? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUp')}
              disabled={busy}
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
              accessibilityRole="button"
            >
              <Text style={estilosComunes.enlace}>Crear cuenta</Text>
            </TouchableOpacity>
          </View>
            <View style={styles.legalContainer}>
            
              <Text style={styles.legalText}>
                Al iniciar sesión aceptás nuestros{' '}
                <Text
                  style={styles.legalLink}
                  onPress={() => setLegalDoc('terms')}
                  accessibilityRole="link"
                >
                  Términos y condiciones
                </Text>{' '}
                y la{' '}
                <Text
                  style={styles.legalLink}
                  onPress={() => setLegalDoc('privacy')}
                  accessibilityRole="link"
                >
                  Política de privacidad
                </Text>
              </Text>
            </View>
        </View>
      </ScrollView>
    

          {/* Aviso flotante: se cierra con la X */}
      {sentNotice && (
        <View
          style={[styles.toast, { top: insets.top + 10 }]}
          accessibilityLiveRegion="polite"
        >
          <View style={styles.toastIcon}>
            <Feather name="check" size={18} color={COLORES.blanco} />
          </View>
          <View style={styles.toastBody}>
            <Text style={styles.toastTitle}>Enlace enviado</Text>
            <Text style={styles.toastMessage}>
              Revisá tu correo (y la carpeta de spam) para restablecer tu contraseña.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setSentNotice(false)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Cerrar aviso"
          >
            <Feather name="x" size={18} color={COLORES.textoSuave} />
          </TouchableOpacity>
        </View>
      )}

      {/* Modal: recuperar contraseña */}
      <Modal
        visible={forgotVisible}
        animationType="slide"
        transparent
        onRequestClose={closeForgot}
        onShow={() => resetEmailRef.current?.focus()}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeForgot}
            accessibilityLabel="Cerrar"
          />
          <View style={[styles.modalCard, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHandle} />

            <TouchableOpacity
              style={styles.modalClose}
              onPress={closeForgot}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
            >
              <Feather name="x" size={22} color={COLORES.textoSuave} />
            </TouchableOpacity>

            <View style={styles.resetIconCircle}>
              <Feather name="lock" size={28} color={COLORES.violeta} />
            </View>
            <Text style={styles.resetTitle} accessibilityRole="header">
              Recuperar contraseña
            </Text>
            <Text style={styles.resetText}>
              Ingresá el correo de tu cuenta y te enviaremos un enlace para crear una
              contraseña nueva.
            </Text>

            <Text style={[estilosComunes.etiqueta,styles.etiqueta]}>Correo electrónico</Text>
            <View style={[estilosComunes.caja, { borderColor: resetBorder }]}>
              <Feather name="mail" size={20} color={COLORES.violeta} style={styles.icon} />
              <TextInput
                ref={resetEmailRef}
                style={estilosComunes.input}
                placeholder="nombre@correo.com"
                placeholderTextColor={COLORES.textoSuave}
                value={resetEmail}
                onChangeText={(text) => {
                  setResetEmail(text);
                  if (resetError) setResetError('');
                }}
                onFocus={() => setResetFocused(true)}
                onBlur={() => setResetFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="send"
                onSubmitEditing={handleSendReset}
                editable={!resetLoading}
                accessibilityLabel="Correo electrónico para recuperar la contraseña"
              />
            </View>
            {!!resetError && (
              <Text style={styles.fieldError} accessibilityLiveRegion="polite">
                {resetError}
              </Text>
            )}

            <TouchableOpacity
              style={[
                estilosComunes.boton, styles.resetPrimary, 
                resetLoading && estilosComunes.botonDeshabilitado,]}
              onPress={handleSendReset}
              disabled={resetLoading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Enviar enlace de recuperación"
            >
              {resetLoading ? (
                <ActivityIndicator color={COLORES.blanco} />
              ) : (
                <Text style={estilosComunes.textoBoton}>Enviar enlace</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={closeForgot}
              disabled={resetLoading}
              style={styles.cancelButton}
              accessibilityRole="button"
            >
              <Text style={estilosComunes.enlace}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>



      {/* Modal: terminos y privacidad*/}
      <Modal
        visible={!!legalDoc}
        animationType="slide"
        transparent
        onRequestClose={() => setLegalDoc(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.modalTitle}>{legalDoc ? LEGAL_DOCS[legalDoc].title : ''}</Text>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator>
              {legalDoc &&
                LEGAL_DOCS[legalDoc].sections.map((section) => (
                  <View key={section.heading}>
                    <Text style={styles.modalHeading}>{section.heading}</Text>
                    <Text style={styles.modalText}>{section.body}</Text>
                  </View>
                ))}
            </ScrollView>
            <TouchableOpacity
              style={[estilosComunes.boton, { marginTop: 16 }]}
              onPress={() => setLegalDoc(null)}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              <Text style={estilosComunes.textoBoton}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// Estilos propios de esta pantalla. Colores, fuentes, campos y botones
// salen de src/estilos.js (estilosComunes, COLORES, FUENTES, MEDIDAS).
const styles = StyleSheet.create({
  flex: {flex: 1},
  scrollContent: {flexGrow: 1},

  // Cabecera
  franja: { alignItems: 'center', paddingBottom: 28 },
  logoWrapper: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: COLORES.blanco,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 0.5,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  logo: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.18 }],
  },
  subtitulo: { marginTop: 4, textAlign: 'center' },


  
  // Formulario
  form: {
    flex: 1,
    paddingHorizontal: MEDIDAS.margen,
    paddingTop: 28,
    paddingBottom: 32,
  },

  etiqueta: { marginBottom: 6, marginLeft: 2 },
  etiquetaSeparada: { marginTop: 18 },
  icon: { marginRight: 12 },
  fieldError: {
    fontFamily: FUENTES.media,
    fontSize: 13,
    color: COLORES.rojo,
    marginTop: 6,
  },
 
  // Mensajes
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  bannerError: { backgroundColor: COLORES.rojoSuave },
  bannerSuccess: { backgroundColor: COLORES.verdeSuave },
  bannerText: {
    flex: 1,
    marginLeft: 8,
    fontFamily: FUENTES.semi,
    fontSize: 14,
  },
 
  // Acciones
  forgotButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
    marginBottom: 20,
    minHeight: 20,
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontFamily: FUENTES.regular,
    fontSize: 15,
    color: COLORES.textoSuave,
  },
 
  // Pie legal
  legalContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingTop: 32,
  },
  legalText: {
    fontFamily: FUENTES.regular,
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.textoSuave,
    textAlign: 'center',
  },
  legalLink: {
    fontFamily: FUENTES.negrita,
    color: COLORES.violeta,
  },
 
  // Ventanas (modales)
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORES.blanco,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: MEDIDAS.margen,
    paddingTop: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontFamily: FUENTES.extra,
    fontSize: 20,
    color: COLORES.titulo,
    marginBottom: 12,
  },
  modalBody: { flexGrow: 0 },
  modalHeading: {
    fontFamily: FUENTES.negrita,
    fontSize: 15,
    color: COLORES.negro,
    marginTop: 12,
  },
  modalText: {
    fontFamily: FUENTES.regular,
    fontSize: 15,
    lineHeight: 22,
    color: COLORES.textoSuave,
    marginTop: 4,
  },
 
  // Ventana de recuperar contraseña
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORES.gris,
    marginTop: -12,
    marginBottom: 16,
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 1,
  },
  resetIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORES.violetaSuave,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  resetTitle: {
    fontFamily: FUENTES.extra,
    fontSize: 22,
    color: COLORES.titulo,
    textAlign: 'center',
    marginBottom: 8,
  },
  resetText: {
    fontFamily: FUENTES.regular,
    fontSize: 15,
    lineHeight: 22,
    color: COLORES.textoSuave,
    textAlign: 'center',
    marginBottom: 20,
  },
  resetPrimary: { alignSelf: 'stretch', marginTop: 20 },
  cancelButton: {
    alignSelf: 'center',
    marginTop: 14,
    minHeight: 24,
    justifyContent: 'center',
  },
 
  // Aviso flotante
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.blanco,
    borderRadius: MEDIDAS.radioBoton,
    borderWidth: 1,
    borderColor: COLORES.gris,
    paddingVertical: 12,
    paddingHorizontal: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  toastIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.verde,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toastBody: { flex: 1, marginRight: 10 },
  toastTitle: {
    fontFamily: FUENTES.negrita,
    fontSize: 15,
    color: COLORES.negro,
  },
  toastMessage: {
    fontFamily: FUENTES.regular,
    fontSize: 13,
    lineHeight: 18,
    color: COLORES.textoSuave,
    marginTop: 2,
  },
});