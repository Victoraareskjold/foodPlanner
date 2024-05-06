import React from "react";
import Svg, { Path, G, ClipPath, Rect } from "react-native-svg";

const Check = (props) => (
  <Svg
    width="13"
    height="9"
    viewBox="0 0 13 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M1.21594 3.99999L5.38261 7.33332L12.0493 0.666656"
      stroke="white"
      stroke-width="1.5"
    />
  </Svg>
);

export default Check;
