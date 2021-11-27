import { IMessage } from "element-plus/lib/el-message/src/types"; //引入类型文件
import ApiProvider from '@/store/api/interface/provider.interface';

//定义module 需要ts代码提示必须执行下方代码
declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $message: IMessage; //挂载类型
        $apiProvider: ApiProvider;
    }
}

declare module "*.svg";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.bmp";
declare module "*.tiff";
