"use strict";

var bbm = require("../../oe-blue-button-meta");
var uuid = require('uuid');

var condition = require("./condition");
var leafLevel = require("./leafLevel");
var translate = require("./translate");
var contentModifier = require("./contentModifier");

var templateCodes = bbm.CCDA.sections_entries_codes.codes;

var key = contentModifier.key;
var required = contentModifier.required;

var moment = require('moment');

exports.templateId = function (id) {
    return {
        key: "templateId",
        attributes: {
            "root": id
        }
    };
};

exports.templateIdExt = function (id, ext) {
    return {
        key: "templateId",
        attributes: {
            "root": id,
            "extension": ext
        }
    };
};
var templateId = function (id) {
    return {
        key: "templateId",
        attributes: {
            "root": id
        }
    };
};
exports.templateCode = function (name) {
    var raw = templateCodes[name];
    var result = {
        key: "code",
        attributes: {
            code: raw.code,
            displayName: raw.name,
            codeSystem: raw.code_system,
            codeSystemName: raw.code_system_name
        }
    };
    return result;
};

exports.templateTitle = function (name) {
    var raw = templateCodes[name];
    var result = {
        key: "title",
        text: raw.name,
    };
    return result;
};

var id = exports.id = {
    key: "id",
    attributes: {
        root: leafLevel.inputProperty("identifier"),
        extension: leafLevel.inputProperty("extension")
    },
    dataKey: 'identifiers',
    existsWhen: condition.keyExists('identifier'),
    required: true
};

exports.uniqueId = {
    key: "id",
    attributes: {
        root: function (input, context) {
            return context.rootId;
        },
        extension: function () {
            return uuid.v4();
        }
    },
    existsWhen: function (input, context) {
        return context.rootId;
    }
};

exports.statusCodeCompleted = {
    key: "statusCode",
    attributes: {
        code: 'completed'
    }
};

exports.statusCodeActive = {
    key: "statusCode",
    attributes: {
        code: 'active'
    }
};

exports.statusCodeNew = {
    key: "statusCode",
    attributes: {
        code: 'new'
    }
};

var effectiveDocumentTime = exports.effectiveDocumentTime = {
    key: "effectiveTime",
    attributes: {
        "value": leafLevel.inputProperty("date"),
    },
    dataKey: 'meta.ccda_header.date_time'
};

var effectiveTimeNow = exports.effectiveTimeNow = {
    key: "effectiveTime",
    attributes: {
        "value": moment().format("YYYYMMDDHHMMSS"),
    }
};

var timeNow = exports.timeNow = {
    key: "time",
    attributes: {
        "value": moment().format("YYYYMMDD"),
    }
};

var effectiveTime = exports.effectiveTime = {
    key: "effectiveTime",
    attributes: {
        "value": leafLevel.time,
    },
    attributeKey: 'point',
    content: [{
        key: "low",
        attributes: {
            "value": leafLevel.time
        },
        dataKey: 'low',
    }, {
        key: "high",
        attributes: {
            "value": leafLevel.time
        },
        dataKey: 'high',
    }, {
        key: "center",
        attributes: {
            "value": leafLevel.time
        },
        dataKey: 'center',
    }],
    dataKey: 'date_time',
    existsWhen: condition.eitherKeyExists('point', 'low', 'high', 'center')
};

var effectiveTimeIVL_TS = exports.effectiveTimeIVL_TS = {
    key: "effectiveTime",
    attributes: {
        "xsi:type": "IVL_TS"
    },
    //attributeKey: 'point',
    content: [{
        key: "low",
        attributes: {
            "value": leafLevel.time
        },
        dataKey: 'low',
    }, {
        key: "high",
        attributes: {
            "value": leafLevel.time
        },
        dataKey: 'high',
    }, {
        key: "center",
        attributes: {
            "value": leafLevel.time
        },
        dataKey: 'center',
    }],
    dataKey: 'date_time',
    existsWhen: condition.eitherKeyExists('point', 'low', 'high', 'center')
};

exports.text = function (referenceMethod) {
    return {
        key: "text",
        text: leafLevel.inputProperty("free_text"),
        content: {
            key: "reference",
            attributes: {
                "value": referenceMethod
            },
        }
    };
};

exports.nullFlavor = function (name) {
    return {
        key: name,
        attributes: {
            nullFlavor: "UNK"
        }
    };
};

var usRealmAddress = exports.usRealmAddress = {
    key: "addr",
    attributes: {
        use: leafLevel.use("use")
    },
    content: [{
        key: "country",
        text: leafLevel.inputProperty("country")
    }, {
        key: "state",
        text: leafLevel.inputProperty("state")
    }, {
        key: "city",
        text: leafLevel.inputProperty("city")
    }, {
        key: "postalCode",
        text: leafLevel.inputProperty("zip")
    }, {
        key: "streetAddressLine",
        text: leafLevel.input,
        dataKey: "street_lines"
    }],
    dataKey: "address"
};

var usRealmName = exports.usRealmName = {
    key: "name",
    content: [{
        key: "family",
        text: leafLevel.inputProperty("family")
    }, {
        key: "given",
        text: leafLevel.input,
        dataKey: "given"
    }, {
        key: "prefix",
        text: leafLevel.inputProperty("prefix")
    }, {
        key: "suffix",
        text: leafLevel.inputProperty("suffix")
    }],
    dataKey: "name",
    dataTransform: translate.name
};

var telecom = exports.telecom = {
    key: "telecom",
    attributes: {
        value: leafLevel.inputProperty("value"),
        use: leafLevel.inputProperty("use")
    },
    dataTransform: translate.telecom
};

var representedOrganization = {
    key: "representedOrganization",
    content: [
        id, {
            key: "id",
            attributes: {
                extension: leafLevel.inputProperty("extension"),
                root: leafLevel.inputProperty("root")
            },
            dataKey: "identity"
        }, {
            key: "name",
            text: leafLevel.input,
            dataKey: "name"
        },
        usRealmAddress,
        telecom, {
            key: "telecom",
            attributes: [{
                use: "WP",
                value: function (input) {
                    return input.value.number;
                }
            }],
            existsWhen: condition.keyExists("value"),
            dataKey: "phone"
        }
    ],
    dataKey: "organization"
};

var linkedRepresentedOrganization = {
    key: "representedOrganization",
    content: [
        {
            key: "id",
            attributes: {
                root: leafLevel.inputProperty("root")
            },
            dataKey: "identity"
        }, {
            key: "name",
            text: leafLevel.input,
            dataKey: "name"
        }
    ],
    dataKey: "organization"
};

var assignedEntity = exports.assignedEntity = {
    key: "assignedEntity",
    content: [id, {
        key: "code",
        attributes: leafLevel.code,
        dataKey: "code"
    },

        usRealmAddress,
        telecom, {
            key: "assignedPerson",
            content: usRealmName,
            existsWhen: condition.keyExists("name")
        },
        representedOrganization
    ],
    existsWhen: condition.eitherKeyExists("address", "identifiers", "organization", "name")
};

exports.author = {
    key: "author",
    content: [
        [effectiveTime, required, key("time")], {
            key: "assignedAuthor",
            content: [
                id, {
                    key: "assignedPerson",
                    content: usRealmName
                },
                representedOrganization
            ]
        }
    ],
    dataKey: "author"
};

exports.performer = {
    key: "performer",
    content: [
        [assignedEntity, required]
    ],
    dataKey: "performer"
};

exports.actAuthor = {
    key: "author",
    content: [
        templateId("2.16.840.1.113883.10.20.22.4.119"),
        [effectiveTime, required], {
            key: "assignedAuthor",
            content: [
                id, {
                    key: "assignedPerson",
                    content: usRealmName
                },
                linkedRepresentedOrganization
            ]
        }
    ],
    dataKey: "author"
};
