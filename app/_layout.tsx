import { Stack } from "expo-router";

export default function RootLayout() {
  return (
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
          title: "Pokemon Details",
          headerBackButtonDisplayMode: "minimal",
          presentation: "formSheet",
          sheetAllowedDetents: [0.3, 0.5, 0.8, 1],
        }}
      />
    </Stack>
  );
}
