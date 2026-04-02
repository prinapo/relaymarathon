import { App } from "@capacitor/app";
import { Platform } from "quasar";
console.log("🔙 Android back-button boot init (web mode)");
export default ({ app, router, store }) => {
  console.log("🔙 Android back-button boot init (web mode)");

  if (Platform.is.capacitor && Platform.is.android) {
    console.log("🔙 Attaching back button listener for Android");
    App.addListener("backButton", (data) => {
      if (!data.canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });
  }
};