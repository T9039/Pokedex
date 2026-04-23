import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function Details() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [pokemon, setPokemon] = useState<any>(null);

  // 1. Bottom Sheet Setup
  const bottomSheetRef = useRef<BottomSheet>(null);
  // These are the stops the sheet will snap to (50% of the screen, and 90% of the screen)
  const snapPoints = useMemo(() => ["50%", "90%"], []);

  useEffect(() => {
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

    fetchPokemon();
  }, [params.name]);



  // Loading State
  if (!pokemon) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    // 2. The Transparent Overlay
    // This darkens the background behind the modal. Tapping it will close the screen.
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => router.back()}
      />

      {/* 3. The Magical Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0} // Opens at the first snap point (50%)
        snapPoints={snapPoints}
        enablePanDownToClose={true} // Allows you to swipe it all the way into the floor
        onClose={() => router.back()} // When the sheet is fully closed, tell Expo Router to go back
        backgroundStyle={{ backgroundColor: "#F9F9F9" }}
      >
        {/* 
          4. BottomSheetScrollView 
          This replaces the standard ScrollView. It is specifically designed by 
          the Gorhom team to communicate perfectly with the Bottom Sheet's drag gestures! 
        */}
        <BottomSheetScrollView
          contentContainerStyle={{
            gap: 16,
            padding: 16,
          }}
        >
          <View style={styles.card}>
            <Text style={styles.name}>{pokemon.name}</Text>

            <View style={styles.typesContainer}>
              {pokemon.types.map((t: any) => (
                <Text key={t.type.name} style={styles.type}>
                  {t.type.name}
                </Text>
              ))}
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Image
                source={{ uri: pokemon.sprites.front_default }}
                style={{ width: 150, height: 150 }}
              />

              <Image
                source={{ uri: pokemon.sprites.back_default }}
                style={{ width: 150, height: 150 }}
              />
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Weight:</Text>
                <Text style={styles.infoValue}>{pokemon.weight / 10} kg</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Height:</Text>
                <Text style={styles.infoValue}>{pokemon.height / 10} m</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Base XP:</Text>
                <Text style={styles.infoValue}>{pokemon.base_experience}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Abilities</Text>
            <View style={styles.infoBox}>
              {pokemon.abilities.map((item: any) => (
                <View key={item.ability.name} style={styles.infoRow}>
                  <Text
                    style={[styles.infoLabel, { textTransform: "capitalize" }]}
                  >
                    {item.ability.name.replace("-", " ")}
                  </Text>
                  <Text style={styles.infoValue}>
                    {item.is_hidden ? "Hidden" : "Standard"}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Base Stats</Text>
            <View style={styles.infoBox}>
              {pokemon.stats.map((item: any) => (
                <View key={item.stat.name} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    {item.stat.name.toUpperCase().replace("-", " ")}
                  </Text>
                  <Text style={styles.infoValue}>{item.base_stat}</Text>
                </View>
              ))}
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
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
    textTransform: "capitalize",
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
    backgroundColor: "#A0A0A0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: "hidden",
    textAlign: "center",
    textTransform: "capitalize",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 24,
  },
  infoBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
