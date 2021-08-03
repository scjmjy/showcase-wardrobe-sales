import request from "@/utils/request";
import { AjaxResponse, LoginResult } from "../interface/provider.interface";
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
}
