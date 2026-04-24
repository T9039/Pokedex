import { useEffect, useState, useRef } from "react";
import { 
  Image, 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator 
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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

export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [nextUrl, setNextUrl] = useState<string | null>("https://pokeapi.co/api/v2/pokemon?limit=20");
  const [isLoading, setIsLoading] = useState(false);
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
          
          const formattedId = details.id.toString().padStart(3, '0');

          // Build a list of genuinely different visual styles.
          // Each entry is { uri, label } so the carousel can show a caption.
          const raw: { uri: string | null; label: string }[] = [
            { uri: details.sprites.other["official-artwork"]?.front_default, label: "Official Art" },
            { uri: details.sprites.other["official-artwork"]?.front_shiny,   label: "Shiny Art" },
            { uri: details.sprites.other.dream_world?.front_default,         label: "Dream World" },
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
        }),
      );

      setPokemons((prev) => {
        const existingNames = new Set(prev.map(p => p.name));
        const newUnique = detailedPokemons.filter(p => !existingNames.has(p.name));
        return [...prev, ...newUnique];
      });
    } catch (error) {
      console.log(error);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }

  const filteredPokemons = pokemons.filter((p) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Pokémon..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredPokemons}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        onEndReached={fetchPokemonList}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoading ? <ActivityIndicator size="large" style={{ margin: 20 }} /> : null}
        renderItem={({ item }) => {
          const mainType = item.types[0];
          const bgColor = colorsByType[mainType] || "#E0E0D1";

          return (
            <Link 
              href={{ pathname: "/details" as any, params: { name: item.name, bgColor, imagesList: JSON.stringify(item.imagesList) } }} 
              asChild
            >
              <TouchableOpacity 
                style={[
                  styles.card, 
                  { backgroundColor: bgColor },
                ]}
              >
                {/* ID + Pokéball watermark rendered directly so they are always visible */}
                <Text style={styles.idNumber}>#{item.id}</Text>
                <Ionicons 
                  name="aperture" 
                  size={200} 
                  color="rgba(255,255,255,0.2)" 
                  style={styles.watermark} 
                />

                {/* Foreground Layer */}
                <View style={{ zIndex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  
                  <View style={styles.typesList}>
                    {item.types.map((type) => (
                      <View key={type} style={styles.typeBadge}>
                        <Text style={styles.typeText}>{type}</Text>
                      </View>
                    ))}
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      marginTop: 10,
                    }}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: 150, height: 150 }}
                    />

                    {item.imageBack && (
                      <Image
                        source={{ uri: item.imageBack }}
                        style={{ width: 150, height: 150 }}
                      />
                    )}
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
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  idNumber: {
    position: "absolute",
    top: 10,
    right: 12,
    fontSize: 24,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.5)",
    zIndex: 2,
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
