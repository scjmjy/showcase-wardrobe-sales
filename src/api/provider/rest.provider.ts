import store from "@/store";
import request from "@/utils/request";
import {
    AjaxResponse,
    Background,
    BackgroundType,
    CreateSchemeResult,
    Customer,
    GlobalCfg,
    LoginResult,
    Model3DFile,
    OssSignature,
    Part,
    PartAttachmentList,
    PartCategory,
    PartCategoryMeta,
    Product,
    ProductCategory,
    RequestPartId,
    Scheme,
    SchemeManifest,
    SchemeOffer,
    Service,
    Store,
    VisitorRecordItem,
} from "../interface/provider.interface";
import LocalProvider from "./local.provider";
import emitter from "@/event";
import { PartCount } from "@/lib/scheme";
import { Size3D } from "../interface/common.interface";

export default class RestProvider extends LocalProvider {
    login(
        username: string,
        passwd: string,
        storeId: string | number,
        code?: string,
        uuid?: string,
    ): Promise<AjaxResponse<LoginResult>> {
        return new Promise((resolve) => {
            request({
                method: "POST",
                url: "/api/v1/user/login",
                data: {
                    username,
                    passwd,
                    code,
                    uuid,
                    orgidservice: storeId,
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
                            partsCatBoard: [9, 20],
                            partsCatCube: [20],
                            partsCatPartition: [9],
                            baseUrl: res.data.baseUrl,
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
    requestPartAttachments(): Promise<AjaxResponse<PartAttachmentList>> {
        return new Promise((resolve) => {
            request({
                method: "GET",
                url: "/api/v1/biz/parts/attachments",
            })
                .then((res) => {
                    // TODO
                    // const data: PartAttachmentList = res.data || [];
                    // for (const item of data) {
                    //     for (const item2 of item.attachmentsList) {
                    //         item2.ptcid = 15;
                    //     }
                    // }
                    resolve({
                        ok: true,
                        status: res.status,
                        data: res.data || [],
                    });
                })
                .catch(() => {
                    resolve({
                        ok: false,
                        status: 500,
                        msg: "获取附带配件出错",
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
        const { storeId, eid } = store.state.user;
        return new Promise((resolve) => {
            request({
                method: "POST",
                url: "/api/v1/biz/customer",
                data: {
                    name,
                    mobile,
                    eid,
                    orgid: storeId,
                },
            })
                .then((res) => {
                    const cid = res.data.id ? res.data.id.toString() : "";
                    emitter.emit("customer-created", res.data.id.toString());
                    resolve({
                        ok: true,
                        status: res.status,
                        data: cid,
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
        const { storeId } = store.state.user;
        return new Promise((resolve) => {
            request({
                method: "POST",
                url: "/api/v1/biz/customers",
                data: {
                    eid,
                    orgid: storeId,
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
                        data: res.data || [],
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
    requestProductDetail(pid: string | number): Promise<AjaxResponse<Product>> {
        return new Promise((resolve) => {
            request({
                method: "GET",
                url: "/api/v1/biz/product/" + pid,
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
                        msg: "获取商品详情出错",
                    });
                });
        });
    }
    createNewScheme(
        name: string,
        svcid: number | undefined,
        eid: string | number,
        cid: string | number,
        pid?: string | number,
        sid?: string | number,
    ): Promise<AjaxResponse<CreateSchemeResult>> {
        return new Promise((resolve) => {
            request({
                method: "POST",
                url: "/api/v1/biz/scheme",
                data: {
                    name,
                    svcid,
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
                        msg: "创建方案出错",
                    });
                });
        });
    }
    changeSchemeSize(sid: number, size: Size3D): Promise<AjaxResponse<void>> {
        return new Promise((resolve) => {
            request({
                method: "PUT",
                url: "/api/v1/biz/scheme/dimension",
                data: {
                    sid,
                    ...size,
                },
            })
                .then((res) => {
                    resolve({
                        ok: true,
                        status: res.status,
                    });
                })
                .catch(() => {
                    resolve({
                        ok: false,
                        status: 500,
                        show: "error",
                        msg: "修改方案尺寸出错",
                    });
                });
        });
    }
    createNewService(eid: string | number, cid: string | number): Promise<AjaxResponse<Service>> {
        const { storeId } = store.state.user;
        return new Promise((resolve) => {
            request({
                method: "POST",
                url: "/api/v1/biz/service",
                data: {
                    cid,
                    eid,
                    orgid: storeId,
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
                        msg: "创建服务出错",
                    });
                });
        });
    }
    requestServices(cid: string | number, page: number, pageSize: number): Promise<AjaxResponse<Service[]>> {
        const { eid, storeId } = store.state.user;
        return new Promise((resolve) => {
            request({
                method: "POST",
                url: "/api/v1/biz/customer/services",
                data: {
                    cid,
                    eid,
                    orgid: storeId,
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
                        msg: "获取客户服务列表出错",
                    });
                });
        });
    }
    requestSchemes(svcid: number, page = 1, pageSize = 10): Promise<AjaxResponse<Scheme[]>> {
        return new Promise((resolve) => {
            request({
                method: "POST",
                url: "/api/v1/biz/customer/schemes",
                data: {
                    svcid,
                    page,
                    pageSize,
                },
            })
                .then((res) => {
                    resolve({
                        ok: true,
                        status: res.status,
                        data: res.data.map((item: Scheme) => {
                            item.cover = [item.pic || "https://dummyimage.com/200x300&text=TODO"];
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
    requestSchemeDetail(sid: string | number): Promise<AjaxResponse<Scheme>> {
        return new Promise((resolve) => {
            request({
                method: "GET",
                url: "/api/v1/biz/scheme/" + sid,
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
                        msg: "获取方案详情出错",
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
                    // const mat = {
                    //     id: 1,
                    //     name: "密度板",
                    //     pic: "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/material/d7b9590c-2849-469e-929d-44789d2575f0.jpg",
                    // };
                    // const color = {
                    //     id: 4,
                    //     name: "米色",
                    //     hex: "#F5F5DC",
                    //     pic: "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool//img/8C76049B8FE944D8BBAAE3825ED8A591.jpg",
                    // };
                    // const brand = {
                    //     id: 1,
                    //     name: "其他",
                    //     logo: "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool//img/8C76049B8FE944D8BBAAE3825ED8A591.jpg",
                    // };
                    resolve({
                        ok: true,
                        status: res.status,
                        data: res.data,
                        // data: {
                        //     brands: new Array(10).fill(0).map((b, index) => Object.assign({}, brand, { id: index })),
                        //     materials: new Array(10).fill(0).map((m, index) => Object.assign({}, mat, { id: index })),
                        //     colors: new Array(10).fill(0).map((c, index) => Object.assign({}, color, { id: index })),
                        // },
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
        page = 1,
        pageSize = 10,
        ptbid?: string | number,
        cid?: string | number,
        mid?: string | number,
    ): Promise<AjaxResponse<Part[]>> {
        return new Promise((resolve) => {
            request({
                method: "POST",
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

    requestBackgrounds(btype: BackgroundType, page: number, pageSize = 10): Promise<AjaxResponse<Background[]>> {
        return new Promise((resolve) => {
            request({
                method: "POST",
                url: "/api/v1/biz/backgrounds",
                data: {
                    btype,
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
                        msg: "获取背景出错",
                    });
                });
        });
    }
    requestSignedUrl(schemeId: string | number): Promise<AjaxResponse<OssSignature>> {
        return new Promise((resolve) => {
            request({
                method: "GET",
                url: `/api/v1/biz/customer/scheme/${schemeId}/signedurl`,
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
                        msg: "获取OSS签名失败",
                    });
                });
        });
    }
    updateSchemeState(schemeId: string | number): Promise<AjaxResponse<boolean>> {
        return new Promise((resolve) => {
            request({
                method: "PUT",
                url: "/api/v1/biz/customer/scheme/state",
                data: {
                    id: schemeId,
                },
            })
                .then((res) => {
                    resolve({
                        ok: true,
                        status: res.status,
                        data: true,
                    });
                })
                .catch(() => {
                    resolve({
                        ok: false,
                        status: 500,
                        show: "error",
                        msg: "更新方案保存状态失败",
                    });
                });
        });
    }
    requestScreenshotSignedUrl(schemeId: string | number): Promise<AjaxResponse<OssSignature>> {
        return new Promise((resolve) => {
            request({
                method: "GET",
                url: `/api/v1/biz/scheme/snapshot/${schemeId}/signedurl`,
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
                        msg: "获取OSS签名失败",
                    });
                });
        });
    }
    updateScreenshotState(schemeId: string | number, url: string): Promise<AjaxResponse<boolean>> {
        return new Promise((resolve) => {
            request({
                method: "PUT",
                url: "/api/v1/biz/scheme/snapshot/state",
                data: {
                    id: schemeId,
                    pic: url,
                },
            })
                .then((res) => {
                    resolve({
                        ok: true,
                        status: res.status,
                        data: true,
                    });
                })
                .catch(() => {
                    resolve({
                        ok: false,
                        status: 500,
                        show: "error",
                        msg: "更新截图状态失败",
                    });
                });
        });
    }
    requestSchemeOffer(schemeId: string | number, compositions: RequestPartId[]): Promise<AjaxResponse<SchemeOffer>> {
        return new Promise((resolve) => {
            request({
                method: "POST",
                url: `/api/v1/biz/scheme/offer`,
                data: {
                    sid: schemeId,
                    compositions,
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
                        msg: "获取方案报价失败",
                    });
                });
        });
    }
    requestSchemeManifest(schemeId: string | number): Promise<AjaxResponse<SchemeManifest>> {
        return new Promise((resolve) => {
            request({
                method: "GET",
                url: `/api/v1/biz/scheme/${schemeId}/checklist`,
            })
                .then((res) => {
                    const data = res.data || [];
                    for (const item of data) {
                        item.type = item.type === 2 ? "attachment" : "part";
                        item.count = +item.count || 0;
                    }
                    resolve({
                        ok: true,
                        status: res.status,
                        data: data,
                    });
                })
                .catch(() => {
                    resolve({
                        ok: false,
                        status: 500,
                        show: "error",
                        msg: "获取方案清单失败",
                    });
                });
        });
    }
    requestSchemeManifestV2(partIds: RequestPartId[]): Promise<AjaxResponse<SchemeManifest>> {
        return new Promise((resolve) => {
            request({
                method: "POST",
                url: `/api/v1/biz/scheme/checklist`,
                data: {
                    partIds: partIds,
                },
            })
                .then((res) => {
                    const data = res.data || [];
                    for (const item of data) {
                        switch (item.type) {
                            case 1:
                                item.type = "part";
                                break;
                            case 2:
                                item.type = "attachment";
                                break;
                            case 3:
                                item.type = "board";
                                break;

                            default:
                                break;
                        }
                        item.count = +item.count || 0;
                    }
                    resolve({
                        ok: true,
                        status: res.status,
                        data: data,
                    });
                })
                .catch(() => {
                    resolve({
                        ok: false,
                        status: 500,
                        show: "error",
                        msg: "获取方案清单失败",
                    });
                });
        });
    }
    requestVisitorRecordList(
        eid: string | number,
        pageNum: number,
        _pageSize: number,
    ): Promise<AjaxResponse<VisitorRecordItem[]>> {
        return new Promise((resolve) => {
            request({
                method: "POST",
                url: "/api/v1/misc/visitorlogs",
                data: {
                    page: pageNum,
                },
            })
                .then((res) => {
                    const data = res.data || [];
                    resolve({
                        ok: true,
                        status: res.status,
                        data: data,
                    });
                })
                .catch(() => {
                    resolve({
                        ok: false,
                        status: 500,
                        show: "error",
                        msg: "获取游客记录失败",
                    });
                });
        });
    }
    recordVisitor(eid: number | string): Promise<AjaxResponse<string>> {
        return new Promise((resolve) => {
            request({
                method: "POST",
                url: "/api/v1/misc/visitorlog",
                data: {
                    eid,
                },
            })
                .then((res) => {
                    const data = res.data || [];
                    resolve({
                        ok: true,
                        status: res.status,
                        data: data,
                    });
                })
                .catch(() => {
                    resolve({
                        ok: false,
                        status: 500,
                        show: "error",
                        msg: "添加游客记录失败",
                    });
                });
        });
    }
    updateVisitorItem(item: VisitorRecordItem): Promise<AjaxResponse<boolean>> {
        return new Promise((resolve) => {
            request({
                method: "PUT",
                url: "/api/v1/misc/visitorlog",
                data: item,
            })
                .then((res) => {
                    resolve({
                        ok: true,
                        status: res.status,
                        data: true,
                    });
                })
                .catch(() => {
                    resolve({
                        ok: false,
                        status: 500,
                        show: "error",
                        msg: "更新游客记录失败",
                    });
                });
        });
    }
    deleteVisitorItem(no: string): Promise<AjaxResponse<boolean>> {
        return new Promise((resolve) => {
            request({
                method: "DELETE",
                url: `/api/v1/misc/visitorlog/${no}`,
            })
                .then((res) => {
                    resolve({
                        ok: true,
                        status: res.status,
                        data: true,
                    });
                })
                .catch(() => {
                    resolve({
                        ok: false,
                        status: 500,
                        show: "error",
                        msg: "删除游客记录失败",
                    });
                });
        });
    }
    requestStoreList(): Promise<AjaxResponse<Store[]>> {
        return new Promise((resolve) => {
            request({
                method: "GET",
                url: "/api/v1/biz/shops",
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
                        msg: "获取门店列表失败",
                    });
                });
        });
    }
    request3DModels(): Promise<AjaxResponse<Model3DFile[]>> {
        return new Promise((resolve) => {
            request({
                method: "GET",
                url: "/api/v1/misc/models",
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
                        msg: "获取3D模型文件列表失败",
                    });
                });
        });
    }
}
