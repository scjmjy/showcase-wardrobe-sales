import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import store from "@/store";

import Login from "@/views/login.vue";
import Home from "@/views/home/home.vue";
import SelectProduct from "@/views/product/select-product.vue";
import ProductDetail from "@/views/product/product-detail.vue";
import CustomerList from "@/views/customers/customer-list.vue";

const routes: Array<RouteRecordRaw> = [
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
    if (isInWhiteList(to.path)) {
        next();
        return;
    }
    const isLoggedIn = store.getters.isLoggedIn;
    if (!isLoggedIn) {
        next({ path: "/login" });
    } else {
        const hasConfig = store.state.globalCfg !== undefined;
        if (hasConfig) {
            next();
        } else {
            return store
                .dispatch("config")
                .then((res) => {
                    next();
                    // next({ ...to, replace: true }); // hack方法 确保addRoutes已完成
                })
                .catch(async (err) => {
                    next("/login");
                    // next(`/login?redirect=${to.path}`);
                });
        }
        // next();
    }
});

export default router;
