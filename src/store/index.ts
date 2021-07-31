import { createStore } from "vuex";
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
        login({ commit }, payload) {
            commit("SET-USER", payload);
        },
    },
    modules: {},
});
