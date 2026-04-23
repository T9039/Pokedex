import { useEffect, useState } from "react";
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

// We keep the pastel colors!
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
  types: string[];
}

export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [isGridView, setIsGridView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [nextUrl, setNextUrl] = useState<string | null>("https://pokeapi.co/api/v2/pokemon?limit=20");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPokemonList();
  }, []);

  async function fetchPokemonList() {
    // Prevent fetching if already loading or no more pages
    if (isLoading || !nextUrl) return;

    setIsLoading(true);
    try {
      const response = await fetch(nextUrl);
      const data = await response.json();
      
      // Save the url for the NEXT 20 pokemon
      setNextUrl(data.next);

      const detailedPokemons = await Promise.all(
        data.results.map(async (pokemon: any) => {
          const res = await fetch(pokemon.url);
          const details = await res.json();
          
          // Format ID to have leading zeros (e.g., 1 -> 001)
          const formattedId = details.id.toString().padStart(3, '0');

          return {
            id: formattedId,
            name: pokemon.name,
            // Use the incredibly high-quality official artwork instead of the pixel sprite
            image: details.sprites.other["official-artwork"].front_default || details.sprites.front_default,
            types: details.types.map((t: any) => t.type.name),
          };
        }),
      );

      setPokemons((prev) => [...prev, ...detailedPokemons]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Filter the list based on search bar
  const filteredPokemons = pokemons.filter((p) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* HEADER CONTROLS */}
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
        <TouchableOpacity 
          style={styles.toggleBtn} 
          onPress={() => setIsGridView(!isGridView)}
        >
          <Ionicons name={isGridView ? "list" : "grid"} size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* POKEMON LIST */}
      <FlatList
        // The key prop is a React trick! Changing the key forces the FlatList to completely re-render.
        // We MUST do this when changing numColumns, otherwise React Native throws an error!
        key={isGridView ? "grid" : "list"}
        data={filteredPokemons}
        numColumns={isGridView ? 2 : 1}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={isGridView ? styles.gridRow : undefined}
        onEndReached={fetchPokemonList}
        onEndReachedThreshold={0.5} // Trigger fetch when halfway through the last items
        ListFooterComponent={isLoading ? <ActivityIndicator size="large" style={{ margin: 20 }} /> : null}
        renderItem={({ item }) => {
          const mainType = item.types[0];
          const bgColor = colorsByType[mainType] || "#E0E0D1";

          return (
            <Link href={{ pathname: "/details" as any, params: { name: item.name } }} asChild>
              <TouchableOpacity 
                style={[
                  styles.card, 
                  { backgroundColor: bgColor },
                  isGridView && styles.cardGrid // Add extra grid styles if active
                ]}
              >
                {/* ID Number Watermark */}
                <Text style={styles.idNumber}>#{item.id}</Text>

                <View style={isGridView ? styles.contentGrid : styles.contentList}>
                  
                  {/* Info Section (Name + Types) */}
                  <View style={styles.infoContainer}>
                    <Text style={styles.pokemonName}>{item.name}</Text>
                    <View style={isGridView ? styles.typesGrid : styles.typesList}>
                      {item.types.map((type) => (
                        <View key={type} style={styles.typeBadge}>
                          <Text style={styles.typeText}>{type}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Pokémon Image */}
                  <Image 
                    source={{ uri: item.image }} 
                    style={isGridView ? styles.imageGrid : styles.imageList} 
                  />
                  
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
    gap: 12,
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
  toggleBtn: {
    width: 44,
    height: 44,
    backgroundColor: "white",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    gap: 16,
  },
  gridRow: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    overflow: "hidden", // Keeps the ID watermark inside the card
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardGrid: {
    flex: 1, // Ensures grid columns share space equally
  },
  idNumber: {
    position: "absolute",
    top: 10,
    right: 12,
    fontSize: 20,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.4)", // Semi-transparent white
    zIndex: 0,
  },
  contentList: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
  },
  contentGrid: {
    flexDirection: "column",
    alignItems: "center",
    zIndex: 1,
  },
  infoContainer: {
    gap: 8,
  },
  pokemonName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textTransform: "capitalize",
  },
  typesList: {
    flexDirection: "row",
    gap: 6,
  },
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
  },
  typeBadge: {
    backgroundColor: "rgba(255,255,255,0.3)", // Glassmorphic translucent badge!
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    textTransform: "capitalize",
  },
  imageList: {
    width: 90,
    height: 90,
  },
  imageGrid: {
    width: 100,
    height: 100,
    marginTop: 12,
  },
});
