import React from "react";
import Svg, { Path } from "react-native-svg";

const BackHandler = (props) => (
  <Svg width="6" height="10" viewBox="0 0 6 10" fill="none" {...props}>
    <Path
      d="M5.26562 9L1.26562 5L5.26562 1"
      stroke="black"
      stroke-opacity="0.5"
      stroke-linecap="round"
    />
  </Svg>
);

export default BackHandler;
