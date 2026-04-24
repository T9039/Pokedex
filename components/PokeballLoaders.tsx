/**
 * PokeballLoaders.tsx
 *
 * Two custom loading animations:
 *  - SpinningPokeball  → compact spinner for FlatList footer
 *  - PokeballCrackLoader → full-screen cinematic intro for the Details page
 */
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

// ─── Shared Pokéball drawing util ─────────────────────────────────────────────
function PokeballShape({ size }: { size: number }) {
  const band = size * 0.08;
  const btn  = size * 0.22;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}>
      <View style={{ width: size, height: size / 2, backgroundColor: "#CC2222" }} />
      <View style={{ width: size, height: size / 2, backgroundColor: "#F2F2F2" }} />
      <View style={{ position: "absolute", top: size / 2 - band / 2, width: size, height: band, backgroundColor: "#222" }} />
      <View style={{
        position: "absolute",
        top: size / 2 - btn / 2, left: size / 2 - btn / 2,
        width: btn, height: btn, borderRadius: btn / 2,
        backgroundColor: "#222", justifyContent: "center", alignItems: "center",
      }}>
        <View style={{ width: btn * 0.55, height: btn * 0.55, borderRadius: btn * 0.275, backgroundColor: "white" }} />
      </View>
    </View>
  );
}

// ─── 1. SpinningPokeball ─────────────────────────────────────────────────────
export function SpinningPokeball({ size = 44 }: { size?: number }) {
  const rot = useSharedValue(0);

  useEffect(() => {
    rot.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(rot);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }],
  }));

  return (
    <View style={{ alignItems: "center", margin: 20 }}>
      <Animated.View style={style}>
        <PokeballShape size={size} />
      </Animated.View>
    </View>
  );
}

// ─── 2. PokeballCrackLoader ───────────────────────────────────────────────────
// Timing constants (ms) — all values must sum to CYCLE_MS
const CYCLE_MS   = 3600;
const SHAKE_MS   = 400;  // phase 1: shake
const CRACK_MS   = 450;  // phase 2: halves open
const HOLD_MS    = 1350; // phase 3: hold open, Pokémon visible
const CLOSE_MS   = 500;  // phase 4: close back up
const REST_MS    = CYCLE_MS - SHAKE_MS - CRACK_MS - HOLD_MS - CLOSE_MS; // 900

const S = 110; // Pokéball size
const BAND  = S * 0.08;
const BTN   = S * 0.22;

export function PokeballCrackLoader({
  bgColor = "#CC2222",
  firstImageUri,
}: {
  bgColor?: string;
  firstImageUri?: string;
}) {
  const topY      = useSharedValue(0);
  const botY      = useSharedValue(0);
  const shakeX    = useSharedValue(0);
  const glowOp    = useSharedValue(0);
  const glowScale = useSharedValue(0.1);
  const pokeOp    = useSharedValue(0);
  const pokeScale = useSharedValue(0.5);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    // ── Shake ──────────────────────────────────────────────────────────────
    shakeX.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 80 }),
        withTiming( 10, { duration: 80 }),
        withTiming( -7, { duration: 80 }),
        withTiming(  7, { duration: 80 }),
        withTiming(  0, { duration: 80 }),
        withTiming(  0, { duration: CYCLE_MS - SHAKE_MS }), // hold rest of cycle
      ),
      -1, false,
    );

    // ── Top half flies up ──────────────────────────────────────────────────
    topY.value = withRepeat(
      withSequence(
        withTiming(0,   { duration: SHAKE_MS }),           // wait
        withTiming(-85, { duration: CRACK_MS, easing: ease }),
        withTiming(-85, { duration: HOLD_MS }),            // hold
        withTiming(0,   { duration: CLOSE_MS, easing: ease }),
        withTiming(0,   { duration: REST_MS }),            // rest
      ),
      -1, false,
    );

    // ── Bottom half dips down ──────────────────────────────────────────────
    botY.value = withRepeat(
      withSequence(
        withTiming(0,  { duration: SHAKE_MS }),
        withTiming(18, { duration: CRACK_MS, easing: ease }),
        withTiming(18, { duration: HOLD_MS }),
        withTiming(0,  { duration: CLOSE_MS, easing: ease }),
        withTiming(0,  { duration: REST_MS }),
      ),
      -1, false,
    );

    // ── Glow burst ────────────────────────────────────────────────────────
    const glowDuration = CRACK_MS + HOLD_MS + CLOSE_MS;
    glowOp.value = withRepeat(
      withSequence(
        withTiming(0,   { duration: SHAKE_MS }),
        withTiming(0.7, { duration: CRACK_MS * 0.4 }),
        withTiming(0.3, { duration: glowDuration - CRACK_MS * 0.4 }),
        withTiming(0,   { duration: CLOSE_MS * 0.3 }),
        withTiming(0,   { duration: REST_MS }),
      ),
      -1, false,
    );
    glowScale.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: SHAKE_MS }),
        withTiming(2.8, { duration: CRACK_MS + HOLD_MS, easing: ease }),
        withTiming(0.1, { duration: CLOSE_MS }),
        withTiming(0.1, { duration: REST_MS }),
      ),
      -1, false,
    );

    // ── Pokémon image ──────────────────────────────────────────────────────
    pokeOp.value = withRepeat(
      withSequence(
        withTiming(0, { duration: SHAKE_MS + CRACK_MS * 0.6 }),
        withTiming(1, { duration: CRACK_MS * 0.4 }),
        withTiming(1, { duration: HOLD_MS }),
        withTiming(0, { duration: CLOSE_MS }),
        withTiming(0, { duration: REST_MS }),
      ),
      -1, false,
    );
    pokeScale.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: SHAKE_MS + CRACK_MS * 0.5 }),
        withTiming(1,   { duration: CRACK_MS * 0.5, easing: ease }),
        withTiming(1,   { duration: HOLD_MS }),
        withTiming(0.5, { duration: CLOSE_MS }),
        withTiming(0.5, { duration: REST_MS }),
      ),
      -1, false,
    );

    return () => {
      cancelAnimation(shakeX);
      cancelAnimation(topY);
      cancelAnimation(botY);
      cancelAnimation(glowOp);
      cancelAnimation(glowScale);
      cancelAnimation(pokeOp);
      cancelAnimation(pokeScale);
    };
  }, []);

  const topStyle  = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }, { translateY: topY.value }] }));
  const botStyle  = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }, { translateY: botY.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOp.value, transform: [{ scale: glowScale.value }] }));
  const pokeStyle = useAnimatedStyle(() => ({ opacity: pokeOp.value, transform: [{ scale: pokeScale.value }] }));

  return (
    <View style={[styles.screen, { backgroundColor: bgColor }]}>
      {/* Glow burst */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* Pokémon artwork */}
      {firstImageUri && (
        <Animated.View style={[styles.pokemon, pokeStyle]}>
          <Image source={{ uri: firstImageUri }} style={styles.pokemonImage} resizeMode="contain" />
        </Animated.View>
      )}

      {/* Pokéball halves */}
      <View style={styles.ballWrapper}>
        {/* Top — red half */}
        <Animated.View style={topStyle}>
          <View style={{
            width: S, height: S / 2,
            backgroundColor: "#CC2222",
            borderTopLeftRadius: S / 2, borderTopRightRadius: S / 2,
            overflow: "hidden",
          }} />
        </Animated.View>

        {/* Bottom — band + white half + button */}
        <Animated.View style={botStyle}>
          <View style={{ width: S, height: BAND, backgroundColor: "#222" }} />
          <View style={{
            width: S, height: S / 2 - BAND,
            backgroundColor: "#F2F2F2",
            borderBottomLeftRadius: S / 2, borderBottomRightRadius: S / 2,
            overflow: "hidden",
          }} />
          {/* Center button sits across the band */}
          <View style={{
            position: "absolute", top: -BTN / 2,
            left: S / 2 - BTN / 2,
            width: BTN, height: BTN, borderRadius: BTN / 2,
            backgroundColor: "#222", justifyContent: "center", alignItems: "center",
          }}>
            <View style={{ width: BTN * 0.55, height: BTN * 0.55, borderRadius: BTN * 0.275, backgroundColor: "white" }} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  glow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "white",
  },
  pokemon: {
    position: "absolute",
    zIndex: 1,
  },
  pokemonImage: {
    width: 220,
    height: 220,
  },
  ballWrapper: {
    alignItems: "center",
    zIndex: 2,
  },
});
