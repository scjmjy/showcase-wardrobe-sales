import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import DemoModel from "@/views/demo/demo-model.vue";
import DemoCube from "@/views/demo/demo-cube.vue";
import DemoStorage from "@/views/demo/demo-storage.vue";
import DemoAccesory from "@/views/demo/demo-accesory.vue";
import DemoMaterial from "@/views/demo/demo-material.vue";
import Demo3D from "@/views/demo/demo-3d.vue";
import DemoDemo3 from "@/views/demo/demo-demo3.vue";
import StBuild3d from "@/views/demo/StBuild3d.vue";
import StDisplay3D from "@/views/demo/StDisplay3D.vue";
import EditScheme from "@/views/EditScheme.vue"

const routes: Array<RouteRecordRaw> = [
    { path: "/demo/build3d", name: "Build 3D", component: StBuild3d },
    { path: "/demo/display3d", name: "Display 3D", component: StDisplay3D },

    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/demo-model",
        name: "DemoModel",
        component: DemoModel,
    },
    {
        path: "/demo-cube",
        name: "DemoCube",
        component: DemoCube,
    },
    {
        path: "/demo-storage",
        name: "DemoStorage",
        component: DemoStorage,
    },
    {
        path: "/demo-accesory",
        name: "DemoAccesory",
        component: DemoAccesory,
    },
    {
        path: "/demo-material",
        name: "DemoMaterial",
        component: DemoMaterial,
    },
    {
        path: "/demo-3d",
        name: "Demo3D",
        component: Demo3D,
    },
    {
        path: "/demo-demo3",
        name: "DemoDemo3",
        component: DemoDemo3,
    },
    {
        path: "/editscheme",
        name: "EditScheme",
        component: EditScheme,
    },
    // {
    //     path: "/about",
    //     name: "About",
    //     // route level code-splitting
    //     // this generates a separate chunk (about.[hash].js) for this route
    //     // which is lazy-loaded when the route is visited.
    //     component: () => import(/* webpackChunkName: "about" */ "../views/About.vue"),
    // },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
