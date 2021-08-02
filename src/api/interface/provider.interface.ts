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
}
