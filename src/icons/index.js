import Vue from "vue";
import SvgIcon from "@/components/icon/svgIcon.vue";

// 导入并全局注册SvgIcon组件 - 使得可以在任何Vue组件中使用<svg-icon>标签
// 批量导入SVG文件 - 通过require.context自动加载./svg目录下所有.svg文件
// 注册所有SVG图标 - 将导入的SVG文件注册为Vue组件，实现SVG图标的自动加载和全局可用

Vue.component("svg-icon", SvgIcon)

const req = require.context("./svg", false, /\.svg$/);
const requireAll = requireContext => requireContext.keys().map(requireContext);
requireAll(req);