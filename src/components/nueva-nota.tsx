import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Caja } from '@/components/caja';
import { TextoPixel } from '@/components/texto-pixel';
import { BORDE, Colores, RADIO } from '@/constants/theme';
import { useCrearNota } from '@/hooks/use-notas';

export function NuevaNota({ pokemonId, nombre }: { pokemonId: number; nombre: string }) {
  const crear = useCrearNota();
  const [texto, setTexto] = useState('');

  const guardar = () => {
    if (!texto.trim()) return;
    // Sin red, la mutación queda en pausa y la nota aparece como "pendiente".
    crear.mutate({ pokemonId, nombre, nota: texto.trim(), favorito: false });
    setTexto('');
  };

  return (
    <View style={styles.form}>
      <TextInput
        value={texto}
        onChangeText={setTexto}
        placeholder={`¿Qué sabes de ${nombre}?`}
        placeholderTextColor={Colores.tintaSuave}
        multiline
        style={styles.input}
      />
      <Caja onPress={guardar} disabled={!texto.trim()} style={styles.boton}>
        <TextoPixel tam={9} color={Colores.papel}>+ anotar</TextoPixel>
      </Caja>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 10 },
  input: {
    minHeight: 72,
    backgroundColor: Colores.papel,
    borderWidth: BORDE,
    borderColor: Colores.tinta,
    borderRadius: RADIO,
    padding: 12,
    fontSize: 15,
    color: Colores.tinta,
    textAlignVertical: 'top',
  },
  boton: { backgroundColor: Colores.rojo, paddingVertical: 12, alignItems: 'center' },
});
