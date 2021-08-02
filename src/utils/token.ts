import Cookies from "js-cookie";

const TokenKey = "TOKEN-KEY-HONGMU-SALES-TOOLS";

export function getToken() {
    return Cookies.get(TokenKey);
}

export function setToken(token: string) {
    return Cookies.set(TokenKey, token);
}

export function removeToken() {
    return Cookies.remove(TokenKey);
}
