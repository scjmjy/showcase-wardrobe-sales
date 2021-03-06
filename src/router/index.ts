import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { nextTick } from "vue";
import store from "@/store";

import Login from "@/views/login.vue";
import Home from "@/views/home/home.vue";
import SelectProduct from "@/views/product/select-product.vue";
import ProductDetail from "@/views/product/product-detail.vue";
import CustomerList from "@/views/customers/customer-list.vue";
import DemoModel from "@/views/demo/demo-model.vue";
import DemoCube from "@/views/demo/demo-cube.vue";
import DemoStorage from "@/views/demo/demo-storage.vue";
import DemoAccesory from "@/views/demo/demo-accesory.vue";
import DemoMaterial from "@/views/demo/demo-material.vue";
import Demo3D from "@/views/demo/demo-3d.vue";
import DemoDemo3 from "@/views/demo/demo-demo3.vue";
import StBuild3d from "@/views/demo/StBuild3d.vue";
import StDisplay3D from "@/views/demo/StDisplay3D.vue";
import EditScheme from "@/views/EditScheme.vue";

const routes: Array<RouteRecordRaw> = [
    { path: "/demo/build3d", name: "Build 3D", component: StBuild3d },
    { path: "/demo/display3d", name: "Display 3D", component: StDisplay3D },

    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/login",
        name: "Login",
        component: Login,
    },
    {
        path: "/select-product",
        name: "SelectProduct",
        component: SelectProduct,
    },
    {
        path: "/product-detail",
        name: "ProductDetail",
        component: ProductDetail,
    },
    {
        path: "/customers",
        name: "CustomerList",
        component: CustomerList,
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

// [Guilin: 2021-8-1] "/demo/" and "/demo/*" fails in the white list
// [Jinyuan: 2021-8-1] support wildcard character like "/demo*" which match all routers starting with "/demo", e.g. "/demo1", "/demo/test"...,
//                     and support RegEx like /demo$/ which match all routers ending with "demo", e.g. "/model-demo", "/model/demo"...
const whiteList: (string | RegExp)[] = ["/login", "/demo*", /demo$/];

function isInWhiteList(path: string) {
    for (const whitePath of whiteList) {
        const regex = whitePath instanceof RegExp ? whitePath : new RegExp(whitePath);
        if (regex.test(path)) {
            return true;
        }
    }
    return false;
}

router.beforeEach(async (to, from, next) => {
    // if (whiteList.includes(to.path)) {
    if (isInWhiteList(to.path)) {
        next();
    }
    const isLoggedIn = store.getters.isLoggedIn;
    if (!isLoggedIn) {
        next({ path: "/login" });
    } else {
        // const hasConfig = !!store.getters.globalCfg;
        const hasConfig = true;
        if (hasConfig) {
            next();
        } else {
            // $apiProvider(RestProvider) ????????? Vue app
            nextTick(() => {
                store
                    .dispatch("config")
                    .then((res) => {
                        next();
                        // next({ ...to, replace: true }); // hack?????? ??????addRoutes?????????
                    })
                    .catch(async (err) => {
                        console.log("config:", err);

                        // remove token and go to login page to re-login
                        await store.dispatch("logout");
                        next("/login");
                        // next(`/login?redirect=${to.path}`);
                    })
                    .catch(() => {});
            });
        }
        // next();
    }
});

export default router;
