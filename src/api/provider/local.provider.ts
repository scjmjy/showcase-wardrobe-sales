import ApiProvider, {
    AjaxResponse,
    CategoryFilter,
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
        const mockFilters = (index: number) => {
            const filter1: CategoryFilter = {
                key: "调性选择" + index,
                title: "调性选择" + index,
                styles: [
                    {
                        label: "XXXX" + index + "-1",
                        value: "XXXX" + index + "-1",
                    },
                    {
                        label: "XXXX" + index + "-2",
                        value: "XXXX" + index + "-2",
                    },
                ],
            };
            const filter2: CategoryFilter = {
                key: "风格",
                title: "风格",
                styles: [
                    {
                        label: "现代",
                        value: "现代",
                    },
                    {
                        label: "新中式",
                        value: "新中式",
                    },
                    {
                        label: "日式",
                        value: "日式",
                    },
                    {
                        label: "简欧",
                        value: "简欧",
                    },
                    {
                        label: "法式",
                        value: "法式",
                    },
                    {
                        label: "北欧",
                        value: "北欧",
                    },
                    {
                        label: "传统中式",
                        value: "传统中式",
                    },
                    {
                        label: "美式",
                        value: "美式",
                    },
                    {
                        label: "欧式古典",
                        value: "欧式古典",
                    },
                    {
                        label: "Art Deco",
                        value: "Art Deco",
                    },
                ],
            };
            const filter3: CategoryFilter = {
                key: "其他",
                title: "其他",
                styles: [
                    {
                        label: "其他" + index + "-1",
                        value: "其他" + index + "-1",
                    },
                    {
                        label: "其他" + index + "-2",
                        value: "其他" + index + "-2",
                    },
                ],
            };
            return [filter1, filter2, filter3];
        };
        return Promise.resolve({
            status: 200,
            ok: true,
            data: new Array(9).fill(0).map((val, index) => {
                return {
                    id: index + "",
                    name: "分类-" + index,
                    icon: "drawing-room",
                    filters: mockFilters(index),
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
        const mockDate = ["2021-08-10 14:00:00", "2021-08-11 14:00:00", "2021-08-12 14:00:00"];
        const mockOffer = ["13999", "", "1500", "", "14000"];
        return Promise.resolve({
            status: 200,
            ok: true,
            data: new Array(10).fill(0).map((val, index) => {
                return {
                    id: index + "",
                    name: cid + "-方案-" + index,
                    cid: cid + "",
                    customer: "客户" + cid,
                    product: "方案来源",
                    pid: index,
                    manifest: "manifest",
                    composition: "composition",
                    offer: mockOffer[index % mockOffer.length],
                    ptime: mockDate[index % mockDate.length],
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
                customer: "customer",
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
