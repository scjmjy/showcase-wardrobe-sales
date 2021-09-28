// import { AjaxResponse } from "@/api/interface/provider.interface";

// export type PageRequestApi<T> = (pageNum: number, pageSize: number, ...args: any[]) => Promise<AjaxResponse<T>>;

// export default class PageController<T> {
//     lastRequestPage = 0;
//     pageNum = 0; // current page number
//     totalPages = 0;
//     totalSize = 0;

//     hasPreviousPage = false;
//     hasNextPage = false;

//     constructor(public api: PageRequestApi<T>, public pageSize = 10) {
//         this.api = api;
//     }

//     fetch(pageNum: number) {
//         if (!this.api) {
//             return Promise.reject();
//         }
//         return this.api(pageNum, this.pageSize);
//     }

//     gotoPage(page) {
//         this.lastRequestPage = page;
//         return new Promise((resolve, reject) => {
//             this.fetch(page)
//                 .then((res) => {
//                     const data = res.data;
//                     let conflict = false;
//                     if (data.pageNum !== this.lastRequestPage) {
//                         // 说明在请求第data.pageNum页的数据之后，又请求了第this.pageCache页的数据
//                         conflict = true;
//                     } else {
//                         this.page = data.pageNum;
//                         this.pageSize = data.pageSize;
//                         this.size = data.size;
//                         this.pages = data.pages;
//                         this.hasPreviousPage = data.hasPreviousPage;
//                         this.hasNextPage = data.hasNextPage;
//                         this.total = data.total;
//                     }
//                     resolve({ conflict, page: data.pageNum, list: data.list });
//                 })
//                 .catch((err) => {
//                     reject(err);
//                 });
//         });
//     }

//     resize(size) {
//         this.pageSize = size;
//         return this.gotoPage(1);
//     }

//     prePage() {
//         if (this.hasPreviousPage) {
//             return this.gotoPage(this.page - 1);
//         } else {
//             return false;
//         }
//     }

//     nextPage() {
//         if (this.hasNextPage) {
//             return this.gotoPage(this.page + 1);
//         } else {
//             return false;
//         }
//     }

//     refresh() {
//         return this.gotoPage(this.page);
//     }

//     // order: DESC | ASC
//     sort(sortName, order) {
//         if (order !== "DESC" && order !== "ASC") {
//             throw new Error("排序顺序参数错误");
//         }
//         this.sortName = sortName;
//         this.sortOrder = order;
//         return this;
//     }

//     clearSort() {
//         this.sortName = "";
//         this.sortOrder = "";
//         return this;
//     }

//     addFilter(key, value) {
//         this.filter[key] = value;
//         return this;
//     }

//     clearFilter(key) {
//         delete this.filter[key];
//         return this;
//     }

//     addAllFilters(filters) {
//         this.filter = filters;
//         return this;
//     }
//     clearAllFilters() {
//         this.filter = {};
//         return this;
//     }
// }
