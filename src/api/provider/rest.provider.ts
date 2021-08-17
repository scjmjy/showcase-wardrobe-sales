import store from "@/store";
import request from "@/utils/request";
import {
    AjaxResponse,
    Customer,
    GlobalCfg,
    LoginResult,
    Part,
    PartCategory,
    PartCategoryMeta,
    Product,
    ProductCategory,
    Scheme,
} from "../interface/provider.interface";
import LocalProvider from "./local.provider";

export default class RestProvider extends LocalProvider {
    login(username: string, passwd: string, code?: string, uuid?: string): Promise<AjaxResponse<LoginResult>> {
        return new Promise((resolve) => {
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
                        data: res.data,
                    });
                })
                .catch((err) => {
                    resolve({
                        ok: false,
                        status: 500,
                        show: "error",
                        msg: "登录错误",
                    });
                });
        });
    }
    logout(): Promise<AjaxResponse<string>> {
        return new Promise((resolve) => {
            request({
                method: "GET",
                url: "/api/v1/user/logout/" + store.state.user.userId,
            })
                .then((res) => {
                    resolve({
                        ok: true,
                        status: res.status,
                        data: "登出成功",
                    });
                })
                .catch(() => {
                    resolve({
                        ok: false,
                        status: 500,
                        show: "error",
                        msg: "登出错误",
                    });
                });
        });
    }
    requestGlobalCfg(): Promise<AjaxResponse<GlobalCfg>> {
        return new Promise((resolve) => {
            request({
                method: "GET",
                url: "/api/v1/misc/gconfig",
            })
                .then((res) => {
                    resolve({
                        ok: true,
                        status: res.status,
                        data: {
                            partsCatExterior: res.data.parts_category_exterior,
                            partsCatInterior: res.data.parts_category_interior,
                        },
                    });
                })
                .catch(() => {
                    resolve({
                        ok: false,
                        status: 500,
                        msg: "获取全局配置出错",
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
        return new Promise((resolve) => {
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
        return new Promise((resolve) => {
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

    requestProductCategories(): Promise<AjaxResponse<ProductCategory[]>> {
        return new Promise((resolve) => {
            request({
                method: "GET",
                url: "/api/v1/biz/product/categories",
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
                        msg: "获取商品分类出错",
                    });
                });
        });
    }

    requestProducts(cid: string | number, page = 1, pageSize = 20): Promise<AjaxResponse<Product[]>> {
        return new Promise((resolve) => {
            request({
                method: "POST",
                url: "/api/v1/biz/products",
                data: {
                    cid,
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
                        msg: "获取商品列表出错",
                    });
                });
        });
    }
    createNewScheme(
        name: string,
        eid: string | number,
        cid: string | number,
        pid: string | number,
        sid?: string | number,
    ): Promise<AjaxResponse<string | number>> {
        return new Promise((resolve) => {
            request({
                method: "POST",
                url: "/api/v1/biz/scheme",
                data: {
                    name,
                    eid,
                    cid,
                    pid,
                    sid,
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
                        msg: "创建新方案出错",
                    });
                });
        });
    }

    requestSchemes(cid: string | number, page = 1, pageSize = 10): Promise<AjaxResponse<Scheme[]>> {
        return new Promise((resolve) => {
            request({
                method: "POST",
                url: "/api/v1/biz/customer/schemes",
                data: {
                    cid,
                    page,
                    pageSize,
                },
            })
                .then((res) => {
                    resolve({
                        ok: true,
                        status: res.status,
                        data: res.data.map((item: Scheme) => {
                            item.cover = ["https://dummyimage.com/200x300&text=TODO"];
                            return item;
                        }),
                    });
                })
                .catch(() => {
                    resolve({
                        ok: false,
                        status: 500,
                        show: "error",
                        msg: "获取客户方案列表出错",
                    });
                });
        });
    }
    requestPartCategories(): Promise<AjaxResponse<PartCategory[]>> {
        return new Promise((resolve) => {
            request({
                method: "GET",
                url: "/api/v1/biz/parts/categories",
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
                        msg: "获取配件分类出错",
                    });
                });
        });
    }
    requestPartCatMeta(cid: string | number): Promise<AjaxResponse<PartCategoryMeta>> {
        return new Promise((resolve) => {
            request({
                method: "POST",
                url: "/api/v1/biz/parts/category/meta",
                data: {
                    cid,
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
                        msg: "获取配件分类元数据出错",
                    });
                });
        });
    }

    requestParts(
        ptcid: string | number,
        ptbid: string | number,
        cid: string | number,
        mid: string | number,
        page = 1,
        pageSize = 10,
    ): Promise<AjaxResponse<Part[]>> {
        return new Promise((resolve) => {
            request({
                method: "GET",
                url: "/api/v1/biz/parts",
                data: {
                    ptcid,
                    ptbid,
                    cid,
                    mid,
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
                        msg: "获取配件列表出错",
                    });
                });
        });
    }
}
