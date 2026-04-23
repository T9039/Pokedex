import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function Details() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [pokemon, setPokemon] = useState<any>(null);
  const [species, setSpecies] = useState<any>(null); // NEW: Holds lore and habitat
  const [sheetIndex, setSheetIndex] = useState(0); // NEW: Tracks drag state

  const bottomSheetRef = useRef<BottomSheet>(null);
  // NEW: Three snap points for progressive disclosure
  const snapPoints = useMemo(() => ["55%", "90%", "100%"], []);

  useEffect(() => {
    fetchPokemon();
  }, []);

  async function fetchPokemon() {
    try {
      // 1. Fetch base physical traits
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${params.name}`,
      );
      const data = await response.json();
      setPokemon(data);

      // 2. Fetch species lore (habits, habitat, eating, etc)
      const speciesResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${params.name}`,
      );
      const speciesData = await speciesResponse.json();
      setSpecies(speciesData);
    } catch (error) {
      console.log(error);
    }
  }

  // Loading State - Wait for BOTH APIs
  if (!pokemon || !species) {
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

  // Extract English Flavor Text and clean up the weird API formatting characters
  const englishFlavorText = species.flavor_text_entries.find(
    (entry: any) => entry.language.name === "en",
  );
  const cleanFlavorText =
    englishFlavorText?.flavor_text.replace(/\s+/g, " ") || "No lore available.";

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => router.back()}
      />

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={() => router.back()}
        backgroundStyle={{ backgroundColor: "#F9F9F9" }}
        onChange={(index) => setSheetIndex(index)} // Track when user drags to a new point
      >
        <BottomSheetScrollView
          contentContainerStyle={{
            gap: 16,
            padding: 16,
            paddingBottom: 60, // Extra padding at bottom for 100% scroll
          }}
        >
          <View style={styles.card}>
            {/* =========================================================
                STAGE 0: BASE INFO (Always Visible at 50%, 90%, 100%)
                ========================================================= */}
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

            {/* =========================================================
                STAGE 1: SUMMARY (Visible at 90% and 100%)
                ========================================================= */}
            {sheetIndex >= 1 && (
              <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.stageContainer}>
                <Text style={styles.sectionTitle}>Abilities</Text>
                <View style={styles.infoBox}>
                  {pokemon.abilities.map((item: any) => (
                    <View key={item.ability.name} style={styles.infoRow}>
                      <Text
                        style={[
                          styles.infoLabel,
                          { textTransform: "capitalize" },
                        ]}
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
              </Animated.View>
            )}

            {/* =========================================================
                STAGE 2: DEEP LORE (Visible ONLY at 100%)
                ========================================================= */}
            {sheetIndex >= 2 && (
              <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.stageContainer}>
                <Text style={styles.sectionTitle}>Lore & Habits</Text>
                <View style={styles.infoBox}>
                  <Text style={styles.loreText}>{cleanFlavorText}</Text>
                </View>

                <Text style={styles.sectionTitle}>Species Data</Text>
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Habitat:</Text>
                    <Text
                      style={[
                        styles.infoValue,
                        { textTransform: "capitalize" },
                      ]}
                    >
                      {species.habitat?.name || "Unknown"}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Color:</Text>
                    <Text
                      style={[
                        styles.infoValue,
                        { textTransform: "capitalize" },
                      ]}
                    >
                      {species.color?.name || "Unknown"}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Happiness:</Text>
                    <Text style={styles.infoValue}>
                      {species.base_happiness}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Capture Rate:</Text>
                    <Text style={styles.infoValue}>{species.capture_rate}</Text>
                  </View>
                </View>
              </Animated.View>
            )}
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
  stageContainer: {
    marginTop: 8, // Adds a little breathing room when new stages appear
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
  loreText: {
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 24, // Makes the paragraph easier to read
    color: "#333",
  },
});
