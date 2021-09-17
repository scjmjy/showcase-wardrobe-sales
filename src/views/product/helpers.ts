import { ElMessage, ElLoading, ILoadingInstance } from "element-plus";

let loading: ILoadingInstance | undefined = undefined;
export function showSchemeSaveLoading() {
    if (!loading) {
        loading = ElLoading.service({
            fullscreen: true,
            body: true,
            text: "方案保存中，请稍后......",
            spinner: "el-icon-loading",
        });
    }
}

export function hideSchemeSaveLoading() {
    if (loading) {
        loading.close();
        loading = undefined;
    }
}
