"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EStop = exports.OperatingMode = exports.InfoLevel = exports.ErrorLevel = exports.ActionStatus = exports.OrientationType = exports.BlockingType = exports.ConnectionState = void 0;
var ConnectionState;
(function (ConnectionState) {
    ConnectionState["Connectionbroken"] = "CONNECTIONBROKEN";
    ConnectionState["Offline"] = "OFFLINE";
    ConnectionState["Online"] = "ONLINE";
})(ConnectionState = exports.ConnectionState || (exports.ConnectionState = {}));
var BlockingType;
(function (BlockingType) {
    BlockingType["Hard"] = "HARD";
    BlockingType["None"] = "NONE";
    BlockingType["Soft"] = "SOFT";
})(BlockingType = exports.BlockingType || (exports.BlockingType = {}));
var OrientationType;
(function (OrientationType) {
    OrientationType["Global"] = "GLOBAL";
    OrientationType["Tangential"] = "TANGENTIAL";
})(OrientationType = exports.OrientationType || (exports.OrientationType = {}));
var ActionStatus;
(function (ActionStatus) {
    ActionStatus["Failed"] = "FAILED";
    ActionStatus["Finished"] = "FINISHED";
    ActionStatus["Initializing"] = "INITIALIZING";
    ActionStatus["Paused"] = "PAUSED";
    ActionStatus["Running"] = "RUNNING";
    ActionStatus["Waiting"] = "WAITING";
})(ActionStatus = exports.ActionStatus || (exports.ActionStatus = {}));
var ErrorLevel;
(function (ErrorLevel) {
    ErrorLevel["Fatal"] = "FATAL";
    ErrorLevel["Warning"] = "WARNING";
})(ErrorLevel = exports.ErrorLevel || (exports.ErrorLevel = {}));
var InfoLevel;
(function (InfoLevel) {
    InfoLevel["Debug"] = "DEBUG";
    InfoLevel["Info"] = "INFO";
})(InfoLevel = exports.InfoLevel || (exports.InfoLevel = {}));
var OperatingMode;
(function (OperatingMode) {
    OperatingMode["Automatic"] = "AUTOMATIC";
    OperatingMode["Manual"] = "MANUAL";
    OperatingMode["Semiautomatic"] = "SEMIAUTOMATIC";
    OperatingMode["Service"] = "SERVICE";
    OperatingMode["Teachin"] = "TEACHIN";
})(OperatingMode = exports.OperatingMode || (exports.OperatingMode = {}));
var EStop;
(function (EStop) {
    EStop["Autoack"] = "AUTOACK";
    EStop["Manual"] = "MANUAL";
    EStop["None"] = "NONE";
    EStop["Remote"] = "REMOTE";
})(EStop = exports.EStop || (exports.EStop = {}));
