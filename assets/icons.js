import React from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";

export const icons = {
  home: (props) => <AntDesign name="home" size={26} {...props} />,
  about: (props) => <AntDesign name="infocirlceo" size={26} {...props} />,
  maps: (props) => <MaterialCommunityIcons name="map-marker" size={26} {...props} />,
  settings: (props) => <Feather name="settings" size={26} {...props} />,
};

// 🔹 Ensure case-insensitivity & return fallback icon
export const getIcon = (routeName = "", props) => {
  const key = routeName.toLowerCase(); // Normalize case

  return icons[key] ? icons[key](props) : <AntDesign name="questioncircleo" size={26} {...props} />;
};
