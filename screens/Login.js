import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';

const COLORS = {
  headerBg: '#D9EBF8',
  screenBg: '#F0F6FA',
  card: '#FFFFFF',
  text: '#1B1F23',
  muted: '#5B6B7A',
  placeholder: '#8A97A4',
  border: '#D5DEE6',
  primary: '#8C63D6',
  primaryDark: '#754FC2',
  danger: '#C0392B',
  dangerBg: '#FDECEA',
  // successBg: '#EFE8FA',
  successBg: '#E9E0F8'
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
          <View style={styles.logoWrapper}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
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
          <Text style={styles.label}>Correo</Text>
          <View style={styles.inputContainer}>
            <FontAwesome name="envelope" size={20} color="#ccc" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ingrese su correo"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#ccc" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ingrese su contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={20} color="#ccc" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Ingresar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpText}>¿No tienes cuenta aún? Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
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
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  labelSpaced: {
    marginTop: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    height: '100%',
  },
  fieldError: {
    marginTop: 6,
    fontSize: 13,
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
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
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
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 52,
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.muted,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});
