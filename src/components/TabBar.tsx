import React from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";

const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    const activeColor = "#22d3ee";
    const inactiveColor = "#9ca3af";
    const bgColor = "#18181b";

    const getIcon = (name: string, isFocused: boolean) => {
        const color = isFocused ? activeColor : inactiveColor;
        const size = isFocused ? 30 : 26;

        switch (name.toLowerCase()) {
            case "home":
                return <MaterialCommunityIcons name="home" size={size} color={color} />;
            case "about":
                return <AntDesign name="infocirlceo" size={size} color={color} />;
            case "maps":
                return <MaterialCommunityIcons name="google-maps" size={size} color={color} />;
            case "bluetooth":
                return <Feather name="bluetooth" size={size} color={color} />;
            case "contacts":
                return <AntDesign name="contacts" size={size} color={color} />;
            default:
                return <AntDesign name="questioncircleo" size={size} color={color} />;
        }
    };

    return (
        <View style={[styles.tabBar, { backgroundColor: bgColor }]}>
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;

                const onPress = () => {
                    if (!isFocused) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <TouchableOpacity
                        key={route.name}
                        style={styles.tabItem}
                        onPress={onPress}
                        accessibilityRole="button"
                        accessibilityLabel={route.name}
                    >
                        {getIcon(route.name, isFocused)}
                        <Text style={[styles.label, { color: isFocused ? activeColor : inactiveColor }]}>
                            {route.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#27272a",
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
    },
    label: {
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4,
    },
});

export default TabBar;
