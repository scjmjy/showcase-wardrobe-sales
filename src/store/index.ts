import { createStore } from "vuex";
import deepEqual from "fast-deep-equal";
import apiProvider from "@/api/provider";
import {
    GlobalCfg,
    LoginResult,
    Model3DFile,
    PartAttachmentList,
    PartCategory,
    Product,
    Scheme,
} from "@/api/interface/provider.interface";
import { Customer, User, Model3D } from "@/api/dto/user";
import emitter from "@/event";
import { LabelValue } from "@/api/interface/common.interface";

const state = {
    user: User.load(),
    currentCustomer: Customer.load(),
    models3DFiles: Model3D.load(),
    // currentSvcId: 0,
    globalCfg: undefined as GlobalCfg | undefined,
    attachments: [] as PartAttachmentList,
    cats: [] as PartCategory[],
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
        partCats: (state) => state.cats,
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
        "SET-GLOBAL-CONFIG"(state, cfg?: GlobalCfg) {
            state.globalCfg = cfg;
        },
        "SET-CONFIG-DISCOUNTS"(state, val: LabelValue[]) {
            if (state.globalCfg) state.globalCfg.discounts = val;
        },
        "SET-PART-ATTACHMENTS"(state, attachments: PartAttachmentList) {
            state.attachments = attachments;
        },
        "SET-PART-CATEGORIES"(state, cats: PartCategory[]) {
            if (!deepEqual(state.cats, cats)) {
                state.cats = cats;
            }
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
                const cfg = (await apiProvider.requestGlobalCfg()).data!;
                try {
                    const discounts = (await apiProvider.requestDiscounts()).data || [];
                    cfg.discounts = discounts;
                } catch (error) {
                    //
                }
                commit("SET-GLOBAL-CONFIG", cfg);
                const attachments = (await apiProvider.requestPartAttachments()).data || [];
                commit("SET-PART-ATTACHMENTS", attachments);
                const cats = (await apiProvider.requestPartCategories()).data || [];
                commit("SET-PART-CATEGORIES", cats);
                emitter.emit("logged-in", "");
                return cfg;
            } catch (error) {
                await dispatch("logout");
                return Promise.reject(error);
            }
        },
        async updateDiscounts({ commit }) {
            const discounts = (await apiProvider.requestDiscounts()).data || [];
            commit("SET-CONFIG-DISCOUNTS", discounts);
        },
        async updatePartCategories({ commit }) {
            const cats = (await apiProvider.requestPartCategories()).data || [];
            commit("SET-PART-CATEGORIES", cats);
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
