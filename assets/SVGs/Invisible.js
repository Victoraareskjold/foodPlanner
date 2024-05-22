import React from "react";
import Svg, { Path, G, ClipPath, Rect, Defs } from "react-native-svg";

const Invisible = (props) => (
  <Svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G clip-path="url(#clip0_49_268)">
      <Path
        d="M5.16715 4.65943C6.4413 3.83143 7.91987 3.21429 9.50001 3.21429C13.0872 3.21429 16.16 6.39643 17.51 8.03057C17.7234 8.29672 17.8417 8.64257 17.8417 9C17.8417 9.35872 17.7234 9.70329 17.51 9.96943C16.7656 10.8694 15.4979 12.2413 13.91 13.2904M11.4286 14.49C10.8089 14.6777 10.1634 14.7857 9.50001 14.7857C5.91287 14.7857 2.84001 11.6036 1.49001 9.96943C1.27297 9.69311 1.15603 9.35136 1.1583 9C1.1583 8.64257 1.27658 8.29672 1.49001 8.03057C1.91815 7.51372 2.51858 6.84 3.25401 6.16114"
        stroke="#222222"
        stroke-width="1.28571"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M11.318 10.818C11.7864 10.333 12.0456 9.68347 12.0398 9.00925C12.0339 8.33503 11.7635 7.69009 11.2867 7.21332C10.8099 6.73656 10.165 6.46613 9.49077 6.46027C8.81655 6.45441 8.167 6.71359 7.68203 7.182M17.8572 17.3571L1.14288 0.642857"
        stroke="#222222"
        stroke-width="1.28571"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_49_268">
        <Rect width="18" height="18" fill="white" transform="translate(0.5)" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default Invisible;
