// Keeps the "/login" route resolving (e.g. after logout); "/" renders the same screen.
import LoginScreen from "../screens/LoginScreen";

export default function Login() {
  return <LoginScreen />;
}
