import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./src/screens/HomeScreen";
import AboutScreen from "./src/screens/AboutScreen";
import MapScreen from "./src/screens/MapScreen"; // Add your screens
import BluetoothScreen from "./src/screens/BluetoothScreen"; // Add your screens
import ContactScreen from "./src/screens/ContactScreen"; // Add your screens
import TabBar from "./src/components/TabBar"; // Import your custom TabBar
import 'react-native-get-random-values';
import { BluetoothProvider } from "./src/screens/BluetoothContext"; // Import the provider
import { enableScreens } from 'react-native-screens';

const Tab = createBottomTabNavigator();

export default function App() {
  enableScreens();
  return (
    <BluetoothProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{ headerShown: false }}
          tabBar={(props: React.ComponentProps<typeof TabBar>) => <TabBar {...props} />} // ✅ Use Custom TabBar
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="About" component={AboutScreen} />
          <Tab.Screen name="Maps" component={MapScreen} />
          <Tab.Screen name="Bluetooth" component={BluetoothScreen} />
          <Tab.Screen name="Contacts" component={ContactScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </BluetoothProvider>
  );
}