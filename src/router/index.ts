import { createRouter, createWebHistory } from "vue-router";
import DebateViewer from "../components/DebateViewer.vue";
import DebaterConfig from "../pages/DebaterConfig.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: DebateViewer,
    },
    {
      path: "/config",
      name: "config",
      component: DebaterConfig,
    },
  ],
});

export default router;
