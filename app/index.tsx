import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

export default function Index() {
  const [pokemons, setPokemons] = useState([]);


  useEffect(() => {
    // fetch pokemon
    fetchPokemon();
  }, []);

  async function fetchPokemon() {
    try {

      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");
      const data = await response.json();

      setPokemons(data.results);

    } catch (error) {
      console.log(error);
    }
  }

  return (
    <ScrollView>
      {pokemons.map((pokemon) => (
        <View key={pokemon.name}>
          <Text>{pokemon.name}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
