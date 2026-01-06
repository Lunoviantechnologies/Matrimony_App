import React from "react";
import { TouchableOpacity, Text } from "react-native";

const AppButton = ({ title, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Text>{title}</Text>
  </TouchableOpacity>
);

export default AppButton;
