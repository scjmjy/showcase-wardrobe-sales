import axios from "axios";
import store from "@/store";
import { ElMessage } from "element-plus";
import { getToken } from "./token";
import debounce from "@/utils/debounce";
// create an axios instance
const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 50000, // request timeout
});

service.interceptors.request.use(
    (config) => {
        const token = store.getters.token || getToken();
        if (token) {
            config.headers["token"] = token;
        }
        config.headers["client-id"] = store.getters.client_id;
        config.headers["client-version"] = store.getters.client_version;
        config.headers["Content-Type"] = "application/json";

        return config;
    },
    (error) => {
        console.log("axios request error: ", error);
        return Promise.reject(error);
    },
);

const relogin = debounce(
    () => {
        store.dispatch("logout").then(() => {
            location.reload();
        });
    },
    1000,
    true,
);

service.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response.status === 401) {
            ElMessage({
                type: "warning",
                message: "登录过期，请重新登录。",
            });
            relogin();
        }
        return Promise.reject(error);
    },
);

export default service;
