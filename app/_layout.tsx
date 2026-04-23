import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Pokedex",
          }}
        />

        <Stack.Screen
          name="details"
          options={{
            // We hide the header because the BottomSheet will handle its own title or content
            headerShown: false, 
            // We use transparentModal so the background isn't solid white/black
            presentation: "transparentModal",
            animation: "fade", // Gives a nice background fade effect
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
