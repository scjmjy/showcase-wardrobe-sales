import { IMessage } from "element-plus/lib/el-message/src/types"; //引入类型文件

//定义module 需要ts代码提示必须执行下方代码
declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $message: IMessage; //挂载类型
    }
}
