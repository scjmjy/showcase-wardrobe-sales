import ApiProvider, { AjaxResponse, LoginResult } from "../interface/provider.interface";

export default class LocalProvider implements ApiProvider {
    constructor(parameters?: any) {}
    login(username: string, passwd: string, code: string, uuid: string): Promise<AjaxResponse<LoginResult>> {
        return Promise.resolve({
            status: 200,
            ok: true,
            data: {
                uid: 1,
                token: "fake-token",
                taskId: "task1",
            },
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
