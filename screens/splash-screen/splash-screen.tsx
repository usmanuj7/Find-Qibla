import * as React from "react";
import { Platform, Image, StatusBar } from "react-native";
import { NavigationScreenProp } from "react-navigation";
import Splash from "react-native-splash-screen";


export interface SplashScreenProps {
  navigation: NavigationScreenProp<any, any>;
}

export class SplashScreen extends React.Component<SplashScreenProps, {}> {
  private _timer;

  componentDidMount() {
    StatusBar.setTranslucent(true);
    this._timer = setTimeout(
      () => this.props.navigation.navigate("primary"),
      2000
    );
   
    if (Platform.OS == "ios") Splash.hide();
  }

  componentWillUnmount() {
    if (this._timer) clearTimeout(this._timer);
  }

  render() {
    return <Image source={require("./splash_image.png")} resizeMode={Platform.OS === "ios" ? "cover" : "contain"} style={{ width:"100%", height:"100%"}} />;
  }
}
