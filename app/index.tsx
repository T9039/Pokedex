import { useEffect, useState, useRef } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Total national dex entries (Gen 1–9). Used for random Pokémon picking.
const TOTAL_POKEMON = 1010;

const colorsByType: Record<string, string> = {
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

interface Pokemon {
  id: string;
  name: string;
  image: string;
  imageBack: string;
  imagesList: { uri: string; label: string }[];
  types: string[];
}

// ─── Decorative Pokéball drawn with plain Views ───────────────────────────────
function PokeballDecor({ size, style }: { size: number; style?: any }) {
  const band = size * 0.08;
  const btn = size * 0.22;
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }, style]}>
      {/* Top half — red */}
      <View style={{ width: size, height: size / 2, backgroundColor: "#CC2222" }} />
      {/* Bottom half — white */}
      <View style={{ width: size, height: size / 2, backgroundColor: "#EEEEEE" }} />
      {/* Centre band */}
      <View style={{ position: "absolute", top: size / 2 - band / 2, width: size, height: band, backgroundColor: "#333" }} />
      {/* Centre button outer (black ring) */}
      <View style={{
        position: "absolute",
        top: size / 2 - btn / 2,
        left: size / 2 - btn / 2,
        width: btn, height: btn,
        borderRadius: btn / 2,
        backgroundColor: "#333",
      }} />
      {/* Centre button inner (white) */}
      <View style={{
        position: "absolute",
        top: size / 2 - btn * 0.6 / 2,
        left: size / 2 - btn * 0.6 / 2,
        width: btn * 0.6, height: btn * 0.6,
        borderRadius: btn * 0.3,
        backgroundColor: "#FFFFFF",
      }} />
    </View>
  );
}

export default function Index() {
  const router = useRouter();
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [nextUrl, setNextUrl] = useState<string | null>("https://pokeapi.co/api/v2/pokemon?limit=20");
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    fetchPokemonList();
  }, []);

  async function fetchPokemonList() {
    if (isFetchingRef.current || !nextUrl) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const response = await fetch(nextUrl);
      const data = await response.json();

      setNextUrl(data.next);

      const detailedPokemons = await Promise.all(
        data.results.map(async (pokemon: any) => {
          const res = await fetch(pokemon.url);
          const details = await res.json();

          const formattedId = details.id.toString().padStart(3, "0");

          // Genuinely different visual styles — Dream World removed (unreliable)
          const raw: { uri: string | null; label: string }[] = [
            { uri: details.sprites.other["official-artwork"]?.front_default, label: "Official Art" },
            { uri: details.sprites.other["official-artwork"]?.front_shiny,   label: "Shiny Art" },
            { uri: details.sprites.other.home?.front_default,                label: "3D Home" },
            { uri: details.sprites.other.home?.front_shiny,                  label: "3D Shiny" },
            { uri: details.sprites.other.showdown?.front_default,            label: "Battle Front" },
            { uri: details.sprites.other.showdown?.back_default,             label: "Battle Back" },
            { uri: details.sprites.other.showdown?.front_shiny,              label: "Battle Shiny" },
            { uri: details.sprites.front_default,                            label: "Classic" },
            { uri: details.sprites.back_default,                             label: "Classic Back" },
            { uri: details.sprites.front_shiny,                              label: "Classic Shiny" },
          ];
          const imagesList = raw.filter(
            (entry): entry is { uri: string; label: string } => !!entry.uri
          );

          return {
            id: formattedId,
            name: pokemon.name,
            image: details.sprites.front_default,
            imageBack: details.sprites.back_default,
            imagesList,
            types: details.types.map((t: any) => t.type.name),
          };
        })
      );

      setPokemons((prev) => {
        const existingNames = new Set(prev.map((p) => p.name));
        const newUnique = detailedPokemons.filter((p) => !existingNames.has(p.name));
        return [...prev, ...newUnique];
      });
    } catch (error) {
      console.log(error);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }

  /** Navigate to a random Pokémon's details page. */
  function goToRandomPokemon() {
    setShowDropdown(false);
    const randomId = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
    router.push({ pathname: "/details" as any, params: { name: String(randomId) } });
  }

  /** Shuffle the currently-loaded Pokémon list in place. */
  function shuffleList() {
    setShowDropdown(false);
    setPokemons((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
  }

  const filteredPokemons = pokemons.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* ── Pokéball Hero Background ─────────────────────────────────────── */}
      {/* Large half-ball arc that peeks out behind the header */}
      <View style={styles.heroBallWrapper} pointerEvents="none">
        <PokeballDecor size={SCREEN_WIDTH * 0.95} />
      </View>

      {/* Scattered tiny Pokéballs for background texture */}
      <View style={styles.bgDecorWrapper} pointerEvents="none">
        <PokeballDecor size={80}  style={{ position: "absolute", top: 160, left: -20,  opacity: 0.07 }} />
        <PokeballDecor size={55}  style={{ position: "absolute", top: 300, right: -10, opacity: 0.06 }} />
        <PokeballDecor size={100} style={{ position: "absolute", top: 500, left: 20,   opacity: 0.05 }} />
        <PokeballDecor size={65}  style={{ position: "absolute", top: 700, right: 5,   opacity: 0.06 }} />
      </View>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Pokémon..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Randomise button */}
        <TouchableOpacity
          style={styles.randomBtn}
          onPress={() => setShowDropdown((v) => !v)}
        >
          <Ionicons name="shuffle" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* ── Dropdown menu ───────────────────────────────────────────────── */}
      {showDropdown && (
        <>
          {/* Transparent backdrop to close on outside tap */}
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowDropdown(false)} />
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.dropdownItem} onPress={goToRandomPokemon}>
              <Ionicons name="dice-outline" size={20} color="#CC2222" />
              <Text style={styles.dropdownText}>Random Pokémon</Text>
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity style={styles.dropdownItem} onPress={shuffleList}>
              <Ionicons name="list-outline" size={20} color="#CC2222" />
              <Text style={styles.dropdownText}>Shuffle List</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── Pokémon List ─────────────────────────────────────────────────── */}
      <FlatList
        data={filteredPokemons}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        onEndReached={fetchPokemonList}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading ? <ActivityIndicator size="large" color="#CC2222" style={{ margin: 20 }} /> : null
        }
        renderItem={({ item }) => {
          const mainType = item.types[0];
          const bgColor = colorsByType[mainType] || "#E0E0D1";

          return (
            <Link
              href={{ pathname: "/details" as any, params: { name: item.name, bgColor, imagesList: JSON.stringify(item.imagesList) } }}
              asChild
            >
              {/* Shadow lives here — no overflow:hidden (Android bug) */}
              <TouchableOpacity style={styles.cardShadow}>
                {/* Colour + clip lives here */}
                <View style={[styles.card, { backgroundColor: bgColor }]}>
                  {/* Pokéball watermark */}
                  <Ionicons name="aperture" size={200} color="rgba(0,0,0,0.06)" style={styles.watermark} />

                  {/* ID Badge */}
                  <View style={styles.idBadge}>
                    <Text style={styles.idNumber}>#{item.id}</Text>
                  </View>

                  {/* Content */}
                  <View>
                    <Text style={styles.name}>{item.name}</Text>

                    <View style={styles.typesList}>
                      {item.types.map((type) => (
                        <View key={type} style={styles.typeBadge}>
                          <Text style={styles.typeText}>{type}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
                      <Image source={{ uri: item.image }} style={{ width: 150, height: 150 }} />
                      {item.imageBack && (
                        <Image source={{ uri: item.imageBack }} style={{ width: 150, height: 150 }} />
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Link>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },

  // ── Pokéball background decorations ──
  heroBallWrapper: {
    position: "absolute",
    top: -SCREEN_WIDTH * 0.95 * 0.55, // show only ~45% of the ball (the bottom arc)
    alignSelf: "center",
    zIndex: 0,
    opacity: 0.18,
  },
  bgDecorWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 60, // below the arc hero ball
    paddingBottom: 16,
    gap: 10,
    alignItems: "center",
    zIndex: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "white",
  },
  randomBtn: {
    width: 46,
    height: 46,
    backgroundColor: "#CC2222",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#CC2222",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },

  // ── Dropdown ──
  dropdown: {
    position: "absolute",
    top: 118,
    right: 16,
    backgroundColor: "white",
    borderRadius: 14,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 100,
    minWidth: 210,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 12,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginHorizontal: 12,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  // ── Cards ──
  listContent: {
    padding: 16,
    paddingTop: 8,
    gap: 16,
    zIndex: 5,
  },
  cardShadow: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    overflow: "hidden",
  },
  idBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    zIndex: 5,
  },
  idNumber: {
    fontSize: 13,
    fontWeight: "bold",
    color: "white",
  },
  watermark: {
    position: "absolute",
    bottom: -40,
    right: -40,
    zIndex: 0,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "capitalize",
    color: "#333",
  },
  typesList: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  typeBadge: {
    backgroundColor: "rgba(255,255,255,0.4)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textTransform: "capitalize",
  },
});
