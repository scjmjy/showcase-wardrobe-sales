import { getToken, setToken } from "@/utils/token";

export class Customer {
    constructor(public customerId = "", public customerName = "", public phoneNumber = "") {}
}
export class User {
    constructor(public userId = "", public userName = "", token = "") {
        this.token = token;
    }
    public get token(): string {
        return getToken() || "";
    }
    
    public set token(token : string) {
        setToken(token)
    }
    
}
