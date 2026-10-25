import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { BORDE, Colores, RADIO, SOMBRA } from '@/constants/theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contenedor?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
};

// Caja con borde de tinta y sombra dura desplazada (sin desenfoque), como un sticker.
// Si es presionable, al tocarla se "hunde" sobre su sombra.
export function Caja({ children, style, contenedor, onPress, disabled }: Props) {
  const contenido = (hundida: boolean) => (
    <>
      <View style={[styles.sombra, hundida && styles.oculta]} />
      <View style={[styles.caja, style, hundida && styles.hundida]}>{children}</View>
    </>
  );

  if (!onPress) return <View style={[styles.contenedor, contenedor]}>{contenido(false)}</View>;

  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.contenedor, contenedor, disabled && styles.deshabilitada]}>
      {({ pressed }) => contenido(pressed)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contenedor: { marginRight: SOMBRA, marginBottom: SOMBRA },
  sombra: {
    ...StyleSheet.absoluteFill,
    top: SOMBRA,
    left: SOMBRA,
    right: -SOMBRA,
    bottom: -SOMBRA,
    backgroundColor: Colores.tinta,
    borderRadius: RADIO,
  },
  oculta: { opacity: 0 },
  caja: {
    backgroundColor: Colores.papel,
    borderWidth: BORDE,
    borderColor: Colores.tinta,
    borderRadius: RADIO,
  },
  hundida: { transform: [{ translateX: SOMBRA }, { translateY: SOMBRA }] },
  deshabilitada: { opacity: 0.45 },
});
