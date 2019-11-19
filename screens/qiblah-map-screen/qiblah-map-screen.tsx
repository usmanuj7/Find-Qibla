import React, { Component } from "react";
import {
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Platform,
  StyleSheet
} from "react-native";
import { Grid, Col, Row } from "react-native-easy-grid";
import { Magnetometer } from "expo-sensors";
import Constants from "expo-constants";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import { NavigationScreenProp } from "react-navigation";
import MapView, {
  PROVIDER_GOOGLE,
  Polyline,
  Marker,
  Overlay,
  OverlayAnimated
} from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import UtilConstants from "../../utils/constants";

const { height, width } = Dimensions.get("window");
export interface QiblahMapScreenProps {
  navigation: NavigationScreenProp<any, any>;
}
export interface QiblahMapScreenStates {
  location: any;
  errorMessage: string;
  region: any;
  city: any;
}

// Converts from degrees to radians.
const radians = function(degrees) {
  return (degrees * Math.PI) / 180;
};

// Converts from radians to degrees.
const degrees = function(radians) {
  return (radians * 180) / Math.PI;
};

export class QiblahMapScreen extends Component<
  QiblahMapScreenProps,
  QiblahMapScreenStates
> {
  constructor(props) {
    super(props);
    this.state = {
      errorMessage: "",
      location: null,
      region: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003
      },
      city: ""
    };
  }

  componentDidMount() {
    if (Platform.OS === "android" && !Constants.isDevice) {
      this.setState({
        errorMessage:
          "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
      });
    } else {
      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied"
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.getAddress(location.coords.latitude, location.coords.longitude);
    this.setState({
      location,
      region: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003
      }
    });
  };

  _goBack = async () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  /**
   * Gets a getAddress using reverse geocode.
   */
  getAddress = async (lat: number, lng: number) => {
    try {
      // start making calls
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${lat},${lng}&key=AIzaSyDM3PbVBH_MmcTa0wDKN3nTk8M4NL6RfXg`
      );

      if (response.status !== 200) {
        return;
      }

      // Examine the text in the response
      const data = await response.json();
      console.log(data);
      const results = data.results;
      this.setState({
        city: results[0].formatted_address.split(", ")[2]
      });
    } catch (e) {}
  };

  getQibla = sourceLocation => {
    var kaabaLocation = { lat: 21.4225, lng: 39.8262 };

    var lat_1 = radians(sourceLocation.lat);
    var lng_1 = radians(sourceLocation.lng);

    var lat_2 = radians(kaabaLocation.lat);
    var lng_2 = radians(kaabaLocation.lng);

    console.log(lat_1, lng_1, lat_2, lng_2);

    return Math.abs(
      degrees(
        Math.atan2(
          Math.sin(lng_2 - lng_1),
          Math.cos(lat_1) * Math.tan(lat_2) -
            Math.sin(lat_1) * Math.cos(lng_2 - lng_1)
        )
      )
    );
  };

  render() {
    const { location, region, errorMessage, city } = this.state;
    return (
      <Grid
        style={{
          backgroundColor: UtilConstants.colorBackground,
          paddingTop: Constants.statusBarHeight
        }}
      >
        <Row
          style={{
            alignItems: "center",
            marginLeft: 16
            //  backgroundColor: "green"
          }}
          size={0.5}
        >
          <Col
            style={{
              alignItems: "flex-start"
              // backgroundColor: "yellow"
            }}
            size={0.37}
          >
            <TouchableOpacity
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                justifyContent: "center",
                alignItems: "center"
              }}
              onPress={this._goBack}
            >
              <Ionicons
                style={{ textAlign: "center", paddingTop: 3 }}
                name="md-arrow-round-back"
                size={22}
                color={UtilConstants.colorPrimary}
              />
            </TouchableOpacity>
          </Col>
          <Col
            style={{
              alignItems: "flex-start"
              // backgroundColor: "yellow"
            }}
            size={0.53}
          >
            <Text
              style={{
                color: UtilConstants.colorPrimary,
                fontSize: height / 26
              }}
            >
              Map
            </Text>
          </Col>
        </Row>
        <Row
          style={{
            alignItems: "center"
            //  backgroundColor: "green"
          }}
          size={0.4}
        >
          <Col style={{ alignItems: "flex-end" }} size={0.4}>
            <Ionicons
              style={{ textAlign: "center", padding: 4 }}
              name="md-navigate"
              size={22}
              color="white"
            />
          </Col>
          <Col style={{ alignItems: "flex-start" }} size={0.6}>
            {/* <Text style={{ color: "#fff" }}>
              {location
                ? `${location.coords.latitude} ${location.coords.longitude}`
                : "Location Not Yet Fetched"}
            </Text> */}
            <Text
              style={{
                color: "#fff",
                fontSize: height / 40
              }}
            >
              {location ? `${city}` : "Location Not Yet Fetched"}
            </Text>
          </Col>
        </Row>
        <Row style={{ alignItems: "center", padding: 16 }} size={6}>
          <Col style={{ alignItems: "center" , position:"relative"}}>
            <MapView
              region={region}
              style={styles.mapStyle}
              provider={PROVIDER_GOOGLE}
            >
              <Marker
                coordinate={{
                  latitude: region.latitude,
                  longitude: region.longitude
                }}
              />
              <Marker
                coordinate={{ latitude: 21.422487, longitude: 39.826206 }}
                image={require("../qiblah-screen/compass_pointer.png")}
              />
              <Polyline
                coordinates={[
                  { latitude: region.latitude, longitude: region.longitude },
                  { latitude: 21.422487, longitude: 39.826206 }
                ]}
                strokeColor="blue" // fallback for when `strokeColors` is not supported by the map-provider
                strokeWidth={6}
              />
            </MapView>

            <TouchableOpacity
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: UtilConstants.colorPrimary,
                  position: "absolute",
                  bottom: 8,
                  right: 15,
                  zIndex: 4,
                }}
                onPress={this._getLocationAsync}
              >
                
               <Ionicons
                    style={{ textAlign: "center",  paddingTop: Platform.OS == "ios"? 3 : 0 }}
                    name="md-locate"
                    size={22}
                    color="white"
                  />
              </TouchableOpacity>
          </Col>
        </Row>
        <Row
          style={{
            alignItems: "flex-start"
            //  backgroundColor: "blue"
          }}
          size={1}
        >
          <Col>
            <Text
              style={{
                color: "#fff",
                fontSize: height / 40,
                width: width,
                textAlign: "center"
              }}
            >
              Qiblah Located{" "}
              {location
                ? 360 -
                  Math.round(
                    this.getQibla({
                      lat: location.coords.latitude,
                      lng: location.coords.longitude
                    })
                  )
                : "0"}
              ° From North
            </Text>
            {errorMessage ? <Text>{errorMessage}</Text> : <></>}
          </Col>
        </Row>
      </Grid>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  mapStyle: {
    width: "95%",
    height: "95%",
    borderRadius: 16,
    
  }
});
