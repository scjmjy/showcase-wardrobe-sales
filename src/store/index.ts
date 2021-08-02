import { createStore } from "vuex";
import apiProvider from "@/api/provider";
import { Customer, User } from "@/api/dto/user";

export default createStore({
    state: {
        user: new User(),
        currentCustomer: new Customer(),
    },
    getters: {
        isLoggedIn: (state) => Boolean(state.user.userId),
        isServing: (state) => Boolean(state.currentCustomer.customerId),
    },
    mutations: {
        "SWITCH-CUSTOMER"(state, payload) {
            if (payload) {
                state.currentCustomer.customerId = "11111";
                state.currentCustomer.customerName = payload.customerName;
                state.currentCustomer.phoneNumber = payload.phoneNumber;
            } else {
                state.currentCustomer = new Customer();
            }
        },
        "SET-USER"(state, payload) {
            if (payload) {
                state.user.userId = "11111";
                state.user.userName = payload.username;
            } else {
                state.user = new User();
            }
        },
    },
    actions: {
        login({ state, commit, dispatch }, { username, passwd, code, uuid }) {
            commit("SET-USER", { username, passwd, code, uuid });
            // return new Promise((resolve, reject) => {
            //     apiProvider
            //         .login(username, passwd, code, uuid)
            //         .then((loginRes) => {
            //             commit("SET-USER", loginRes.data);
            //             resolve(loginRes.data);
            //         })
            //         .catch((err) => {
            //             reject(err);
            //         });
            // });
        },

        // config({ state, commit, dispatch }) {
        //     return new Promise((resolve, reject) => {
        //         apiProvider
        //             .requestGlobalConfig()
        //             .then((cfgRes) => {
        //                 commit("SET-GLOBAL-CONFIG", cfgRes.data);
        //                 resolve(cfgRes.data);
        //                 app.$emit("login");
        //             })
        //             .catch((err) => {
        //                 commit("CLEAR-USER-INFO");
        //                 reject(err);
        //             });
        //     });
        // },
        logout({ state, commit, dispatch }) {
            commit("SET-USER", undefined);
            return Promise.resolve();
        },
    },
    modules: {},
});
