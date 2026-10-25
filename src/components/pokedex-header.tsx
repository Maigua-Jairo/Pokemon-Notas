import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TextoPixel } from '@/components/texto-pixel';
import { BORDE, Colores } from '@/constants/theme';
import { useEstadoRed } from '@/hooks/use-red';

type Props = { titulo: string; atras?: boolean; derecha?: ReactNode };

function Led({ encendido, color, etiqueta }: { encendido: boolean; color: string; etiqueta: string }) {
  return (
    <View style={styles.ledCaja}>
      <View style={[styles.led, { backgroundColor: encendido ? color : Colores.ledApagado }]}>
        {encendido && <View style={styles.ledBrillo} />}
      </View>
      <TextoPixel tam={6} color={Colores.papel}>{etiqueta}</TextoPixel>
    </View>
  );
}

// Cabecera con forma de Pokédex. Los LEDs reflejan el estado real de TanStack Query:
// RED (onlineManager), COLA (mutaciones pendientes) y SYNC (fetch/mutación en curso).
export function PokedexHeader({ titulo, atras, derecha }: Props) {
  const insets = useSafeAreaInsets();
  const { online, pendientes, sincronizando } = useEstadoRed();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <StatusBar style="light" />
      <View style={styles.fila}>
        <View style={styles.lente}>
          <View style={styles.lenteBrillo} />
        </View>
        <Led encendido color={online ? Colores.ledVerde : Colores.ledRojo} etiqueta={online ? 'red' : 'off'} />
        <Led encendido={pendientes > 0} color={Colores.ledAmarillo} etiqueta={pendientes > 0 ? `cola ${pendientes}` : 'cola'} />
        <Led encendido={sincronizando} color={Colores.ledAzul} etiqueta="sync" />
      </View>

      <View style={styles.titulo}>
        {atras && (
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.atras}>
            <TextoPixel tam={14} color={Colores.papel}>◀</TextoPixel>
          </Pressable>
        )}
        <TextoPixel tam={15} color={Colores.papel} numberOfLines={1} style={styles.tituloTexto}>
          {titulo}
        </TextoPixel>
        {derecha}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colores.rojo,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: BORDE + 3,
    borderBottomColor: Colores.rojoOscuro,
  },
  fila: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  lente: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colores.lente,
    borderWidth: 5,
    borderColor: Colores.papel,
    outlineWidth: BORDE,
    outlineColor: Colores.tinta,
    marginRight: 6,
  },
  lenteBrillo: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#BFE4FF', marginTop: 7, marginLeft: 8 },
  ledCaja: { alignItems: 'center', gap: 4, marginTop: 2 },
  led: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: Colores.tinta },
  ledBrillo: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#FFFFFFAA', marginTop: 2, marginLeft: 2 },
  titulo: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 12 },
  atras: { paddingVertical: 4 },
  tituloTexto: { flex: 1, textShadowColor: Colores.tinta, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0.1 },
});
