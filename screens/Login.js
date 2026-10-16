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
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Iniciar sesión</Text>

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
          <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpText}>¿No tienes cuenta aún? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#b9770e',
    marginBottom: 20,
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
  },
  button: {
    backgroundColor: '#922b21',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpText: {
    marginTop: 20,
    color: '#007AFF',
  },
});
