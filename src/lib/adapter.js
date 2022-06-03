"use strict";
exports.__esModule = true;
exports.transform = void 0;
function transform(gedcom) {
    var recordLimit = 9999999999;
    var gedcomJson = JSON.stringify(gedcom);
    // console.log(gedcomJson);
    var gedcomObject = JSON.parse(gedcomJson);
    var recordsByType = {};
    if (gedcomObject.type === 'root') {
        var rootnodes = gedcomObject === null || gedcomObject === void 0 ? void 0 : gedcomObject.children;
        rootnodes.forEach(function (item, index) {
            var _a, _b;
            if (index <= recordLimit) {
                console.log("[".concat(index, "] type: ").concat(item.type));
                console.log("\t formal_name: ".concat((_a = item === null || item === void 0 ? void 0 : item.data) === null || _a === void 0 ? void 0 : _a.formal_name));
                console.log("\t xref_id: ".concat((_b = item === null || item === void 0 ? void 0 : item.data) === null || _b === void 0 ? void 0 : _b.xref_id));
                if (strategy[item === null || item === void 0 ? void 0 : item.type]) {
                    console.log("type ".concat(item.type, " supported."));
                    var fn = strategy[item.type];
                    fn(item);
                }
                else {
                    console.log("type ".concat(item.type, " not supported."));
                }
                if (recordsByType[item.type] > 0) {
                    console.log("later recordsByType[item.type] ++");
                    recordsByType[item.type] = recordsByType[item.type] + 1;
                }
                else {
                    console.log("first recordsByType[item.type] = 1");
                    recordsByType[item.type] = 1;
                }
            }
        });
    }
    console.log(recordsByType);
}
exports.transform = transform;
var strategy = {
    'HEAD': function (item) { return header(item); },
    'INDI': function (item) { return individual(item); },
    'FAM': function (item) { return family(item); },
    'REPO': function (item) { return repository(item); },
    'SOUR': function (item) { return source(item); },
    'TRLR': function (item) { return trailer(item); }
};
function header(item) {
    console.log("header()");
}
function individual(item) {
    console.log("individual()");
}
function family(item) {
    console.log("family()");
}
function repository(item) {
    console.log("repository()");
}
function source(item) {
    console.log("source()");
}
function trailer(item) {
    console.log("trailer()");
}
