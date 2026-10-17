import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
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
  useColorScheme,
  View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';


const LIGHT_COLORS = {
  headerBg: '#D9EBF8',
  screenBg: '#F0F6FA',
  card: '#FFFFFF',
  text: '#1B1F23',
  muted: '#5B6B7A',
  placeholder: '#8A97A4',
  border: '#D5DEE6',
  primary: '#754FC2',
  primaryDark: '#8C63D6',
  danger: '#C0392B',
  dangerBg: '#FDECEA',
  successBg: '#E9E0F8',
  logoBg: '#FFFFFF',
};

const DARK_COLORS = {
  headerBg: '#221F2B',
  screenBg: '#14121A',
  card: '#26232F',
  text: '#F2EFF7',
  muted: '#A9A3B8',
  placeholder: '#7C768C',
  border: '#3A3646',
  primary: '#8C63D6',
  primaryDark: '#B79BEA',
  danger: '#FF8A8A',
  dangerBg: '#3A1F26',
  successBg: '#2E2545',
  logoBg: '#0F0E14',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOGO_LIGHT = require('../assets/logo.png');
const LOGO_DARK = require('../assets/logo-dark.png');


// Traduce el código de error de Firebase a un mensaje claro para el usuario.
// Para credenciales incorrectas no se aclara si falló el correo o la clave (buena práctica de seguridad).
const getAuthErrorMessage = (code) => {
  switch (code) {
    case 'auth/invalid-email':
    case 'auth/missing-email':
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
  const passwordRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [legalDoc, setLegalDoc] = useState(null); // null | 'terms' | 'privacy'

  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;
  const styles = useMemo(() => createStyles(COLORS), [isDark]);

  const busy = loading || resetting;

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
  
  const handleForgotPassword = async () => {
    if (busy) return;
    clearMessages();

    const trimmed = email.trim();
    if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
      setErrors({ email: 'Escribí tu correo para enviarte el enlace de recuperación.' });
      emailRef.current?.focus();
      return;
    }

    setErrors({});
    setResetting(true);
    try {
      await sendPasswordResetEmail(auth, trimmed);
      setNotice('Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.');
    } catch (error) {
      console.error('Error al recuperar contraseña:', error.code, error.message);
      setFormError(getAuthErrorMessage(error.code));
    } finally {
      setResetting(false);
    }
  };

  const inputBorder = (field) => {
    if (errors[field]) return COLORS.danger;
    if (focusedField === field) return COLORS.primary;
    return COLORS.border;
  };

   return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera */}
        <View style={[styles.header, { paddingTop: insets.top + 28 }]}>

          <View style={[styles.header, { paddingTop: insets.top + 28 }]}>
            <TouchableOpacity
              style={[styles.themeToggle, { top: insets.top + 12 }]}
              onPress={() => setIsDark((prev) => !prev)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="switch"
              accessibilityState={{ checked: isDark }}
              accessibilityLabel="Modo oscuro"
            >
              <Feather name={isDark ? 'sun' : 'moon'} size={20} color={COLORS.primaryDark} />
            </TouchableOpacity>

          </View>
          <View style={styles.logoWrapper}>
            <Image
            
             source={isDark ? LOGO_DARK : LOGO_LIGHT}
             style={[styles.logo, isDark && styles.logoDark]}
             resizeMode="cover"
             accessibilityLabel="Logo del negocio"

            />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            Iniciá sesión
          </Text>
          <Text style={styles.subtitle}>Ingresá para gestionar tu inventario</Text>
        </View>

        {/* Formulario (los campos de acá se reemplazan en los pasos 10 y 11) */}
        <View style={styles.form}>
              {!!formError && (
            <View style={[styles.banner, styles.bannerError]} accessibilityLiveRegion="polite">
              <Feather name="alert-circle" size={18} color={COLORS.danger} />
              <Text style={[styles.bannerText, { color: COLORS.danger }]}>{formError}</Text>
            </View>
          )}
          {!!notice && (
            <View style={[styles.banner, styles.bannerSuccess]} accessibilityLiveRegion="polite">
              <Feather name="check-circle" size={18} color={COLORS.primaryDark} />
              <Text style={[styles.bannerText, { color: COLORS.primaryDark }]}>{notice}</Text>
            </View>
          )}

          <Text style={styles.label}>Correo electrónico</Text>
          <View style={[styles.inputContainer, { borderColor: inputBorder('email') }]}>
            <Feather name="mail" size={20} color={COLORS.muted} style={styles.icon} />
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="nombre@correo.com"
              placeholderTextColor={COLORS.placeholder}
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

          <Text style={[styles.label, styles.labelSpaced]}>Contraseña</Text>
          <View style={[styles.inputContainer, { borderColor: inputBorder('password') }]}>
            <Feather name="lock" size={20} color={COLORS.muted} style={styles.icon} />
            <TextInput
              ref={passwordRef}
              style={styles.input}
              placeholder="Tu contraseña"
              placeholderTextColor={COLORS.placeholder}
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
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
          {!!errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}


          <TouchableOpacity
            onPress={handleForgotPassword}
            disabled={busy}
            style={styles.forgotButton}
            accessibilityRole="button"
          >
            {resetting ? (
              <ActivityIndicator size="small" color={COLORS.primaryDark} />
            ) : (
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, busy && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={busy}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Iniciar sesión</Text>
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
              <Text style={styles.footerLink}>Crear cuenta</Text>
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
              style={[styles.button, { marginTop: 16 }]}
              onPress={() => setLegalDoc(null)}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}


const createStyles = (COLORS) => StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Cabecera
  header: {
    backgroundColor: COLORS.headerBg,
    alignItems: 'center',
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  logoWrapper: {
    // width: 104,
    // height: 104,
    // borderRadius: 52,
    // backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
    // overflow: 'hidden',
    // marginBottom: 16,
    // borderWidth: 3,
    // borderColor: '#fff',
    // elevation: 4,
    // shadowColor: '#000',
    // shadowOpacity: 0.12,
    // shadowRadius: 8,
    // shadowOffset: { width: 0, height: 3 },
    width: 124,
    height: 124,
    borderRadius: 62,
    // backgroundColor: '#fff',
    backgroundColor: COLORS.logoBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 0.5,
    //borderColor: '#fff',
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
  logoDark: {
    transform: [{ scale: 1 }],
  },
  title: {
    // fontSize: 26,
    // fontWeight: '800',
    // color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    // marginTop: 4,
    // fontSize: 14,
    // color: COLORS.muted,
    // textAlign: 'center',
    marginTop: 4,
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
  },

  // Formulario
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
  label: {
    // fontSize: 14,
    // fontWeight: '700',
    // color: COLORS.text,
    // marginBottom: 8,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  labelSpaced: {
    marginTop: 18,
  },
  inputContainer: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // backgroundColor: COLORS.card,
    // borderWidth: 1.5,
    // borderRadius: 12,
    // paddingHorizontal: 14,
    // height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 56,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    // flex: 1,
    // fontSize: 16,
    // color: COLORS.text,
    // height: '100%',
    flex: 1,
    fontSize: 17,
    color: COLORS.text,
    height: '100%',
  },
  fieldError: {
    // marginTop: 6,
    // fontSize: 13,
    // color: COLORS.danger,
    marginTop: 6,
    fontSize: 14,
    color: COLORS.danger,
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
  bannerError: {
    backgroundColor: COLORS.dangerBg,
  },
  bannerSuccess: {
    backgroundColor: COLORS.successBg,
  },
  bannerText: {
    // flex: 1,
    // marginLeft: 8,
    // fontSize: 13,
    // fontWeight: '600',
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },

  // Acciones
  forgotButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
    marginBottom: 20,
    minHeight: 20,
    justifyContent: 'center',
  },
  forgotText: {
    // fontSize: 14,
    // fontWeight: '700',
    // color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  button: {
    // backgroundColor: COLORS.primary,
    // height: 52,
    // borderRadius: 12,
    // alignItems: 'center',
    // justifyContent: 'center',
    // elevation: 2,
    // shadowColor: COLORS.primaryDark,
    // shadowOpacity: 0.25,
    // shadowRadius: 6,
    // shadowOffset: { width: 0, height: 3 },
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    // color: '#fff',
    // fontSize: 16,
    // fontWeight: '700',
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    // fontSize: 14,
    // color: COLORS.muted,
    fontSize: 15,
    color: COLORS.muted,
  },
  footerLink: {
    // fontSize: 14,
    // fontWeight: '700',
    // color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
    // Pie legal
  legalContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingTop: 32,
  },
  legalDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  legalText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.muted,
    textAlign: 'center',
  },
  legalLink: {
    fontWeight: '700',
    color: COLORS.primaryDark,
  },

  // Ventana de términos
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  modalBody: {
    flexGrow: 0,
  },
  modalHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  modalText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.muted,
    marginTop: 4,
  },
});
