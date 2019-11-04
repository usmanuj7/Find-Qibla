import React, { Component } from "react";
import {
  Image,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform
} from "react-native";
import { Grid, Col, Row } from "react-native-easy-grid";
import { Magnetometer } from "expo-sensors";
import Constants from "expo-constants";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import { NavigationScreenProp } from "react-navigation";
import { Ionicons } from "@expo/vector-icons";
const { height, width } = Dimensions.get("window");

import UtilConstants from "../../utils/constants";

export interface QiblahScreenProps {
  navigation: NavigationScreenProp<any, any>;
}
export interface QiblahScreenStates {
  magnetometer: number;
  x: number;
  y: number;
  z: number;
  location: any;
  errorMessage: string;
}

// Converts from degrees to radians.
const radians = function(degrees) {
  return (degrees * Math.PI) / 180;
};

// Converts from radians to degrees.
const degrees = function(radians) {
  return (radians * 180) / Math.PI;
};

export class QiblahScreen extends Component<
  QiblahScreenProps,
  QiblahScreenStates
> {
  _subscription;
  rawMagnetometer = [];

  constructor(props) {
    super(props);
    this.state = {
      magnetometer: 0,
      x: 0,
      y: 0,
      z: 0,
      errorMessage: "",
      location: null
    };
  }

  componentDidMount() {
    this._toggle();
    if (Platform.OS === "android" && !Constants.isDevice) {
      this.setState({
        errorMessage:
          "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
      });
    } else {
      this._getLocationAsync();
    }
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied"
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    console.log(location);
    this.setState({ location });
  };

  _goToMap = async () => {
    let { navigation } = this.props;
    navigation.navigate("map");
  };

  _isMagnetometerAvailable = async () => {
    const isSensorAvailable = await Magnetometer.isAvailableAsync();
    if (!isSensorAvailable)
      this.setState({
        errorMessage: "Magnetometer is not available, Can not estimate Qiblah."
      });
  };

  _toggle = () => {
    if (this._subscription) {
      this._unsubscribe();
    } else {
      this._subscribe();
    }
  };

  _rotate = () => {
    const { location } = this.state;
    const rotation =
      360 -
      this.state.magnetometer -
      (location
        ? this.getQibla({
            lat: location.coords.latitude,
            lng: location.coords.longitude
          })
        : 0) +
      90 +
      "deg";
    console.log(rotation);
    return rotation;
  };

  _subscribe = async () => {
    const { magnetometer } = this.state;
    Magnetometer.setUpdateInterval(100);
    this._subscription = Magnetometer.addListener(data => {
      // this._addMagnetometerReading(data)
      const newAngle = this._angle(data);
      if (magnetometer + 3 >= newAngle && magnetometer - 3 <= newAngle) return;
      this.setState({
        magnetometer: this._angle(data),
        x: data.x,
        y: data.y,
        z: data.z
      });
    });
  };

  _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };

  _addMagnetometerReading(data) {
    if (this.rawMagnetometer.length > 2) this.rawMagnetometer.shift();
    this.rawMagnetometer.push(this._angle(data));
  }

  _average = () => {
    const average =
      this.rawMagnetometer.reduce((prev, next) => {
        return prev + next;
      }) / this.rawMagnetometer.length;
    console.log(average);
    console.log(this.rawMagnetometer);
    return Math.floor(average);
  };

  _angle = magnetometer => {
    let angle = 0;
    if (magnetometer) {
      let { x, y, z } = magnetometer;
      const xx = Math.round(x);
      const yy = Math.round(y);

      if (Math.atan2(yy, xx) >= 0) {
        angle = Math.atan2(yy, xx) * (180 / Math.PI);
      } else {
        angle = (Math.atan2(yy, xx) + 2 * Math.PI) * (180 / Math.PI);
      }
    }

    return Math.round(angle);
  };

  _direction = degree => {
    if (degree >= 22.5 && degree < 67.5) {
      return "NE";
    } else if (degree >= 67.5 && degree < 112.5) {
      return "E";
    } else if (degree >= 112.5 && degree < 157.5) {
      return "SE";
    } else if (degree >= 157.5 && degree < 202.5) {
      return "S";
    } else if (degree >= 202.5 && degree < 247.5) {
      return "SW";
    } else if (degree >= 247.5 && degree < 292.5) {
      return "W";
    } else if (degree >= 292.5 && degree < 337.5) {
      return "NW";
    } else {
      return "N";
    }
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

  // Match the device top with pointer 0° degree. (By default 0° starts from the right of the device.)
  _degree = magnetometer => {
    return magnetometer - 90 >= 0 ? magnetometer - 90 : magnetometer + 271;
  };

  render() {
    const { x, y, z, location, errorMessage } = this.state;
    return (
      <Grid
        style={{
          backgroundColor: UtilConstants.colorBackground
        }}
      >
        <Row style={{ alignItems: "center" }} size={0.6}>
          <Col style={{ alignItems: "center" }}>
            <Text
              style={{
                color: UtilConstants.colorPrimary,
                fontSize: height / 26
              }}
            >
              Qibla Direction
            </Text>
          </Col>
        </Row>
        <Row style={{ alignItems: "center" }} size={0.2}>
          <Col style={{ alignItems: "center" }}>
            <Text
              style={{
                color: "#fff",
                fontSize: height / 26,
                fontWeight: "bold"
              }}
            >
              {this._direction(this._degree(this.state.magnetometer))}
            </Text>
          </Col>
        </Row>
        <Row style={{ alignItems: "center" }} size={0.1}>
          <Col style={{ alignItems: "center" }}>
            <View
              style={{
                position: "absolute",
                width: width,
                alignItems: "center",
                top: 0
              }}
            >
              <Image
                source={require("./compass_pointer_.png")}
                style={{
                  height: height / 26,
                  resizeMode: "contain"
                }}
              />
            </View>
          </Col>
        </Row>
        <Row
          style={{
            alignItems: "center"
            // backgroundColor: "red"
          }}
          size={1.4}
        >
          <Col style={{ alignItems: "center" }}>
            <Image
              source={require("./compass_bg_.png")}
              style={{
                height: width - 80,
                justifyContent: "center",
                alignItems: "center",
                resizeMode: "contain",
                transform: [
                  {
                    rotate: 360 - this.state.magnetometer + "deg"
                  }
                ]
              }}
            />
            <Image
              source={require("./compass_pointer.png")}
              style={{
                height: width - 80,
                width: 38,
                justifyContent: "center",
                alignItems: "center",
                resizeMode: "contain",
                transform: [
                  {
                    rotate: this._rotate()
                  }
                ],
                position: "absolute"
              }}
            />
          </Col>
        </Row>

        {/* <Row style={{ alignItems: "center" }} size={0.1}>
          <Col style={{ alignItems: "center" }}>
            <TouchableOpacity onPress={this._getLocationAsync}>
              <Text style={{ color: "#fff" }}>{`getLocation`}</Text>
            </TouchableOpacity>
          </Col>
        </Row> */}
        <Row style={{ alignItems: "center" }} size={0.5}>
          <Col style={{ alignItems: "center" }}>
            <Text
              style={{
                color: "#fff",
                fontSize: height / 40,
                width: width,
                textAlign: "center"
              }}
            >
              {this._degree(this.state.magnetometer)}°
            </Text>
            <Text
              style={{
                color: "#fff",
                fontSize: height / 35,
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
            <Text
              style={{
                color: "#fff",
                fontSize: height / 45,
                width: width,
                textAlign: "center",
                padding: 8
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. rhoncus
              nisi,{" "}
            </Text>
            {/* <Text style={{ color: "#fff" }}>{this.state.magnetometer}</Text> */}
            {/* <Text style={{ color: "#fff" }}>
              {location
                ? this.getQibla({ lat: location.coords.latitude, lng: location.coords.longitude })
                : "not yet"}
            </Text> */}
            {/* <Text style={{ color: "#fff" }}>
              {location ? `${location.coords.latitude} ${location.coords.longitude}` : "not yet"}
            </Text> */}
          </Col>
        </Row>
        <Row
          style={
            {
              // backgroundColor: "red"
            }
          }
          size={0.5}
        >
          <Col style={{ alignItems: "flex-end" }} size={0.68}>
            <TouchableOpacity
              style={{
                borderRadius: 8,
                backgroundColor: UtilConstants.colorPrimary,
                padding: 8
              }}
              onPress={this._goToMap}
            >
              <Text
                style={{ color: "#fff", fontSize: height / 50 }}
              >{`View On Map`}</Text>
            </TouchableOpacity>
          </Col>
          <Col
            style={{
              alignItems: "flex-end",
              // backgroundColor: "blue",
              justifyContent: "flex-end",
              padding: 8
            }}
            size={0.3}
          >
            {errorMessage ? <Text>{errorMessage}</Text> : <></>}
            <TouchableOpacity
              style={{
                borderRadius: width / 16,
                width: width / 8,
                height: width / 8,
                borderColor: UtilConstants.colorPrimary,
                backgroundColor: UtilConstants.colorPrimary,
                padding: 8,
                justifyContent: "center",
                alignItems: "center"
              }}
              onPress={this._goToMap}
            >
              <Ionicons name="md-help" color="white" size={width / 16} />
            </TouchableOpacity>
          </Col>
        </Row>
      </Grid>
    );
  }
}
