import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Details() {
  const params = useLocalSearchParams();
  const [pokemon, setPokemon] = useState<any>(null);

  useEffect(() => {
    fetchPokemon();
  }, []);

  async function fetchPokemon() {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${params.name}`,
      );
      const data = await response.json();
      setPokemon(data);
    } catch (error) {
      console.log(error);
    }
  }

  // 1. Loading State Check
  // Since fetching takes time, `pokemon` starts as `null`.
  // If we try to render `<Text>{pokemon.name}</Text>` while it's null, the app will crash!
  // We return a simple loading message until `setPokemon(data)` happens.
  if (!pokemon) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Custom drag indicator (grabber) for Android */}
      <View style={styles.grabberContainer}>
        <View style={styles.grabber} />
      </View>

      <ScrollView
        contentContainerStyle={{
          gap: 16,
          padding: 16,
        }}
      >
        <View style={styles.card}>
          <Text style={styles.name}>{pokemon.name}</Text>
          <Text style={styles.type}>{pokemon.types[0].type.name}</Text>

          {/* 2. Using the correct image paths */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {/* 
                In index.tsx, you manually mapped the response to a custom object.
                Here, you're using the RAW data straight from the API!
                The PokeAPI puts its images inside a `sprites` object. 
            */}
            <Image
              source={{ uri: pokemon.sprites.front_default }}
              style={{ width: 150, height: 150 }}
            />

            <Image
              source={{ uri: pokemon.sprites.back_default }}
              style={{ width: 150, height: 150 }}
            />
          </View>

          {/* 3. Extra Details Section */}
          {/* We use basic Views and Texts just like index.tsx, but arranged nicely */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weight:</Text>
              {/* API gives weight in hectograms, dividing by 10 gives kilograms */}
              <Text style={styles.infoValue}>{pokemon.weight / 10} kg</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height:</Text>
              {/* API gives height in decimeters, dividing by 10 gives meters */}
              <Text style={styles.infoValue}>{pokemon.height / 10} m</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Base XP:</Text>
              <Text style={styles.infoValue}>{pokemon.base_experience}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  grabberContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  grabber: {
    width: 40,
    height: 5,
    backgroundColor: "#D0D0D0",
    borderRadius: 2.5,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    // These shadow properties make the white card "pop" out of the background
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "capitalize", // This automatically makes "pikachu" -> "Pikachu"
  },
  type: {
    fontSize: 20,
    fontWeight: "bold",
    color: "gray",
    textAlign: "center",
    textTransform: "capitalize",
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: "#F5F5F5", // Light gray background box
    borderRadius: 12,
    padding: 16,
    gap: 8, // Adds vertical space between our infoRows
    marginTop: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Pushes the Label left and the Value right!
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "gray",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
