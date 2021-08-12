import { LabelValue } from "./common.interfact";

// import { LabelValue } from "./common.interface";
export interface AjaxResponse<T> {
    status: number; // HTTP status code
    ok: boolean; // 此次请求的结果是 success 还是 error
    data?: T; // 服务器返回的实际数据
    msg?: string; // 要显示的信息
    show?: "warning" | "error" | "success" | "info" | false; // 显示的方式
}

export interface LoginResult {
    uid: number;
    token: string;
}
// export interface CaptchaResult {
//     uuid: number;
//     img: string;
// }

export interface Product {
    id: string;
    name: string;
    manifest: string;
    compostion: string;
    description: string;
    cover: string;
}

// export interface Category {
//     id: string | number;
//     name: string;
//     icon: string;
// }

export interface CategoryFilter {
    key: string;
    title: string;
    styles: LabelValue[];
}

export interface FilterResults {
    cid: string;
    filters: string[][];
}

// export interface ProductCategory extends Category {
//     filters: CategoryFilter[];
// }

export interface ProductCategory {
    id: string | number;
    name: string;
    pic?: string;
    leaf?: boolean;
    children?: ProductCategory[];
}

export interface Customer {
    cid: string;
    name: string;
    phone?: string;
}

export interface Scheme {
    id: string;
    name: string;
    cid: string;
    customer: string;
    product: string;
    pid: number;
    manifest: string;
    composition: string;
    offer: string;
    ptime: string;
    cover: [string, string, string];
}

export default interface ApiProvider {
    /**
     * 登录接口
     * @param username 用户名
     * @param passwd 密码
     * @param code 验证码
     * @param uuid 图片验证服务返回给前端的uuid，再次传给服务器
     */
    login(username: string, passwd: string, code?: string, uuid?: string): Promise<AjaxResponse<LoginResult>>;
    logout(): Promise<AjaxResponse<string>>;

    // getCaptchaImage(): Promise<AjaxResponse<CaptchaResult>>;

    // requestGlobalConfig(): Promise<AjaxResponse<ConfigResult>>;

    requestProductCategories(): Promise<AjaxResponse<ProductCategory[]>>;
    /**
     * 获取某个商品分类下的商品列表，分页
     * @param cid 商品分类 id
     */
    requestProducts(cid: string | number, page: number, pageSize: number): Promise<AjaxResponse<Product[]>>;

    requestProductDetail(pid: string | number): Promise<AjaxResponse<Product>>;

    /**
     * 创建一个客户
     * @param name 用户名
     * @param phone 用户手机
     * @returns 用户id
     */
    createCustomer(name: string, phone?: string): Promise<AjaxResponse<string>>;

    requestCustomerList(uid: string | number, page: number, pageSize: number): Promise<AjaxResponse<Customer[]>>;

    /**
     * 获取某客户的方案列表
     * @param cid 客户 id
     */
    requestSchemes(cid: string | number, page: number, pageSize: number): Promise<AjaxResponse<Scheme[]>>;

    requestSchemeDetail(sid: string | number): Promise<AjaxResponse<Scheme>>;
}
