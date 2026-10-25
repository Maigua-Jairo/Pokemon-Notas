import { StyleSheet, View } from 'react-native';

import { TextoPixel } from '@/components/texto-pixel';
import { BORDE, Colores } from '@/constants/theme';
import { useEstadoRed } from '@/hooks/use-red';

// Pantallita LCD que explica qué está pasando con la caché y la cola de cambios.
// Solo aparece cuando hay algo que contar.
export function PantallaLcd() {
  const { online, restaurando, pendientes } = useEstadoRed();

  const lineas: string[] = [];
  if (restaurando) lineas.push('▶ Leyendo caché guardada…');
  if (!online) lineas.push('▶ Sin conexión: datos de la caché');
  if (pendientes > 0) {
    const cambios = pendientes === 1 ? '1 cambio' : `${pendientes} cambios`;
    lineas.push(online ? `▶ Enviando ${cambios}…` : `▶ ${cambios} en cola`);
  }
  if (lineas.length === 0) return null;

  return (
    <View style={styles.marco}>
      <View style={styles.lcd}>
        {lineas.map((linea) => (
          <TextoPixel key={linea} tam={8} color={Colores.lcdTinta}>{linea}</TextoPixel>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  marco: { backgroundColor: Colores.tinta, padding: 5, borderRadius: 6, marginHorizontal: 16, marginTop: 12 },
  lcd: { backgroundColor: Colores.lcd, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 3, gap: 4, borderWidth: BORDE - 1, borderColor: '#8FB066' },
});
