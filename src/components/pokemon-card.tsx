import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Caja } from '@/components/caja';
import { TextoPixel } from '@/components/texto-pixel';
import { Colores, colorTipo, numeroPokedex, spritePixel } from '@/constants/theme';
import { usePokemon } from '@/hooks/use-pokemon';

type Props = { id: number; nombre: string; notas: number };

export function PokemonCard({ id, nombre, notas }: Props) {
  // Cada tarjeta pide su detalle para conocer el tipo; queda cacheado (y persistido)
  // con la clave pokemon.detail(id), así la pantalla de detalle abre al instante.
  const { data } = usePokemon(id);
  const tipo = data?.types[0]?.type.name;

  return (
    <Caja contenedor={styles.contenedor} style={[styles.card, { backgroundColor: colorTipo(tipo) }]} onPress={() => router.push({ pathname: '/pokemon/[id]', params: { id } })}>
      <View style={styles.cabecera}>
        <TextoPixel tam={8}>{numeroPokedex(id)}</TextoPixel>
        {notas > 0 && (
          <View style={styles.badge}>
            <TextoPixel tam={7} color={Colores.papel}>✎{notas}</TextoPixel>
          </View>
        )}
      </View>
      <Image source={spritePixel(id)} style={styles.sprite} contentFit="contain" cachePolicy="disk" transition={150} />
      <View style={styles.nombre}>
        <TextoPixel tam={8} numberOfLines={1}>{nombre}</TextoPixel>
      </View>
    </Caja>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  card: { overflow: 'hidden' },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, paddingTop: 8 },
  badge: { backgroundColor: Colores.tinta, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2 },
  sprite: { width: '100%', height: 92 },
  nombre: { backgroundColor: Colores.papel, borderTopWidth: 3, borderTopColor: Colores.tinta, paddingVertical: 8, paddingHorizontal: 8 },
});
