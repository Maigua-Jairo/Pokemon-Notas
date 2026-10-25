import { useSyncExternalStore } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PokedexHeader } from '@/components/pokedex-header';
import { TextoPixel } from '@/components/texto-pixel';
import { Colores } from '@/constants/theme';
import { bitacora } from '@/lib/logger';

const COLOR_TAG: Record<string, string> = {
  Red: '#7FD6FF',
  Persistencia: '#FFD166',
  'Mutación': '#FF8FA3',
  MockAPI: '#B8F2A0',
  PokeAPI: '#C9B6FF',
};

// Consola de logs con hora dentro de la app (se abre tocando la lente azul).
// Sirve para mostrar en el video, desde el APK, el orden real de los eventos.
export default function Bitacora() {
  const insets = useSafeAreaInsets();
  const entradas = useSyncExternalStore(bitacora.suscribir, bitacora.leer);

  return (
    <View style={styles.pantalla}>
      <PokedexHeader
        titulo="Bitácora"
        atras
        derecha={
          <Pressable onPress={bitacora.limpiar} hitSlop={10}>
            <TextoPixel tam={8} color={Colores.papel}>borrar</TextoPixel>
          </Pressable>
        }
      />
      <View style={styles.consola}>
        <FlatList
          data={entradas}
          keyExtractor={(e) => String(e.id)}
          contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + 16, gap: 8 }}
          ListEmptyComponent={<TextoPixel tam={8} color={Colores.lcd}>Sin eventos todavía.</TextoPixel>}
          renderItem={({ item }) => (
            <Text style={styles.linea}>
              <Text style={styles.hora}>{item.hora} </Text>
              <Text style={{ color: COLOR_TAG[item.tag] ?? Colores.papel }}>{`[${item.tag}] `}</Text>
              {item.mensaje}
            </Text>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.crema },
  consola: { flex: 1, backgroundColor: '#141A12', margin: 12, borderRadius: 8, borderWidth: 3, borderColor: Colores.tinta },
  linea: { fontFamily: 'monospace', fontSize: 12, lineHeight: 17, color: Colores.lcd },
  hora: { color: '#8A9A7A' },
});
