import { createStackNavigator } from "react-navigation-stack";
import { QiblahScreen } from "../screens/qiblah-screen";
import { QiblahMapScreen } from "../screens/qiblah-map-screen";

export const PrimaryNavigator = createStackNavigator(
  {
    home: { screen: QiblahScreen },
    map: { screen: QiblahMapScreen }
  },
  {
    headerMode: "none",
    navigationOptions: { gesturesEnabled: false }
  }
);
