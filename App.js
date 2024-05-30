import Navigation from "./src/navigation/Navigation";
import { NavigationContainer } from "@react-navigation/native";
import Onboarding from "./src/screens/onboarding/Onboarding";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Navigation />
    </GestureHandlerRootView>
  );
}
