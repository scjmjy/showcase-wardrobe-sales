import { PartCount } from "@/lib/scheme";
import { Size3D } from "../interface/common.interface";
import ApiProvider, {
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
    Scheme,
    SchemeManifest,
    SchemeOffer,
    Service,
    Store,
    VisitorRecordItem,
} from "../interface/provider.interface";

const localVisitorRecordList: VisitorRecordItem[] = [];
export default class LocalProvider implements ApiProvider {
    changeSchemeSize(sid: number, size: Size3D): Promise<AjaxResponse<void>> {
        throw new Error("Method not implemented.");
    }
    request3DModels(): Promise<AjaxResponse<Model3DFile[]>> {
        throw new Error("Method not implemented.");
    }
    updateScreenshotState(schemeId: string | number, url: string): Promise<AjaxResponse<boolean>> {
        throw new Error("Method not implemented.");
    }
    requestScreenshotSignedUrl(schemeId: string | number): Promise<AjaxResponse<OssSignature>> {
        throw new Error("Method not implemented.");
    }
    requestPartAttachments(): Promise<AjaxResponse<PartAttachmentList>> {
        throw new Error("Method not implemented.");
    }
    login(
        username: string,
        passwd: string,
        storeId: string | number,
        code?: string,
        uuid?: string,
    ): Promise<AjaxResponse<LoginResult>> {
        return Promise.resolve({
            status: 200,
            ok: true,
            data: {
                uid: 1,
                token: "fake-token-" + username + passwd + code + uuid,
                eid: 1,
                name: username,
                organization: "上海",
                rank: "经理",
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
    requestGlobalCfg(): Promise<AjaxResponse<GlobalCfg>> {
        throw new Error("Method not implemented.");
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

    // requestProductCategories(): Promise<AjaxResponse<ProductCategory[]>> {
    //     const mockFilters = (index: number) => {
    //         const filter1: CategoryFilter = {
    //             key: "调性选择" + index,
    //             title: "调性选择" + index,
    //             styles: [
    //                 {
    //                     label: "XXXX" + index + "-1",
    //                     value: "XXXX" + index + "-1",
    //                 },
    //                 {
    //                     label: "XXXX" + index + "-2",
    //                     value: "XXXX" + index + "-2",
    //                 },
    //             ],
    //         };
    //         const filter2: CategoryFilter = {
    //             key: "风格",
    //             title: "风格",
    //             styles: [
    //                 {
    //                     label: "现代",
    //                     value: "现代",
    //                 },
    //                 {
    //                     label: "新中式",
    //                     value: "新中式",
    //                 },
    //                 {
    //                     label: "日式",
    //                     value: "日式",
    //                 },
    //                 {
    //                     label: "简欧",
    //                     value: "简欧",
    //                 },
    //                 {
    //                     label: "法式",
    //                     value: "法式",
    //                 },
    //                 {
    //                     label: "北欧",
    //                     value: "北欧",
    //                 },
    //                 {
    //                     label: "传统中式",
    //                     value: "传统中式",
    //                 },
    //                 {
    //                     label: "美式",
    //                     value: "美式",
    //                 },
    //                 {
    //                     label: "欧式古典",
    //                     value: "欧式古典",
    //                 },
    //                 {
    //                     label: "Art Deco",
    //                     value: "Art Deco",
    //                 },
    //             ],
    //         };
    //         const filter3: CategoryFilter = {
    //             key: "其他",
    //             title: "其他",
    //             styles: [
    //                 {
    //                     label: "其他" + index + "-1",
    //                     value: "其他" + index + "-1",
    //                 },
    //                 {
    //                     label: "其他" + index + "-2",
    //                     value: "其他" + index + "-2",
    //                 },
    //             ],
    //         };
    //         return [filter1, filter2, filter3];
    //     };
    //     return Promise.resolve({
    //         status: 200,
    //         ok: true,
    //         data: new Array(9).fill(0).map((val, index) => {
    //             return {
    //                 id: index + "",
    //                 name: "分类-" + index,
    //                 icon: "drawing-room",
    //                 filters: mockFilters(index),
    //             };
    //         }),
    //     });
    // }

    requestProductCategories(): Promise<AjaxResponse<ProductCategory[]>> {
        const commonChildren = (index: any) => [
            {
                id: "常规尺寸" + index,
                name: "常规尺寸",
            },
            {
                id: "非常规定制" + index,
                name: "非常规定制",
            },
        ];
        return Promise.resolve({
            status: 200,
            ok: true,
            data: [
                {
                    id: "卧室/书房",
                    name: "卧室/书房",
                    children: [
                        {
                            id: "衣柜",
                            name: "衣柜",
                            children: [
                                {
                                    id: "敞开门衣柜",
                                    name: "敞开门衣柜",
                                    children: commonChildren(1),
                                },
                                {
                                    id: "开平门衣柜",
                                    name: "开平门衣柜",
                                    children: commonChildren(2),
                                },
                                {
                                    id: "衣帽间衣柜",
                                    name: "衣帽间衣柜",
                                    children: commonChildren(3),
                                },
                                {
                                    id: "书房衣柜",
                                    name: "书房衣柜",
                                    children: commonChildren(4),
                                },
                            ],
                        },
                        {
                            id: "飘窗柜",
                            name: "飘窗柜",
                        },
                        {
                            id: "书柜",
                            name: "书柜",
                        },
                    ],
                },
                {
                    id: "客厅",
                    name: "客厅",
                    children: [
                        {
                            id: "入门柜",
                            name: "入门柜",
                        },
                        {
                            id: "鞋柜",
                            name: "鞋柜",
                        },
                        {
                            id: "电视柜",
                            name: "电视柜",
                            children: [
                                {
                                    id: "XXX1",
                                    name: "XXX1",
                                },
                                {
                                    id: "XXX2",
                                    name: "XXX2",
                                },
                            ],
                        },
                        {
                            id: "阳台柜",
                            name: "阳台柜",
                        },
                    ],
                },
                {
                    id: "餐厅",
                    name: "餐厅",
                    children: [
                        {
                            id: "餐边柜",
                            name: "餐边柜",
                        },
                        {
                            id: "酒柜",
                            name: "酒柜",
                        },
                    ],
                },
            ],
        });
    }
    requestProducts(cid: string | number, page = 1, pageSize = 20): Promise<AjaxResponse<Product[]>> {
        return Promise.resolve({
            status: 200,
            ok: true,
            data: new Array(10).fill(0).map((val, index) => {
                return {
                    id: index,
                    name: cid + "-商品-" + index,
                    manifest: "manifest",
                    composition: "compostion",
                    description: "description",
                    pic: "https://picsum.photos/300/300?random=" + index + cid,
                    width: 0,
                    height: 0,
                    depth: 0,
                    depthmax: 0,
                    depthmin: 0,
                    widthmax: 0,
                    widthmin: 0,
                    heightmax: 0,
                    heightmin: 0,
                    customized: 1,
                };
            }),
        });
    }

    requestProductDetail(pid: string | number): Promise<AjaxResponse<Product>> {
        return Promise.resolve({
            status: 200,
            ok: true,
            data: {
                id: +pid,
                name: "商品-" + pid,
                manifest: "manifest",
                composition: "compostion",
                description: "description",
                pic: "https://picsum.photos/300/300?random=" + pid,
                width: 0,
                height: 0,
                depth: 0,
                depthmax: 0,
                depthmin: 0,
                widthmax: 0,
                widthmin: 0,
                heightmax: 0,
                heightmin: 0,
                customized: 1,
            },
        });
    }

    createCustomer(name: string, phone?: string): Promise<AjaxResponse<string>> {
        throw new Error("Method not implemented.");
    }
    requestCustomerList(eid: string | number, page?: number, pageSize?: number): Promise<AjaxResponse<Customer[]>> {
        throw new Error("Method not implemented.");
    }
    createNewService(eid: string | number, cid: string | number): Promise<AjaxResponse<Service>> {
        throw new Error("Method not implemented.");
    }
    requestServices(cid: string | number, page: number, pageSize: number): Promise<AjaxResponse<Service[]>> {
        throw new Error("Method not implemented.");
    }
    requestSchemes(svcid: number, page = 1, pageSize = 1): Promise<AjaxResponse<Scheme[]>> {
        const mockDate = ["2021-08-10 14:00:00", "2021-08-11 14:00:00", "2021-08-12 14:00:00"];
        const mockOffer = ["13999", "", "1500", "", "14000"];
        return Promise.resolve({
            status: 200,
            ok: true,
            data: new Array(10).fill(0).map((val, index) => {
                return {
                    id: index,
                    name: svcid + "-方案-" + index,
                    cid: svcid + "",
                    customer: "客户" + svcid,
                    product: "方案来源",
                    pid: index,
                    manifest: "manifest",
                    composition: "composition",
                    offer: mockOffer[index % mockOffer.length],
                    ptime: mockDate[index % mockDate.length],
                    pic: "",
                    cover: [
                        "https://picsum.photos/300/300?random=" + index + svcid,
                        "https://picsum.photos/300/300?random=1" + index + svcid,
                        "https://picsum.photos/300/300?random=2" + index + svcid,
                    ],
                    width: 0,
                    height: 0,
                    depth: 0,
                    pdepthmax: 0,
                    pdepthmin: 0,
                    pwidthmax: 0,
                    pwidthmin: 0,
                    pheightmax: 0,
                    pheightmin: 0,
                    customized: 1,
                };
            }),
        });
    }
    requestSchemeDetail(sid: string | number): Promise<AjaxResponse<Scheme>> {
        return Promise.resolve({
            status: 200,
            ok: true,
            data: {
                id: +sid,
                name: "方案-" + sid,
                cid: 2 + "",
                customer: "customer",
                product: "方案来源",
                pid: 1,
                manifest: "manifest",
                composition: "composition",
                offer: +sid % 2 === 0 ? "10000" : "0",
                ptime: Date.now() + "",
                pic: "",
                cover: [
                    "https://picsum.photos/300/300?random=" + sid,
                    "https://picsum.photos/300/300?random=1" + sid,
                    "https://picsum.photos/300/300?random=2" + sid,
                ],
                width: 0,
                height: 0,
                depth: 0,
                pdepthmax: 0,
                pdepthmin: 0,
                pwidthmax: 0,
                pwidthmin: 0,
                pheightmax: 0,
                pheightmin: 0,
                customized: 1,
            },
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
        throw new Error("Method not implemented.");
    }
    requestPartCategories(): Promise<AjaxResponse<PartCategory[]>> {
        throw new Error("Method not implemented.");
    }
    requestPartCatMeta(cid: string | number): Promise<AjaxResponse<PartCategoryMeta>> {
        throw new Error("Method not implemented.");
    }
    requestParts(
        ptcid: string | number,
        page: number,
        pageSize: number,
        ptbid?: string | number,
        cid?: string | number,
        mid?: string | number,
    ): Promise<AjaxResponse<Part[]>> {
        throw new Error("Method not implemented.");
    }
    requestBackgrounds(btype: BackgroundType, page: number, pageSize: number): Promise<AjaxResponse<Background[]>> {
        throw new Error("Method not implemented.");
    }
    requestSignedUrl(schemeId: string | number): Promise<AjaxResponse<OssSignature>> {
        throw new Error("Method not implemented.");
    }
    updateSchemeState(schemeId: string | number): Promise<AjaxResponse<boolean>> {
        throw new Error("Method not implemented.");
    }
    requestSchemeOffer(schemeId: string | number, compositions: Array<PartCount>): Promise<AjaxResponse<SchemeOffer>> {
        throw new Error("Method not implemented.");
    }
    requestSchemeManifest(schemeId: string | number): Promise<AjaxResponse<SchemeManifest>> {
        throw new Error("Method not implemented.");
    }
    requestSchemeManifestV2(partIds: number[]): Promise<AjaxResponse<SchemeManifest>> {
        throw new Error("Method not implemented.");
    }
    requestVisitorRecordList(
        eid: string | number,
        pageNum: number,
        pageSize: number,
    ): Promise<AjaxResponse<VisitorRecordItem[]>> {
        const start = (pageNum - 1) * pageSize;
        const end = start + pageSize;
        return Promise.resolve({
            ok: true,
            status: 200,
            data: localVisitorRecordList.slice(start, end),
            // data: new Array(10).fill(0).map((val) => ({
            //     id: val,
            //     etime: new Date().toLocaleString(),
            //     ltime: new Date().toLocaleString(),
            //     customerName: "~~~",
            // })),
        });
    }
    recordVisitor(eid: number | string): Promise<AjaxResponse<string>> {
        const no = Date.now() + "";
        const record: VisitorRecordItem = {
            no,
            customerName: eid + "",
            _date: "",
        };
        localVisitorRecordList.push(record);
        return Promise.resolve({
            ok: true,
            status: 200,
            data: no,
        });
    }
    updateVisitorItem(item: VisitorRecordItem): Promise<AjaxResponse<boolean>> {
        const found = localVisitorRecordList.find((item) => item.no === item.no);
        if (found) {
            found.etime = item.etime;
            found.ltime = item.ltime;
        }
        return Promise.resolve({
            ok: true,
            status: 200,
            data: true,
        });
    }
    deleteVisitorItem(no: string): Promise<AjaxResponse<boolean>> {
        const foundIndex = localVisitorRecordList.findIndex((item) => item.no === no);
        if (foundIndex !== -1) {
            localVisitorRecordList.splice(foundIndex, 1);
        }
        return Promise.resolve({
            ok: true,
            status: 200,
            data: true,
        });
    }
    requestStoreList(): Promise<AjaxResponse<Store[]>> {
        return Promise.resolve({
            ok: true,
            status: 200,
            data: new Array(10).fill(0).map((val, index) => ({
                id: index,
                name: "门店-" + index,
            })),
        });
    }
}
