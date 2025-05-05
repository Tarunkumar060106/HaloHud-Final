import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
// import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";

export default function LandingScreen() {
  // const navigation = useNavigation();
  const screenWidth = Dimensions.get("window").width;
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Load font manually
    const loadFont = async () => {
      try {
        setFontsLoaded(true);
      } catch (error) {
        console.log("Font loading error:", error);
      }
    };

    loadFont();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#fff", fontSize: 20 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#000000", "#b0ff58", "#000000"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.staticTitle}>HALOHUD</Text>

      {/* Helmet Image */}
      <Image
        source={require("../../assets/images/helmet1.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.staticVersion}>v1.0</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  image: {
    width: 250,
    height: 250,
    zIndex: 1,
  },
  staticTitle: {
    position: "absolute",
    top: "32.5%",
    fontSize: 85,
    color: "#ffffff",
    fontFamily: "Mokoto",
    textAlign: "center",
    width: Dimensions.get("window").width,
  },
  staticVersion: {
    position: "absolute",
    fontFamily: "Mokoto",
    fontSize: 20,
    textAlign: "center",
    color: "#fff",
    top: "62%",
  },
});
