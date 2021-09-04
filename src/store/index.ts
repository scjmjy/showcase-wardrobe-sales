import { createStore } from "vuex";
import apiProvider from "@/api/provider";
import { GlobalCfg, LoginResult, Product, Scheme } from "@/api/interface/provider.interface";
import { Customer, User } from "@/api/dto/user";
import emitter from "@/event";

const state = {
    user: User.load(),
    currentCustomer: Customer.load(),
    pageChannel: {
        productDetailData: undefined as undefined | Product | Scheme,
    },
    globalCfg: undefined as GlobalCfg | undefined,
    dirty: {
        customerList: false,
        schemeList: new Set<string>(),
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
            state.currentCustomer.save();
        },
        "SET-USER"(state, payload: LoginResult) {
            if (payload) {
                state.user.userId = payload.uid;
                state.user.userName = payload.name;
                state.user.token = payload.token;
                state.user.eid = payload.eid;
                state.user.accountName = payload.accountName || "";
                state.user.organization = payload.organization;
                state.user.rank = payload.rank;
            } else {
                state.user = new User();
            }
            state.user.save();
        },
        "SET-PAGE-CHANNEL"(state, { key, value }) {
            // @ts-ignore
            state.pageChannel[key] = value;
        },
        "SET-GLOBAL-CONFIG"(state, cfg?: GlobalCfg) {
            state.globalCfg = cfg;
        },
        "SET-DIRTY-CUSTOMER"(state, dirty: boolean) {
            state.dirty.customerList = dirty;
        },
        "SET-DIRTY-SCHEME"(state, { cid, dirty }: { cid: string; dirty: boolean }) {
            if (dirty) {
                state.dirty.schemeList.add(cid);
            } else {
                state.dirty.schemeList.delete(cid);
            }
        },
    },
    actions: {
        login({ state, commit, dispatch }, { username, passwd, code, uuid }) {
            return new Promise((resolve, reject) => {
                apiProvider.login(username, passwd, code, uuid).then((loginRes) => {
                    if (loginRes.ok) {
                        commit("SET-USER", {
                            accountName: username,
                            ...loginRes.data,
                        });
                        resolve(loginRes);
                    } else {
                        resolve(loginRes);
                    }
                });
            });
        },

        config({ state, commit, dispatch }) {
            return new Promise((resolve, reject) => {
                apiProvider
                    .requestGlobalCfg()
                    .then((cfgRes) => {
                        commit("SET-GLOBAL-CONFIG", cfgRes.data);
                        emitter.emit("logged-in", "");
                        resolve(cfgRes.data);
                    })
                    .catch(async (err) => {
                        await dispatch("logout");
                        reject(err);
                    });
            });
        },
        logout({ commit }) {
            return apiProvider.logout().then(() => {
                commit("SET-USER", undefined);
                commit("SWITCH-CUSTOMER", undefined);
                emitter.emit("logged-out", "");
                return "ok";
            });
        },
    },
    modules: {},
});
