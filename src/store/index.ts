import { createStore } from "vuex";
import apiProvider from "@/api/provider";
import { Product, Scheme } from "@/api/interface/provider.interface";
import { Customer, User } from "@/api/dto/user";

const state = {
    user: User.load(),
    currentCustomer: new Customer(),
    pageChannel: {
        productDetailData: undefined as undefined | Product | Scheme,
    },
};

export type StateType = typeof state;

export default createStore({
    state,
    getters: {
        isLoggedIn: (state) => Boolean(state.user.userId),
        isServing: (state) => Boolean(state.currentCustomer.customerId),
        token: (state) => state.user.token,
    },
    mutations: {
        "SWITCH-CUSTOMER"(state, payload) {
            if (payload) {
                state.currentCustomer.customerId = payload.cid;
                state.currentCustomer.customerName = payload.customerName;
                state.currentCustomer.phoneNumber = payload.phoneNumber;
            } else {
                state.currentCustomer = new Customer();
            }
        },
        "SET-USER"(state, payload) {
            if (payload) {
                state.user.userId = payload.uid;
                state.user.userName = payload.username;
                state.user.token = payload.token;
            } else {
                state.user = new User();
            }
            state.user.save();
        },
        "SET-PAGE-CHANNEL"(state, { key, value }) {
            // @ts-ignore
            state.pageChannel[key] = value;
        },
    },
    actions: {
        login({ state, commit, dispatch }, { username, passwd, code, uuid }) {
            return new Promise((resolve, reject) => {
                apiProvider
                    .login(username, passwd, code, uuid)
                    .then((loginRes) => {
                        commit("SET-USER", {
                            username,
                            ...loginRes.data,
                        });
                        resolve(loginRes.data);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
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
        logout({ commit }) {
            return apiProvider.logout().then(() => {
                commit("SET-USER", undefined);
                return "ok";
            });
        },
    },
    modules: {},
});
