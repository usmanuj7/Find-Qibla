import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { SplashScreen } from "../screens/splash-screen";
import { PrimaryNavigator } from "./primary-navigator";

export const RootNavigator = createSwitchNavigator(
  {
    splash: { screen: SplashScreen },
    primary: { screen: PrimaryNavigator },
  },
  {
    navigationOptions: { gesturesEnabled: false },
    backBehavior: "none",
    initialRouteName: "splash"
  }
);

export const AppNavigator = createAppContainer(RootNavigator);
