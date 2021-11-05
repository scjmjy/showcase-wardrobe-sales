import { App } from "vue";
import SvgIcon from "@/components/SvgIcon/index.vue"; // svg component

const req = require.context("./svg", false, /\.svg$/);
const requireAll = (requireContext: typeof req) => requireContext.keys().map(requireContext);
requireAll(req);

export default function install(app: App): void {
    app.component("svg-icon", SvgIcon);
}
