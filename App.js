import React from 'react';
import 'react-native-gesture-handler';
import { ActivityIndicator, View } from 'react-native';
// Tipografía Montserrat (Manual de Identidad). Se instala con:
//   npx expo install @expo-google-fonts/montserrat expo-font
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import Navigation from './navigation/Navigation';
import { COLORES } from './src/estilos';

export default function App() {
  // useFonts carga las fuentes; "fuentesListas" pasa a true cuando terminan.
  const [fuentesListas] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });

  // Mientras cargan, una ruedita: así ninguna pantalla se dibuja con la letra equivocada.
  if (!fuentesListas) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORES.fondo,
        }}
      >
        <ActivityIndicator size="large" color={COLORES.violeta} />
      </View>
    );
  }

  return <Navigation />;
}
