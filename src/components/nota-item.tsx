import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Caja } from '@/components/caja';
import { TextoPixel } from '@/components/texto-pixel';
import { Colores, numeroPokedex, spritePixel } from '@/constants/theme';
import { NotaVisible, useEditarNota } from '@/hooks/use-notas';

type Props = { nota: NotaVisible; mostrarPokemon?: boolean };

export function NotaItem({ nota, mostrarPokemon }: Props) {
  const editar = useEditarNota();
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(nota.nota);

  // Una nota creada sin red aún no tiene id en MockAPI: no se puede editar hasta que llegue.
  const editable = !nota.local;
  const { pendiente: _p, local: _l, ...datos } = nota;

  const guardar = () => {
    if (texto.trim() && texto.trim() !== nota.nota) editar.mutate({ ...datos, nota: texto.trim() });
    setEditando(false);
  };

  return (
    <Caja style={[styles.caja, nota.pendiente && styles.cajaPendiente]}>
      {mostrarPokemon && (
        <Pressable style={styles.pokemon} onPress={() => router.push({ pathname: '/pokemon/[id]', params: { id: nota.pokemonId } })}>
          <Image source={spritePixel(nota.pokemonId)} style={styles.mini} cachePolicy="disk" />
          <TextoPixel tam={7} color={Colores.tintaSuave}>{`${numeroPokedex(nota.pokemonId)} ${nota.nombre}`}</TextoPixel>
        </Pressable>
      )}

      <View style={styles.fila}>
        {editando ? (
          <TextInput value={texto} onChangeText={setTexto} autoFocus multiline style={[styles.texto, styles.input]} onSubmitEditing={guardar} blurOnSubmit />
        ) : (
          <Text style={styles.texto}>{nota.nota}</Text>
        )}
        <Pressable
          hitSlop={10}
          disabled={!editable}
          onPress={() => editar.mutate({ ...datos, favorito: !nota.favorito })}
          accessibilityLabel={nota.favorito ? 'Quitar de favoritos' : 'Marcar como favorita'}>
          <Text style={[styles.estrella, nota.favorito && styles.estrellaOn, !editable && styles.apagado]}>{nota.favorito ? '★' : '☆'}</Text>
        </Pressable>
      </View>

      <View style={styles.pie}>
        {nota.pendiente ? (
          <View style={styles.sello}>
            <TextoPixel tam={7}>{nota.local ? '⏳ pendiente de crear' : '⏳ pendiente de guardar'}</TextoPixel>
          </View>
        ) : (
          <TextoPixel tam={7} color={Colores.tintaSuave}>{`✓ guardada · id ${nota.id}`}</TextoPixel>
        )}
        {editable && (
          <Pressable hitSlop={10} onPress={editando ? guardar : () => { setTexto(nota.nota); setEditando(true); }}>
            <TextoPixel tam={7} color={Colores.rojo}>{editando ? 'guardar' : 'editar'}</TextoPixel>
          </Pressable>
        )}
      </View>
    </Caja>
  );
}

const styles = StyleSheet.create({
  caja: { padding: 12, gap: 10 },
  cajaPendiente: { borderStyle: 'dashed', backgroundColor: '#FFF6D6' },
  pokemon: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -6, marginLeft: -6 },
  mini: { width: 32, height: 32 },
  fila: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  texto: { flex: 1, fontSize: 15, lineHeight: 21, color: Colores.tinta },
  input: { borderBottomWidth: 2, borderColor: Colores.rojo, paddingVertical: 2 },
  estrella: { fontSize: 24, lineHeight: 26, color: Colores.tintaSuave },
  estrellaOn: { color: '#E8A200' },
  apagado: { opacity: 0.3 },
  pie: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sello: { backgroundColor: Colores.pendiente, borderWidth: 2, borderColor: Colores.tinta, borderRadius: 3, paddingHorizontal: 6, paddingVertical: 3 },
});
