const {defineConfig} = require("@vue/cli-service");

const path = require("path");

function resolve(dir) {
    return path.join(__dirname, dir);
}

const name = process.env.VUE_APP_TITLE || "redPacket";
module.exports = defineConfig({
    transpileDependencies: true,
    lintOnSave: false,
    configureWebpack: {
        devtool: 'source-map',
        name: name,
        resolve: {
            alias: {
                "@": resolve("src"),
            }
        },
    },
});
