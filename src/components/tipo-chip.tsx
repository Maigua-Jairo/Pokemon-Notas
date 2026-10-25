import { StyleSheet, View } from 'react-native';

import { TextoPixel } from '@/components/texto-pixel';
import { Colores, colorTipo, TIPOS } from '@/constants/theme';

export function TipoChip({ tipo }: { tipo: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: colorTipo(tipo) }]}>
      <TextoPixel tam={7} color={Colores.papel} style={styles.texto}>{TIPOS[tipo]?.nombre ?? tipo}</TextoPixel>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { borderWidth: 2, borderColor: Colores.tinta, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3 },
  texto: { textShadowColor: Colores.tinta, textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 0.1 },
});
