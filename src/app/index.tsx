import { router } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { idDesdeUrl } from '@/api/pockeService';
import { Caja } from '@/components/caja';
import { PantallaLcd } from '@/components/pantalla-lcd';
import { PokedexHeader } from '@/components/pokedex-header';
import { PokemonCard } from '@/components/pokemon-card';
import { TextoPixel } from '@/components/texto-pixel';
import { Colores } from '@/constants/theme';
import { useNotasVisibles } from '@/hooks/use-notas';
import { usePokemonList } from '@/hooks/use-pokemon';
import { hora } from '@/lib/logger';

export default function Pokedex() {
  const insets = useSafeAreaInsets();
  const pokemon = usePokemonList();
  const notas = useNotasVisibles();

  const notasPorPokemon = new Map<number, number>();
  for (const n of notas.notas) notasPorPokemon.set(n.pokemonId, (notasPorPokemon.get(n.pokemonId) ?? 0) + 1);

  const actualizado = (t: number) => (t ? hora(new Date(t)).slice(0, 8) : '--:--:--');

  return (
    <View style={styles.pantalla}>
      <PokedexHeader
        titulo="Pokédex"
        derecha={
          <Caja onPress={() => router.push('/notas')} style={styles.botonNotas}>
            <TextoPixel tam={8}>{`notas ${notas.notas.length}`}</TextoPixel>
          </Caja>
        }
      />
      <PantallaLcd />

      <FlatList
        data={pokemon.data?.results ?? []}
        keyExtractor={(p) => p.name}
        numColumns={2}
        columnWrapperStyle={styles.columnas}
        contentContainerStyle={[styles.lista, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={
          <RefreshControl
            refreshing={pokemon.isRefetching || notas.isRefetching}
            onRefresh={() => { pokemon.refetch(); notas.refetch(); }}
            colors={[Colores.rojo]}
          />
        }
        ListHeaderComponent={
          // Hora de la última respuesta del servidor: al abrir sin red se ve que los datos son de la caché.
          <TextoPixel tam={7} color={Colores.tintaSuave} style={styles.meta}>
            {`pokeapi ${actualizado(pokemon.dataUpdatedAt)} · mockapi ${actualizado(notas.dataUpdatedAt)}`}
          </TextoPixel>
        }
        ListEmptyComponent={
          <TextoPixel tam={9} color={Colores.tintaSuave} style={styles.vacio}>
            {pokemon.isError ? 'No se pudo cargar la Pokédex' : 'Cargando Pokédex…'}
          </TextoPixel>
        }
        renderItem={({ item }) => {
          const id = idDesdeUrl(item.url);
          return <PokemonCard id={id} nombre={item.name} notas={notasPorPokemon.get(id) ?? 0} />;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.crema },
  botonNotas: { backgroundColor: Colores.ledAmarillo, paddingHorizontal: 10, paddingVertical: 8 },
  lista: { padding: 16, gap: 12 },
  columnas: { gap: 12 },
  meta: { marginBottom: 4 },
  vacio: { textAlign: 'center', marginTop: 40 },
});
