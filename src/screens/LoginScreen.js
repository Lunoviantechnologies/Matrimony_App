import React from "react";
import { View, Text, Button } from "react-native";
import { loginApi } from "../api/api";

const LoginScreen = () => {
  const handleLogin = async () => {
    try {
      const res = await loginApi({
        email: "test@gmail.com",
        password: "123456",
      });
      console.log("SUCCESS:", res.data);
    } catch (err) {
      console.log("ERROR:", err.message);
    }
  };

  return (
    <View>
      <Text>Login Screen</Text>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;
