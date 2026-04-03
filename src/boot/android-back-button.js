import { App } from "@capacitor/app";
import { Platform } from "quasar";

export default () => {
  if (Platform.is.capacitor && Platform.is.android) {
    App.addListener("backButton", (data) => {
      if (!data.canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });
  }
};
