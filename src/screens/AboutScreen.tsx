import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image,SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const AboutPage = () => {
  return (
    <SafeAreaView>
      <LinearGradient
            colors={["#000000", "#b0ff58", "#000000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>About HaloHUD</Text>
       
        <Text style={styles.description}>
          HaloHUD is an innovative navigation system designed for motorcyclists and cyclists. 
          The system features a compact display mounted directly onto the helmet, providing 
          real-time navigation guidance without the need to look away from the road.
        </Text>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <Text style={styles.description}>
          The HaloHUD system integrates with your smartphone's GPS and displays turn-by-turn 
          directions directly on the helmet-mounted screen. The display is designed to be 
          non-intrusive, ensuring maximum safety while riding.
        </Text>
        <Text style={styles.sectionTitle}>Features</Text>
        <Text style={styles.description}>
          - Real-time navigation updates{"\n"}
          - Hands-free operation{"\n"}
          - Weather-resistant design{"\n"}
          - Long-lasting battery life{"\n"}
          - Easy-to-read display even in bright sunlight
        </Text>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.description}>
          At  HaloHUD, our mission is to enhance the safety and convenience of riders by 
          providing a seamless navigation experience. We believe in empowering riders with 
          technology that keeps them focused on the road ahead.
        </Text>
      </View>
    </ScrollView>
        </LinearGradient>
    
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    fontFamily:'Mokoto',
    flexGrow: 1,
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontFamily:'Mokoto',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  description: {
    fontFamily:'Mokoto',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  sectionTitle: {
    fontFamily:'Mokoto',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 10,
  },
});

export default AboutPage;