import util from "../utils";

const moduleName = "SiteSettings";
const sharedResourcesName = "SharedResources";

// Localization tables already fetched, keyed by culture code.
const loadedTables = {};
// Table of the language currently being edited; null means use the Persona Bar UI language.
let activeTable = null;
// Culture of the most recent load request, used to ignore out-of-order responses.
let requestedCulture = null;

function findValue(table, resourceName, key) {
    const resources = table[resourceName];
    if (resources && Object.prototype.hasOwnProperty.call(resources, key)) {
        return resources[key];
    }
    return undefined;
}

const resx = {
    get(key) {
        if (activeTable) {
            const value = findValue(activeTable, moduleName, key);
            if (value !== undefined) {
                return value;
            }
            const sharedValue = findValue(activeTable, sharedResourcesName, key);
            if (sharedValue !== undefined) {
                return sharedValue;
            }
        }
        return util.utilities.getResx(moduleName, key);
    },

    // Switches the Site Settings UI strings to the given culture. Missing keys fall back to the
    // Persona Bar UI language, so the callback is always invoked, even if the request fails.
    loadCulture(cultureCode, callback) {
        const done = () => {
            if (typeof callback === "function") {
                callback();
            }
        };

        requestedCulture = cultureCode || null;
        if (!cultureCode) {
            activeTable = null;
            done();
            return;
        }

        if (Object.prototype.hasOwnProperty.call(loadedTables, cultureCode)) {
            activeTable = loadedTables[cultureCode];
            done();
            return;
        }

        const sf = util.utilities.sf;
        sf.moduleRoot = "personaBar";
        sf.controller = "localization";
        sf.getsilence("gettable", { culture: cultureCode }, (table) => {
            if (requestedCulture !== cultureCode) {
                return;
            }
            loadedTables[cultureCode] = table || {};
            activeTable = loadedTables[cultureCode];
            done();
        }, () => {
            if (requestedCulture !== cultureCode) {
                return;
            }
            activeTable = null;
            done();
        });
    }
};
export default resx;
