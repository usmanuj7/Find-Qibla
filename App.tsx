import React from "react";
import { StatusBar } from "react-native";
import { AppNavigator } from "./navigation";

export default function App() {
  return [<StatusBar key="statusbar" barStyle="light-content" backgroundColor="black" />, <AppNavigator key="root" />];
}
