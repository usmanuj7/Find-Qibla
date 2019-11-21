import React from "react";
import { StatusBar } from "react-native";
import { AppNavigator } from "./navigation";
import UtilConstants from "./utils/constants";

export default function App() {
  return [<StatusBar key="statusbar" barStyle="light-content" backgroundColor={UtilConstants.splash} />, <AppNavigator key="root" />];
}
