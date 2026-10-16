import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// Pestañas inferiores. Se instala con: npx expo install @react-navigation/bottom-tabs
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../src/config/firebaseConfig';
import { estadoRegistro } from '../src/estadoRegistro';
import { COLORES, FUENTES } from '../src/estilos';
import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import Home from '../screens/Home';
import Perfil from '../screens/Perfil';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Ícono y texto de cada pestaña (Figma 04 y 09)
const PESTANAS = {
  Home: { icono: 'package', texto: 'Productos' },
  Perfil: { icono: 'user', texto: 'Perfil' },
};

// ---------------------------------------------------------------------------
// Barra inferior propia, igual al Figma: la pestaña activa lleva un fondo
// violeta claro detrás del ícono y el texto. React Navigation le pasa:
//   state      → qué pestañas hay y cuál está activa (state.index)
//   navigation → para cambiar de pestaña
// ---------------------------------------------------------------------------
function BarraInferior({ state, navigation }) {
  const insets = useSafeAreaInsets(); // espacio de la barra de gestos del celular

  return (
    <View style={[styles.barra, { paddingBottom: insets.bottom + 8 }]}>
      {state.routes.map((ruta, indice) => {
        const activa = state.index === indice;
        const { icono, texto } = PESTANAS[ruta.name];
        const color = activa ? COLORES.violeta : COLORES.textoSuave;

        return (
          <TouchableOpacity
            key={ruta.key}
            style={[styles.pestana, activa && styles.pestanaActiva]}
            onPress={() => navigation.navigate(ruta.name)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activa }}
          >
            <Feather name={icono} size={22} color={color} />
            <Text style={[styles.textoPestana, { color }, activa && styles.textoActivo]}>
              {texto}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Pantallas con pestañas: lo que se ve después de iniciar sesión
function Principal() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BarraInferior {...props} />}
      screenOptions={{ headerShown: false }} // cada pantalla dibuja su franja celeste
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Perfil" component={Perfil} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (usuario) => {
      // Durante el registro se ignora la sesión automática de Firebase,
      // así no salta a Home: SignUp cierra la sesión y vuelve a Login.
      if (estadoRegistro.enCurso) return;
      setUser(usuario);
    });
  }, []);

  if (!isFirebaseConfigured) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Falta configurar Firebase. Copia .env.example como .env y completa los datos de tu
          proyecto.
        </Text>
      </View>
    );
  }

  if (user === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORES.violeta} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Con sesión: pantallas con pestañas (Productos / Perfil)
          <Stack.Screen name="Principal" component={Principal} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} options={{ title: 'Iniciar sesión' }} />
            {/* Registro dibuja su propia franja con la flecha (Figma 03), por eso sin encabezado */}
            <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORES.fondo,
  },
  message: { textAlign: 'center', fontSize: 16 },

  // Barra inferior (Figma: blanca, con línea gris arriba)
  barra: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORES.blanco,
    borderTopWidth: 1,
    borderTopColor: COLORES.gris,
    paddingTop: 8,
  },
  pestana: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 112,
    height: 54,
    borderRadius: 14,
  },
  pestanaActiva: { backgroundColor: COLORES.violetaSuave },
  textoPestana: { fontFamily: FUENTES.media, fontSize: 12, marginTop: 2 },
  textoActivo: { fontFamily: FUENTES.negrita },
});
