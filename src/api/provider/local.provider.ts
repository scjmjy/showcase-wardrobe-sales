import ApiProvider, {
    AjaxResponse,
    Customer,
    LoginResult,
    Product,
    ProductCategory,
    Scheme,
} from "../interface/provider.interface";

export default class LocalProvider implements ApiProvider {
    login(username: string, passwd: string, code?: string, uuid?: string): Promise<AjaxResponse<LoginResult>> {
        return Promise.resolve({
            status: 200,
            ok: true,
            data: {
                uid: 1,
                token: "fake-token-" + username + passwd + code + uuid,
            },
        });
    }
    logout(): Promise<AjaxResponse<string>> {
        return Promise.resolve({
            status: 200,
            ok: true,
            data: "logout success",
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

    requestProductCategories(): Promise<AjaxResponse<ProductCategory[]>> {
        return Promise.resolve({
            status: 200,
            ok: true,
            data: new Array(10).fill(0).map((val, index) => {
                return {
                    id: index + "",
                    name: "分类-" + index,
                    icon: "closet",
                    children: new Array(10).fill(0).map((val2, index2) => ({
                        id: "" + index + index2,
                        name: "子分类-" + index + index2,
                        icon: "closet",
                    })),
                };
            }),
        });
    }
    requestProducts(cid: string | number, page = 1, pageSize = 20): Promise<AjaxResponse<Product[]>> {
        return Promise.resolve({
            status: 200,
            ok: true,
            data: new Array(10).fill(0).map((val, index) => {
                return {
                    id: index + "",
                    name: cid + "-商品-" + index,
                    manifest: "manifest",
                    compostion: "compostion",
                    description: "description",
                    cover: "https://picsum.photos/300/300?random=" + index + cid,
                };
            }),
        });
    }

    requestProductDetail(pid: string | number): Promise<AjaxResponse<Product>> {
        return Promise.resolve({
            status: 200,
            ok: true,
            data: {
                id: pid + "",
                name: "商品-" + pid,
                manifest: "manifest",
                compostion: "compostion",
                description: "description",
                cover: "https://picsum.photos/300/300?random=" + pid,
            },
        });
    }

    createCustomer(name: string, phone?: string): Promise<AjaxResponse<string>> {
        throw new Error("Method not implemented.");
    }
    requestCustomerList(uid: string | number, page?: number, pageSize?: number): Promise<AjaxResponse<Customer[]>> {
        throw new Error("Method not implemented.");
    }
    requestSchemes(cid: string | number, page = 1, pageSize = 1): Promise<AjaxResponse<Scheme[]>> {
        return Promise.resolve({
            status: 200,
            ok: true,
            data: new Array(10).fill(0).map((val, index) => {
                return {
                    id: index + "",
                    name: cid + "-方案-" + index,
                    cid: cid + "",
                    customer: cid + "",
                    product: "方案来源",
                    pid: index,
                    manifest: "manifest",
                    composition: "composition",
                    offer: index % 2 === 0 ? "10000" : "0",
                    ptime: Date.now() + "",
                    cover: [
                        "https://picsum.photos/300/300?random=" + index + cid,
                        "https://picsum.photos/300/300?random=1" + index + cid,
                        "https://picsum.photos/300/300?random=2" + index + cid,
                    ],
                };
            }),
        });
    }
    requestSchemeDetail(sid: string | number): Promise<AjaxResponse<Scheme>> {
        return Promise.resolve({
            status: 200,
            ok: true,
            data: {
                id: sid + "",
                name: "方案-" + sid,
                cid: 2 + "",
                customer: "",
                product: "方案来源",
                pid: 1,
                manifest: "manifest",
                composition: "composition",
                offer: +sid % 2 === 0 ? "10000" : "0",
                ptime: Date.now() + "",
                cover: [
                    "https://picsum.photos/300/300?random=" + sid,
                    "https://picsum.photos/300/300?random=1" + sid,
                    "https://picsum.photos/300/300?random=2" + sid,
                ],
            },
        });
    }
}
