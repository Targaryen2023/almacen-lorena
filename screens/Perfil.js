// screens/Perfil.js
// Pestaña "Perfil" (Figma 09 · Perfil).
// TAREA 2: pantalla provisoria para que la pestaña exista.
// La interfaz completa se arma en la tarea 4.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { estilosComunes } from '../src/estilos';

export default function Perfil() {
  const insets = useSafeAreaInsets();

  return (
    <View style={estilosComunes.pantalla}>
      <View style={[estilosComunes.franja, styles.franja, { paddingTop: insets.top + 20 }]}>
        <Text style={estilosComunes.titulo}>Mi perfil</Text>
      </View>
      <View style={styles.contenido}>
        <Text style={estilosComunes.subtitulo}>Pantalla en construcción (tarea 4).</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  franja: { alignItems: 'center' },
  contenido: { padding: 24, alignItems: 'center' },
});
