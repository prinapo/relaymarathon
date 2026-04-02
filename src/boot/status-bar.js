import { StatusBar } from "@capacitor/status-bar";
import { Platform } from "quasar";

export default ({ app, router, store }) => {
  if (Platform.is.capacitor && Platform.is.android) {
    StatusBar.setOverlaysWebView({ overlay: false });
    StatusBar.setBackgroundColor({ color: "#173A79" });
    StatusBar.getInfo().then((info) => {
      if (info && info.height) {
        document.documentElement.style.setProperty(
          "--status-bar-height",
          info.height + "px",
        );
        document.body.style.paddingTop = info.height + "px";
        console.log("📱 Status bar height:", info.height);
      }
    });
  }
};
