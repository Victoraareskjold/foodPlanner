import React from "react";
import Svg, { Path, G, ClipPath, Rect, Defs } from "react-native-svg";

const Visible = (props) => (
  <Svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G clip-path="url(#clip0_49_272)">
      <Path
        d="M17.51 8.03057C17.7234 8.29672 17.8417 8.64257 17.8417 9C17.8417 9.35872 17.7234 9.70329 17.51 9.96943C16.16 11.6036 13.0872 14.7857 9.50001 14.7857C5.91287 14.7857 2.84001 11.6036 1.49001 9.96943C1.27297 9.69311 1.15603 9.35136 1.1583 9C1.1583 8.64257 1.27658 8.29672 1.49001 8.03057C2.84001 6.39643 5.91287 3.21429 9.50001 3.21429C13.0872 3.21429 16.16 6.39643 17.51 8.03057Z"
        stroke="#222222"
        stroke-width="1.28571"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M9.50002 11.5714C10.182 11.5714 10.8361 11.3005 11.3183 10.8183C11.8005 10.336 12.0714 9.68199 12.0714 9C12.0714 8.31802 11.8005 7.66396 11.3183 7.18173C10.8361 6.69949 10.182 6.42857 9.50002 6.42857C8.81803 6.42857 8.16398 6.69949 7.68174 7.18173C7.19951 7.66396 6.92859 8.31802 6.92859 9C6.92859 9.68199 7.19951 10.336 7.68174 10.8183C8.16398 11.3005 8.81803 11.5714 9.50002 11.5714Z"
        stroke="#222222"
        stroke-width="1.28571"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_49_272">
        <Rect width="18" height="18" fill="white" transform="translate(0.5)" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default Visible;
