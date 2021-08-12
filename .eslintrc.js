module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        "plugin:vue/vue3-essential",
        "eslint:recommended",
        "@vue/typescript/recommended",
        "@vue/prettier",
        "@vue/prettier/@typescript-eslint",
    ],
    parserOptions: {
        ecmaVersion: 2020,
    },
    globals: {
        BABYLON: true,
    },
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        "@typescript-eslint/no-explicit-any": ["off"], // 关闭any类型时的警告
        '@typescript-eslint/no-empty-function': ['off'], // 关闭空函数警告
        '@typescript-eslint/explicit-module-boundary-types': ['off'], // Argument should be typed with a non-any type
    },
};
