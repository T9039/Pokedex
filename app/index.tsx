import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

interface Pokemon {
  name: string;
  image: string;
  imageBack: string;
  types: PokemonType[];
}

interface PokemonType {
  type: {
    name: string;
    url: string;
  };
}

const colorsByType = {
  normal: "#E0E0D1",
  fire: "#F8C8A8",
  water: "#A8C8F8",
  grass: "#B8E0A8",
  electric: "#F8F8A8",
  ice: "#C8E8E8",
  fighting: "#E8A8A8",
  poison: "#D0B0D0",
  ground: "#F0E0B8",
  flying: "#C8C0F8",
  psychic: "#F8C8D8",
  bug: "#D8E0A8",
  rock: "#E0D8A8",
  ghost: "#B8A8D0",
  dragon: "#B8A0F8",
  steel: "#E0E0E8",
  dark: "#C8B8B0",
  fairy: "#F8D8E0",
};

export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);

  console.log(JSON.stringify(pokemons[0]), null, 2);
  useEffect(() => {
    // fetch pokemon
    fetchPokemon();
  }, []);

  async function fetchPokemon() {
    try {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=20",
      );
      const data = await response.json();

      // Fetch detailed info for each pokemon in parallel
      const detailedPokemons = await Promise.all(
        data.results.map(async (pokemon: any) => {
          const res = await fetch(pokemon.url);
          const details = await res.json();
          return {
            name: pokemon.name,
            image: details.sprites.front_default, // main sprite
            imageBack: details.sprites.back_default, // main sprite
            types: details.types,
          };
        }),
      );

      setPokemons(detailedPokemons);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{
        gap: 16,
        padding: 16,
      }}
    >
      {pokemons.map((pokemon) => (
        <View
          key={pokemon.name}
          style={{
            // @ts-ignore
            backgroundColor: colorsByType[pokemon.types[0].type.name],
          }}
        >
          <Text style={styles.name}>{pokemon.name}</Text>
          <Text style={styles.type}>{pokemon.types[0].type.name}</Text>

          <View
            style={{
              flexDirection: "row",
            }}
          >
            <Image
              source={{ uri: pokemon.image }}
              style={{ width: 150, height: 150 }}
            />

            <Image
              source={{ uri: pokemon.imageBack }}
              style={{ width: 150, height: 150 }}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 28,
    fontWeight: "bold",
  },

  type: {
    fontSize: 20,
    fontWeight: "bold",
    color: "gray",
  },
});
