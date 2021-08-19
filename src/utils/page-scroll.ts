import { nextTick, Ref } from "vue";
import { AjaxResponse } from "@/api/interface/provider.interface";

export type LOAD_STATE = "loading" | "more" | "nomore" | "error" | "";

export type RequestApi<T> = (page: number, pageSize: number) => Promise<AjaxResponse<T[]>>;
export type BeforeDataHandler<T> = (data: T[]) => T[];
export type AfterDataHandler = (currentPage: number) => void;

export type OnReachBottom = () => void;

const OFFSET = 40;

export function checkReachBottom(el: HTMLElement, onReachBottom: OnReachBottom) {
    const { scrollTop, clientHeight, scrollHeight } = el;
    if (clientHeight === 0 && scrollHeight === 0) {
        return;
    }
    console.log("clientHeight", scrollTop, clientHeight, scrollHeight);

    const reachBottom = scrollTop + clientHeight + OFFSET >= scrollHeight;
    if (reachBottom) {
        onReachBottom();
    }
}

export default class PageScroll<T> {
    // constructor(public el: HTMLElement, private onReachBottom: OnReachBottom) {
    //     checkReachBottom(el, onReachBottom);
    //     el.addEventListener("scroll", (e: Event) => {
    //         checkReachBottom(e.currentTarget as HTMLElement, onReachBottom);
    //     });
    // }
    currentPage = 0;
    nextRequestPage = 1;
    constructor(
        public el: HTMLElement,
        public requestApi: RequestApi<T>,
        public loadState: Ref<LOAD_STATE>,
        public dataArray: Ref<T[]>,
        public beforeDataHandler?: BeforeDataHandler<T>,
        public afterDataHandler?: AfterDataHandler,
        public pageSize = 10,
        public reachBottomOffset = 40,
    ) {}
    requestPage() {
        // nomore 说明 currentPage 还没有满足 pageSize 个数据，所以不用 + 1
        this.loadState.value = "loading";
        this.requestApi(this.nextRequestPage, this.pageSize).then((res) => {
            if (res.ok) {
                let result = res.data || [];
                /*if (result.length === 0) {
                    // 说明 nextRequestPage 有 0 个数据，所以是 nomore
                    this.currentPage = nextRequestPage;
                    this.loadState.value = "nomore";
                } else */ if (result.length < this.pageSize) {
                    // 说明 nextRequestPage 不足 pageSize 个数据，所以也是 nomore, nextRequestPage 不用 + 1
                    this.currentPage = this.nextRequestPage;
                    this.loadState.value = "nomore";
                } else if (result.length === this.pageSize) {
                    this.currentPage = this.nextRequestPage;
                    this.loadState.value = "more";
                    // 说明 nextRequestPage 正好是 pageSize 个数据，所以 nextRequestPage + 1 可能还有数据
                    this.nextRequestPage++;
                }
                if (this.beforeDataHandler) {
                    result = this.beforeDataHandler(result);
                }
                if (result.length) {
                    this.dataArray.value.splice((this.currentPage - 1) * this.pageSize, this.pageSize, ...result);
                }
                this.afterDataHandler && this.afterDataHandler(this.currentPage);
                nextTick(() => {
                    this.onScroll();
                });
            } else {
                this.loadState.value = "error";
            }
        });
    }
    reload() {
        this.currentPage = 0;
        this.nextRequestPage = 1;
        this.dataArray.value.length = 0;
        this.loadState.value = "";
        this.requestPage();
    }
    reloadCurrentPage() {
        if (this.loadState.value !== "loading") {
            this.loadState.value = "more";
            this.onScroll();
        }
    }
    onScroll() {
        checkReachBottom(this.el, () => {
            if (this.loadState.value !== "nomore" && this.loadState.value !== "loading") {
                this.requestPage();
            }
        });
    }
}
