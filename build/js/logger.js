"use strict";
/*************************************
 * ログモジュール
 *************************************/
Object.defineProperty(exports, "__esModule", { value: true });
const log4js = require("log4js");
const configModule = require("config");
const config = configModule.util.toObject(configModule);
log4js.configure(config.log4js);
exports.default = {
    system: log4js.getLogger('system'),
    access: log4js.getLogger('access'),
    console: log4js.getLogger('console')
};
//# sourceMappingURL=logger.js.map