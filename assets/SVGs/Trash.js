import React from "react";
import Svg, { Path, G, ClipPath, Rect } from "react-native-svg";

const Trash = (props) => (
  <Svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M3.00002 5.25H15M7.50002 8.25V12.75M10.5 8.25V12.75M3.75002 5.25L4.50002 14.25C4.50002 14.6478 4.65805 15.0294 4.93936 15.3107C5.22066 15.592 5.60219 15.75 6.00002 15.75H12C12.3978 15.75 12.7794 15.592 13.0607 15.3107C13.342 15.0294 13.5 14.6478 13.5 14.25L14.25 5.25M6.75002 5.25V3C6.75002 2.80109 6.82903 2.61032 6.96969 2.46967C7.11034 2.32902 7.3011 2.25 7.50002 2.25H10.5C10.6989 2.25 10.8897 2.32902 11.0303 2.46967C11.171 2.61032 11.25 2.80109 11.25 3V5.25"
      stroke="#FF7F7F"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);

export default Trash;
