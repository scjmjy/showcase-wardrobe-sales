import request from "@/utils/request";
import { AjaxResponse, Customer, LoginResult } from "../interface/provider.interface";
import LocalProvider from "./local.provider";

export default class RestProvider extends LocalProvider {
    login(username: string, passwd: string, code?: string, uuid?: string): Promise<AjaxResponse<LoginResult>> {
        return new Promise((resolve, reject) => {
            request({
                method: "POST",
                url: "/api/v1/user/login",
                data: {
                    username,
                    passwd,
                    code,
                    uuid,
                },
            })
                .then((res) => {
                    resolve({
                        ok: true,
                        status: res.status,
                        data: {
                            uid: res.data.uid,
                            token: res.data.token,
                        },
                    });
                })
                .catch(() => {
                    reject({
                        showMsg: "登录错误",
                    });
                });
        });
    }
    // getCaptchaImage(): Promise<AjaxResponse<CaptchaResult>> {
    //     return Promise.resolve({
    //         status: 200,
    //         ok: true,
    //         data: {
    //             uuid: 1,
    //             img: '',
    //         },
    //     });
    // }
    createCustomer(name: string, mobile?: string): Promise<AjaxResponse<string>> {
        return new Promise((resolve, reject) => {
            request({
                method: "POST",
                url: "/api/v1/biz/customer",
                data: {
                    name,
                    mobile,
                },
            })
                .then((res) => {
                    resolve({
                        ok: true,
                        status: res.status,
                        data: res.data.id,
                    });
                })
                .catch(() => {
                    resolve({
                        ok: false,
                        status: 500,
                        show: "error",
                        msg: "创建客户失败",
                    });
                });
        });
    }
    requestCustomerList(eid: string | number, page = 1, pageSize = 20): Promise<AjaxResponse<Customer[]>> {
        return new Promise((resolve, reject) => {
            request({
                method: "POST",
                url: "/api/v1/biz/customers",
                data: {
                    eid,
                    page,
                    pageSize,
                },
            })
                .then((res) => {
                    resolve({
                        ok: true,
                        status: res.status,
                        data: res.data,
                    });
                })
                .catch(() => {
                    resolve({
                        ok: false,
                        status: 500,
                        show: "error",
                        msg: "获取用户列表失败",
                    });
                });
        });
    }
}
