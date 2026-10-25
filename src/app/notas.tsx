import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotaItem } from '@/components/nota-item';
import { PantallaLcd } from '@/components/pantalla-lcd';
import { PokedexHeader } from '@/components/pokedex-header';
import { TextoPixel } from '@/components/texto-pixel';
import { BORDE, Colores } from '@/constants/theme';
import { useNotasVisibles } from '@/hooks/use-notas';

type Filtro = 'todas' | 'favoritas' | 'pendientes';

export default function MisNotas() {
  const insets = useSafeAreaInsets();
  const { notas, refetch, isRefetching, isPending } = useNotasVisibles();
  const [filtro, setFiltro] = useState<Filtro>('todas');

  const visibles = notas.filter((n) =>
    filtro === 'favoritas' ? n.favorito : filtro === 'pendientes' ? n.pendiente : true
  );

  return (
    <View style={styles.pantalla}>
      <PokedexHeader titulo="Mis notas" atras />
      <PantallaLcd />

      <View style={styles.filtros}>
        {(['todas', 'favoritas', 'pendientes'] as const).map((f) => (
          <Pressable key={f} onPress={() => setFiltro(f)} style={[styles.filtro, filtro === f && styles.filtroActivo]}>
            <TextoPixel tam={7} color={filtro === f ? Colores.papel : Colores.tinta}>
              {f === 'favoritas' ? '★ fav' : f === 'pendientes' ? '⏳ cola' : 'todas'}
            </TextoPixel>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={visibles}
        keyExtractor={(n) => n.id}
        contentContainerStyle={[styles.lista, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => { refetch(); }} colors={[Colores.rojo]} />}
        renderItem={({ item }) => <NotaItem nota={item} mostrarPokemon />}
        ListEmptyComponent={
          <TextoPixel tam={8} color={Colores.tintaSuave} style={styles.vacio}>
            {isPending ? 'Cargando notas…' : 'Nada por aquí. Elige un pokémon en la Pokédex y anota algo.'}
          </TextoPixel>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.crema },
  filtros: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 14 },
  filtro: { borderWidth: BORDE - 1, borderColor: Colores.tinta, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: Colores.papel },
  filtroActivo: { backgroundColor: Colores.tinta },
  lista: { padding: 16, gap: 12 },
  vacio: { textAlign: 'center', marginTop: 40, lineHeight: 16 },
});
