import { createStackNavigator } from 'react-navigation-stack';
import { QiblahScreen } from "../screens/qiblah-screen"
import { QiblahMapScreen } from "../screens/qiblah-map-screen"
import { createAppContainer } from "react-navigation";

export const RootNavigator = createStackNavigator(
  {
    home: { screen: QiblahScreen },
    map: { screen: QiblahMapScreen },
  },
  {
    headerMode: "none",
    navigationOptions: { gesturesEnabled: false },
  },
)

export const AppNavigator = createAppContainer(RootNavigator);
