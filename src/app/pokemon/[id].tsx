import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Caja } from '@/components/caja';
import { NotaItem } from '@/components/nota-item';
import { NuevaNota } from '@/components/nueva-nota';
import { PantallaLcd } from '@/components/pantalla-lcd';
import { PokedexHeader } from '@/components/pokedex-header';
import { TextoPixel } from '@/components/texto-pixel';
import { TipoChip } from '@/components/tipo-chip';
import { Colores, colorTipo, numeroPokedex, spriteArte } from '@/constants/theme';
import { useNotasDePokemon } from '@/hooks/use-notas';
import { usePokemon } from '@/hooks/use-pokemon';

export default function DetallePokemon() {
  const insets = useSafeAreaInsets();
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const { data: pokemon, isPending, isError } = usePokemon(id);
  const { notas } = useNotasDePokemon(id);

  const tipo = pokemon?.types[0]?.type.name;

  return (
    <View style={styles.pantalla}>
      <PokedexHeader titulo={pokemon ? `${numeroPokedex(id)} ${pokemon.name}` : numeroPokedex(id)} atras />
      <PantallaLcd />

      <ScrollView contentContainerStyle={[styles.contenido, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.visorMarco}>
          <View style={[styles.visor, { backgroundColor: colorTipo(tipo) }]}>
            <Image source={spriteArte(id)} style={styles.arte} contentFit="contain" cachePolicy="disk" transition={200} />
          </View>
        </View>

        {pokemon ? (
          <Caja style={styles.ficha}>
            <View style={styles.tipos}>
              {pokemon.types.map((t) => <TipoChip key={t.type.name} tipo={t.type.name} />)}
            </View>
            <View style={styles.datos}>
              <Dato etiqueta="altura" valor={`${pokemon.height / 10} m`} />
              <Dato etiqueta="peso" valor={`${pokemon.weight / 10} kg`} />
              <Dato etiqueta="notas" valor={String(notas.length)} />
            </View>
          </Caja>
        ) : (
          <TextoPixel tam={8} color={Colores.tintaSuave}>
            {isPending ? 'Cargando datos…' : isError ? 'Sin datos en caché para este pokémon' : ''}
          </TextoPixel>
        )}

        <TextoPixel tam={10} style={styles.seccion}>Nueva nota</TextoPixel>
        <NuevaNota pokemonId={id} nombre={pokemon?.name ?? numeroPokedex(id)} />

        <TextoPixel tam={10} style={styles.seccion}>{`Mis notas (${notas.length})`}</TextoPixel>
        {notas.length === 0 ? (
          <TextoPixel tam={8} color={Colores.tintaSuave}>Todavía no anotaste nada.</TextoPixel>
        ) : (
          notas.map((nota) => <NotaItem key={nota.id} nota={nota} />)
        )}
      </ScrollView>
    </View>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={styles.dato}>
      <TextoPixel tam={6} color={Colores.tintaSuave}>{etiqueta}</TextoPixel>
      <TextoPixel tam={10}>{valor}</TextoPixel>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.crema },
  contenido: { padding: 16, gap: 12 },
  visorMarco: { backgroundColor: Colores.tinta, padding: 8, borderRadius: 10, borderBottomRightRadius: 36 },
  visor: { borderRadius: 4, borderBottomRightRadius: 30, alignItems: 'center', paddingVertical: 8 },
  arte: { width: 200, height: 200 },
  ficha: { padding: 14, gap: 14 },
  tipos: { flexDirection: 'row', gap: 8 },
  datos: { flexDirection: 'row', justifyContent: 'space-between' },
  dato: { gap: 6 },
  seccion: { marginTop: 12 },
});
