import { route } from "quasar/wrappers";
import { createRouter, createWebHashHistory } from "vue-router";
import { auth } from "src/boot/firebase.js";
import { waitForAuthReady } from "src/composables/useAuth.js";

export default route(function (/* { store, ssrContext } */) {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    history: createWebHashHistory(),
    routes: [
      {
        path: "/",
        component: () => import("layouts/MainLayout.vue"),
        children: [
          { path: "", component: () => import("pages/IndexPage.vue") },
          { path: "home", component: () => import("pages/IndexPage.vue") },
          { path: "race", component: () => import("pages/RacePage.vue") },
          {
            path: "team",
            component: () => import("pages/TeamPage.vue"),
            meta: { requiresAuth: true },
          },
          {
            path: "admin",
            component: () => import("pages/AdminPage.vue"),
            meta: { requiresAuth: true, requiresAdmin: true },
          },
          {
            path: "appointments",
            component: () => import("pages/AppointmentsPage.vue"),
          },
          { path: "route", component: () => import("pages/PercorsoPage.vue") },
          { path: "faq", component: () => import("pages/FaqPage.vue") },
          { path: "help", component: () => import("pages/HelpPage.vue") },
          {
            path: "admin-request",
            component: () => import("pages/AdminRequestPage.vue"),
            meta: { requiresAuth: true },
          },
        ],
      },
      {
        path: "/splash",
        component: () => import("layouts/MainLayout.vue"),
        children: [
          { path: "", component: () => import("pages/SplashPage.vue") },
        ],
      },
      {
        path: "/login",
        component: () => import("layouts/AuthLayout.vue"),
        children: [
          { path: "", component: () => import("pages/LoginPage.vue") },
        ],
      },
      {
        path: "/:catchAll(.*)*",
        component: () => import("pages/ErrorNotFound.vue"),
      },
    ],
  });

  const isFirstVisit = () => {
    const visited = localStorage.getItem("appVisited");
    return !visited;
  };

  const markVisited = () => {
    localStorage.setItem("appVisited", "true");
  };

  const isPwa = () => {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  };

  Router.beforeEach(async (to, from, next) => {
    if (to.path === "/" || to.path === "") {
      if (isPwa() || isFirstVisit()) {
        markVisited();
        next("/splash");
      } else {
        next("/home");
      }
      return;
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const requiresAdmin = to.matched.some(
      (record) => record.meta.requiresAdmin,
    );

    await waitForAuthReady();

    // Check if user is authenticated
    const user = auth.currentUser;
    const isAuthenticated = !!user;

    // Handle routes that require authentication
    if (requiresAuth) {
      if (!isAuthenticated) {
        // Not logged in - redirect to login page
        next("/login");
        return;
      }
      // User is authenticated, continue checking permissions
    }

    // Handle routes that require admin
    if (requiresAdmin) {
      if (!isAuthenticated) {
        // Should not happen since requiresAuth is checked first, but just in case
        next("/login");
        return;
      }
      // Get the latest token claims
      const tokenResult = await user.getIdTokenResult(true);
      if (tokenResult.claims.admin === true) {
        // Admin access granted
        next();
      } else {
        // Not admin - redirect to home
        next("/");
      }
      return;
    }

    // All checks passed, allow navigation
    next();
  });

  return Router;
});
