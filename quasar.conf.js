module.exports = function () {
  return {
    build: {
      target: {
        browser: ["es2019", "edge88", "firefox78", "chrome87", "safari13.1"],
        node: "node16",
      },
      vueRouterMode: "hash",
    },

    devServer: {
      https: false,
      port: 9000,
      open: true,
    },

    framework: {
      config: {
        brand: {
          primary: "#173A79",
          secondary: "#1F9343",
        },
      },
      plugins: ["Notify"],
      boot: ["firebase"],
    },

    extras: ["material-icons"],
    animations: [],

    pwa: {
      workboxMode: "generateSW",
      injectPwaMetaTags: true,
      swFilename: "sw.js",
      manifestFilename: "manifest.json",
      useCredentialsForManifestTag: false,
    },

    capacitor: {
      hideSplashscreen: true,
      appName: "Milano Relay Marathon",
      appId: "com.prinapo.relaymarathon",
      iconPaths: {
        ios: "src/assets/icona_app_safe.png",
        android: "src/assets/icona_app_safe.png",
      },
    },
  };
};
