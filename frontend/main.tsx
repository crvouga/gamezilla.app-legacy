import { registerRootComponent } from "expo";
/** URL polyfill. Required for Supabase queries to work in React Native. */
import "react-native-url-polyfill/auto";
import { AppView } from "./app/app-view";

registerRootComponent(AppView);
