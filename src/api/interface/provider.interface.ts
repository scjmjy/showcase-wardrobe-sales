// import { LabelValue } from "./common.interface";
export interface AjaxResponse<T> {
    status: number; // HTTP status code
    ok: boolean; // 此次请求的结果是 success 还是 error
    data: T; // 服务器返回的实际数据
    toastMsg?: string; // reserved
    errorMsg?: string; // reserved
}

export interface LoginResult {
    uid: number;
    token: string;
}

export interface Product {
    name: string;
    manifest: string;
    compostion: string;
    description: string;
    cover: string;
}

export interface Category {
    id: string | number;
    name: string;
    icon: string;
}

export interface ProductCategory extends Category {
    children: Category[];
}

// export interface CaptchaResult {
//     uuid: number;
//     img: string;
// }

export default interface ApiProvider {
    /**
     * 登录接口
     * @param username 用户名
     * @param passwd 密码
     * @param code 验证码
     * @param uuid 图片验证服务返回给前端的uuid，再次传给服务器
     */
    login(username: string, passwd: string, code?: string, uuid?: string): Promise<AjaxResponse<LoginResult>>;

    // getCaptchaImage(): Promise<AjaxResponse<CaptchaResult>>;

    // requestGlobalConfig(): Promise<AjaxResponse<ConfigResult>>;

    requestProductCategories(): Promise<AjaxResponse<ProductCategory[]>>;
    /**
     * 获取某个商品分类下的商品列表，分页
     * @param cid 商品分类 id
     */
    requestProducts(cid: string | number, page: number, pageSize: number): Promise<AjaxResponse<Product[]>>;
}
