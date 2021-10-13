import { PartCount } from "@/lib/scheme";
import { LabelValue } from "./common.interfact";

// import { LabelValue } from "./common.interface";
export interface AjaxResponse<T> {
    status: number; // HTTP status code
    ok: boolean; // 此次请求的结果是 success 还是 error
    data?: T; // 服务器返回的实际数据
    msg?: string; // 要显示的信息
    show?: "warning" | "error" | "success" | "info" | false; // 显示的方式
}

export interface LoginResult {
    uid: number;
    eid: number;
    token: string;
    name: string;
    organization: string;
    rank: string;
    accountName?: string;
    storeId?: number;
}
// export interface CaptchaResult {
//     uuid: number;
//     img: string;
// }
export interface Service {
    id: number;
    no: string;
    ctime: string;
}
export interface Product {
    id: string;
    name: string;
    manifest: string;
    compostion: string;
    description: string;
    pic: string;
    depth: number;
    width: number;
    height: number;
    depthmax: number;
    depthmin: number;
    widthmax: number;
    widthmin: number;
    heightmax: number;
    heightmin: number;
}

// export interface Category {
//     id: string | number;
//     name: string;
//     icon: string;
// }

export interface CategoryFilter {
    key: string;
    title: string;
    styles: LabelValue[];
}

export interface FilterResults {
    cid: string;
    filters: string[][];
}

// export interface ProductCategory extends Category {
//     filters: CategoryFilter[];
// }

export interface ProductCategory {
    id: string | number;
    name: string;
    pic?: string;
    leaf?: boolean;
    children?: ProductCategory[];
}

function findDefaultActive(cat: ProductCategory): string {
    if (!cat.children || cat.children.length === 0) {
        return cat.id.toString();
    } else {
        const cat1 = cat.children[0];
        return findDefaultActive(cat1);
    }
}

export function findDefaultActiveProdCat(cats: ProductCategory[]): string {
    if (cats.length === 0) {
        return "";
    }
    const cat = cats[0];
    return findDefaultActive(cat);
}

export interface Customer {
    cid: string;
    name: string;
    phone?: string;
}

export interface Scheme {
    id: number | string;
    name: string;
    cid: string;
    customer: string;
    product: string;
    pid: number;
    manifest: string;
    composition: string;
    offer: string;
    ptime: string;
    pic?: string;
    cover: string[];
    depth: number;
    width: number;
    height: number;
    pdepthmax: number;
    pdepthmin: number;
    pwidthmax: number;
    pwidthmin: number;
    pheightmax: number;
    pheightmin: number;
}
export function isProduct(p: any): p is Product {
    // 没有 product id，说明商品
    return p.pid === undefined;
}
export interface CreateSchemeResult {
    id: number | string;
}

export interface PartCategory {
    id: string | number;
    name: string;
    pic?: string;
    leaf?: boolean;
    children?: PartCategory[];
    btype?: BackgroundType;
}

/**
 * find siblings for catId
 * @param catId category id
 * @param cat category
 * @param siblings siblings of cate
 * @returns siblings of catId
 */
function findSiblingCats_(
    catId: string | number,
    cat: PartCategory,
    siblings: PartCategory[],
): PartCategory[] | undefined {
    if (cat.id.toString() === catId.toString()) {
        return siblings;
    } else if (cat.children) {
        for (const c of cat.children) {
            const s = findSiblingCats_(catId, c, cat.children);
            if (s) {
                return s;
            }
        }
    }
}

export function findSiblingCats(catId: string | number, cats: PartCategory[]): PartCategory[] | undefined {
    for (const cat of cats) {
        const siblings = findSiblingCats_(catId, cat, cats);
        if (siblings) {
            return siblings;
        }
    }
}

export interface MetaColor {
    id: string | number;
    name: string;
    hex: string;
    pic: string;
}
export interface MetaMaterial {
    id: string | number;
    name: string;
    pic: string;
}
export interface MetaBrand {
    id: string | number;
    name: string;
    logo: string;
}
export interface PartCategoryMeta {
    colors: MetaColor[];
    materials: MetaMaterial[];
    brands: MetaBrand[];
}
export interface Part {
    id: string | number;
    name: string;
    depth: number;
    width: number;
    height: number;
    manifest: string;
    pic: string;
    price: string;
    unit: string;
    mutime?: string;
}

export type PartIdList = (string | number)[];

export interface GlobalCfg {
    // 内饰配件ID列表
    partsCatInterior: PartIdList;
    // 外观配件ID列表
    partsCatExterior: PartIdList;
    baseUrl: string;
}

export enum BackgroundType {
    WALL = 1,
    FLOOR = 2,
}

export interface Background {
    name: string;
    id: string;
    pic: string;
}

export interface OssSignature {
    accessid: string;
    policy: string;
    signature: string;
    host: string;
    dir: string;
    filename: string;
}

export interface PartOffer {
    pname: string;
    count: string;
    price: string;
    pic: string;
}

export interface SchemeOffer {
    offer: string;
    ptime: string;
    details: PartOffer[];
    price: string; // 单价（元/㎡）
    area: string; // 投影面积（㎡）
    taxreate: string; // 税率
    otype: number; // 报价方式（1：按配件；2：按投影面积）
}

export interface ManifestPart {
    pname: string;
    count: number;
    pic: string;
    partid: number;
    type: "3d" | "2d"; // 配件类型（1 for 3d; 2 for 2d）
}

export type SchemeManifest = ManifestPart[];

export interface VisitorRecordItem {
    no: string;
    customerName: string;
    etime?: string;
    ltime?: string;
}

export interface PartAttachment {
    apcmid: number; // part id
    count: number; // part count
}
export interface PartAttachmentItem {
    partCmId: number;
    attachmentsList: PartAttachment[];
}

export type PartAttachmentList = PartAttachmentItem[];

export interface Store {
    id: number;
    name: string;
}

export interface Model3DFile {
    name: string; // 文件名
    url: string; // 文件链接
    utime: string; // 文件修改时间
}

export default interface ApiProvider {
    /**
     * 登录接口
     * @param username 用户名
     * @param passwd 密码
     * @param code 验证码
     * @param uuid 图片验证服务返回给前端的uuid，再次传给服务器
     */
    login(
        username: string,
        passwd: string,
        storeId: string | number,
        code?: string,
        uuid?: string,
    ): Promise<AjaxResponse<LoginResult>>;
    logout(): Promise<AjaxResponse<string>>;

    requestGlobalCfg(): Promise<AjaxResponse<GlobalCfg>>;
    requestPartAttachments(): Promise<AjaxResponse<PartAttachmentList>>;

    // getCaptchaImage(): Promise<AjaxResponse<CaptchaResult>>;

    // requestGlobalConfig(): Promise<AjaxResponse<ConfigResult>>;

    requestProductCategories(): Promise<AjaxResponse<ProductCategory[]>>;
    /**
     * 获取某个商品分类下的商品列表，分页
     * @param cid 商品分类 id
     */
    requestProducts(cid: string | number, page: number, pageSize: number): Promise<AjaxResponse<Product[]>>;

    requestProductDetail(pid: string | number): Promise<AjaxResponse<Product>>;

    /**
     * 创建一个客户
     * @param name 用户名
     * @param phone 用户手机
     * @returns 用户id
     */
    createCustomer(name: string, phone?: string): Promise<AjaxResponse<string>>;

    requestCustomerList(eid: string | number, page: number, pageSize: number): Promise<AjaxResponse<Customer[]>>;

    createNewService(eid: string | number, cid: string | number): Promise<AjaxResponse<Service>>;
    /**
     * 获取某客户的方案列表
     * @param cid 客户 id
     */
    requestServices(cid: string | number, page: number, pageSize: number): Promise<AjaxResponse<Service[]>>;

    /**
     * 获取某客户的方案列表
     * @param svcid 服务 id
     */
    requestSchemes(svcid: number, page: number, pageSize: number): Promise<AjaxResponse<Scheme[]>>;

    requestSchemeDetail(sid: string | number): Promise<AjaxResponse<Scheme>>;

    createNewScheme(
        name: string,
        svcid: number | undefined,
        eid: string | number,
        cid: string | number,
        pid?: string | number,
        sid?: string | number,
    ): Promise<AjaxResponse<CreateSchemeResult>>;

    requestPartCategories(): Promise<AjaxResponse<PartCategory[]>>;
    /**
     * @param cid 分类 id
     */
    requestPartCatMeta(cid: string | number): Promise<AjaxResponse<PartCategoryMeta>>;
    /**
     *
     * @param ptcid 配件分类 id
     * @param ptbid 配件品牌 id
     * @param cid 颜色 id
     * @param mid 材质 id
     * @param page
     * @param pageSize
     */
    requestParts(
        ptcid: string | number,
        page: number,
        pageSize: number,
        ptbid: string | number,
        cid: string | number,
        mid: string | number,
    ): Promise<AjaxResponse<Part[]>>;

    requestBackgrounds(btype: BackgroundType, page: number, pageSize: number): Promise<AjaxResponse<Background[]>>;

    requestSignedUrl(schemeId: number | string): Promise<AjaxResponse<OssSignature>>;
    updateSchemeState(schemeId: string | number): Promise<AjaxResponse<boolean>>;
    requestScreenshotSignedUrl(schemeId: number | string): Promise<AjaxResponse<OssSignature>>;
    updateScreenshotState(schemeId: string | number, url: string): Promise<AjaxResponse<boolean>>;

    requestSchemeOffer(schemeId: number | string, compositions: Array<PartCount>): Promise<AjaxResponse<SchemeOffer>>;
    requestSchemeManifest(schemeId: number | string): Promise<AjaxResponse<SchemeManifest>>;
    requestSchemeManifestV2(partIds: number[]): Promise<AjaxResponse<SchemeManifest>>;

    requestVisitorRecordList(
        eid: number | string,
        pageNum: number,
        pageSize: number,
    ): Promise<AjaxResponse<VisitorRecordItem[]>>;
    recordVisitor(eid: number | string): Promise<AjaxResponse<string>>;
    updateVisitorItem(item: VisitorRecordItem): Promise<AjaxResponse<boolean>>;
    deleteVisitorItem(no: string): Promise<AjaxResponse<boolean>>;

    requestStoreList(): Promise<AjaxResponse<Store[]>>;
    request3DModels(): Promise<AjaxResponse<Model3DFile[]>>;
}
