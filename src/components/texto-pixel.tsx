import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colores, Fuentes } from '@/constants/theme';

type Props = TextProps & { tam?: number; color?: string };

// Texto en la fuente pixel (Press Start 2P). Siempre en mayúsculas, como una pantalla retro.
export function TextoPixel({ tam = 10, color = Colores.tinta, style, children, ...props }: Props) {
  return (
    <Text {...props} style={[styles.base, { fontSize: tam, lineHeight: tam * 1.6, color }, style]}>
      {typeof children === 'string' ? children.toUpperCase() : children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: { fontFamily: Fuentes.pixel },
});
