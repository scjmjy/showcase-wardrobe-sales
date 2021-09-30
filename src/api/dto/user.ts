// import { getToken, setToken } from "@/utils/token";
import jscookie from "js-cookie";

const TokenKeyUser = "TOKEN-KEY-HONGMU-SALES-TOOLS-USER";
const TokenKeyCustomer = "TOKEN-KEY-HONGMU-SALES-TOOLS-CUSTOMER";

export class Customer {
    constructor(
        public customerId = "",
        public customerName = "",
        public phoneNumber = "",
        public latestSvcId?: number,
    ) {}

    save(): string | undefined {
        return jscookie.set(TokenKeyCustomer, JSON.stringify(this));
    }

    static load(): Customer {
        const customerStr = jscookie.get(TokenKeyCustomer) || "{}";
        let customer;
        try {
            customer = JSON.parse(customerStr);
        } catch (err) {
            console.log(err);
        }
        return Object.assign(new Customer(), customer);
    }
}
export class User {
    constructor(
        public userId = 0,
        public userName = "",
        public token = "",
        public eid = 0,
        public accountName = "",
        public organization = "",
        public rank = "",
    ) {}

    save(): string | undefined {
        return jscookie.set(TokenKeyUser, JSON.stringify(this));
    }

    static load(): User {
        const userStr = jscookie.get(TokenKeyUser) || "{}";
        let user;
        try {
            user = JSON.parse(userStr);
        } catch (err) {
            console.log(err);
        }
        return Object.assign(new User(), user);
    }
}
