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
          
          {/* We use .map() to handle Pokemon with multiple types! */}
          <View style={styles.typesContainer}>
            {pokemon.types.map((t: any) => (
              <Text key={t.type.name} style={styles.type}>
                {t.type.name}
              </Text>
            ))}
          </View>

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

          {/* 4. Mapping over Arrays - Abilities */}
          {/* Here we take the abilities array and map each one to a row! */}
          <Text style={styles.sectionTitle}>Abilities</Text>
          <View style={styles.infoBox}>
            {pokemon.abilities.map((item: any) => (
              <View key={item.ability.name} style={styles.infoRow}>
                <Text style={[styles.infoLabel, { textTransform: "capitalize" }]}>
                  {item.ability.name.replace("-", " ")}
                </Text>
                {/* A ternary operator (condition ? true : false) shows if it's hidden */}
                <Text style={styles.infoValue}>
                  {item.is_hidden ? "Hidden" : "Standard"}
                </Text>
              </View>
            ))}
          </View>

          {/* 5. Mapping over Arrays - Base Stats */}
          <Text style={styles.sectionTitle}>Base Stats</Text>
          <View style={styles.infoBox}>
            {pokemon.stats.map((item: any) => (
              <View key={item.stat.name} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.stat.name.toUpperCase().replace("-", " ")}</Text>
                <Text style={styles.infoValue}>{item.base_stat}</Text>
              </View>
            ))}
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
  typesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  type: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#A0A0A0", // A generic gray badge
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: "hidden", // Ensures background respects border radius on iOS
    textAlign: "center",
    textTransform: "capitalize",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 24, // Pushes the section titles down a bit
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
