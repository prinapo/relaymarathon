import { StatusBar } from "@capacitor/status-bar";
import { Platform } from "quasar";

export default async () => {
  if (!Platform.is.capacitor) {
    return;
  }

  if (Platform.is.ios) {
    try {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: "#173A79" });
    } catch (error) {
      console.warn("StatusBar iOS non disponibile o in errore", error);
    }
  }
};
