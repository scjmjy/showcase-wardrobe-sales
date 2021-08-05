// import { getToken, setToken } from "@/utils/token";
import jscookie from "js-cookie";

const TokenKey = "TOKEN-KEY-HONGMU-SALES-TOOLS";

export class Customer {
    constructor(public customerId = "", public customerName = "", public phoneNumber = "") {}
}
export class User {
    constructor(public userId = "", public userName = "", public token = "") {}

    save(): string | undefined {
        return jscookie.set(TokenKey, JSON.stringify(this));
    }

    static load(): User {
        const userStr = jscookie.get(TokenKey) || "{}";
        let user;
        try {
            user = JSON.parse(userStr);
        } catch (err) {
            console.log(err);
        }
        return Object.assign(new User(), user);
    }
}
