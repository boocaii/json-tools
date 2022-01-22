import { BigNumber } from "bignumber.js";

var LOGGING_LEVEL_ERROR = 1,
    LOGGING_LEVEL_WARN = 2,
    LOGGING_LEVEL_INFO = 3,
    LOGGING_LEVEL_DEBUG = 4

var LOGGING_LEVEL = LOGGING_LEVEL_DEBUG


function debug(...args) {
    if (LOGGING_LEVEL >= LOGGING_LEVEL_DEBUG) {
        console.log('[DEBUG]', ...args)
    }
}


// Copy from https://stackoverflow.com/a/35810961
function sortObjectByKeys(value) {
    if (BigNumber.isBigNumber(value)) {
        value.toJSON = () => {return value.toFixed()}
        return value
    }
    return (typeof value === 'object' && value != null && typeof value.toJSON != 'function') ?
        (Array.isArray(value) ?
            value.map(sortObjectByKeys) :
            Object.keys(value).filter((key) => { return value.hasOwnProperty(key) }).sort().reduce(
                (o, key) => {
                    const v = value[key];
                    o[key] = sortObjectByKeys(v);
                    return o;
                }, {})
        ) :
        value;
}

function stringToBoolean(s) {
    return s === "true"
}



export { debug, sortObjectByKeys, stringToBoolean }