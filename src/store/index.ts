import { createStore } from "vuex";
import apiProvider from "@/api/provider";
import {
    GlobalCfg,
    LoginResult,
    Model3DFile,
    PartAttachmentList,
    Product,
    Scheme,
} from "@/api/interface/provider.interface";
import { Customer, User, Model3D } from "@/api/dto/user";
import emitter from "@/event";

const state = {
    user: User.load(),
    currentCustomer: Customer.load(),
    models3DFiles: Model3D.load(),
    // currentSvcId: 0,
    pageChannel: {
        productDetailData: undefined as undefined | Product | Scheme,
    },
    globalCfg: undefined as GlobalCfg | undefined,
    attachments: [] as PartAttachmentList,
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
                state.currentCustomer.currentSvcId = payload.currentSvcId;
            } else {
                state.currentCustomer = new Customer();
            }
            state.currentCustomer.save();
        },
        "SET-CUSTOMER-CURRENT-SVCID"(state, id: number) {
            state.currentCustomer.currentSvcId = id;
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
                state.user.storeId = payload.storeId || 0;
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
        "SET-PART-ATTACHMENTS"(state, attachments: PartAttachmentList) {
            state.attachments = attachments;
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
        "SET-3DMODELS"(state, models: Model3DFile[]) {
            // TODO models 是从后台获取的最新的3D模型文件列表；state.models3DFiles 是上一次获取的文件列表
            state.models3DFiles = models;
            Model3D.save(state.models3DFiles); // 保存到localStorage
        },
    },
    actions: {
        login({ state, commit, dispatch }, { username, passwd, storeId, code, uuid }) {
            return new Promise((resolve, reject) => {
                apiProvider.login(username, passwd, storeId, code, uuid).then((loginRes) => {
                    if (loginRes.ok) {
                        commit("SET-USER", {
                            accountName: username,
                            storeId,
                            ...loginRes.data,
                        });
                        resolve(loginRes);
                    } else {
                        resolve(loginRes);
                    }
                });
            });
        },

        async config({ state, commit, dispatch }) {
            try {
                const cfg = (await apiProvider.requestGlobalCfg()).data;
                commit("SET-GLOBAL-CONFIG", cfg);
                const attachments = (await apiProvider.requestPartAttachments()).data;
                commit("SET-PART-ATTACHMENTS", attachments);
                emitter.emit("logged-in", "");
                return cfg;
            } catch (error) {
                await dispatch("logout");
                return Promise.reject(error);
            }
        },
        logout({ commit }) {
            return apiProvider.logout().then(() => {
                commit("SET-USER", undefined);
                commit("SWITCH-CUSTOMER", undefined);
                emitter.emit("logged-out", "");
                return "ok";
            });
        },
        async cache3DModels({ commit }) {
            const res = await apiProvider.request3DModels();
            commit("SET-3DMODELS", res.data || []);
        },
    },
    modules: {},
});
