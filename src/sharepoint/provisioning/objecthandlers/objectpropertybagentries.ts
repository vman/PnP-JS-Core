"use strict";

import { Util } from "../util";
import { ObjectHandlerBase } from "./objecthandlerbase";
import { IPropertyBagEntry } from "../schema/IPropertyBagEntry";

/**
 * Describes the Property Bag Entries Object Handler
 */
export class ObjectPropertyBagEntries extends ObjectHandlerBase {
    /**
     * Creates a new instance of the ObjectPropertyBagEntries class
     */
    constructor() {
        super("PropertyBagEntries");
    }

    /**
     * Provision Property Bag Entries
     * 
     * @param entries The entries to provision
     */
    public ProvisionObjects(entries: Array<IPropertyBagEntry>) {
        super.scope_started();
        return new Promise((resolve, reject) => {
            if (!entries || entries.length === 0) {
                resolve();
            } else {
                const clientContext = SP.ClientContext.get_current();
                const web = clientContext.get_web();
                let propBag = web.get_allProperties();
                let indexedProperties = [];
                for (let i = 0; i < entries.length; i++) {
                    let entry = entries[i];
                    propBag.set_item(entry.Key, entry.Value);
                    if (entry.Indexed) {
                        indexedProperties.push(Util.encodePropertyKey(entry.Key));
                    };
                };
                web.update();
                clientContext.load(propBag);
                clientContext.executeQueryAsync(
                    () => {
                        if (indexedProperties.length > 0) {
                            propBag.set_item("vti_indexedpropertykeys", indexedProperties.join("|"));
                            web.update();
                            clientContext.executeQueryAsync(
                                () => {
                                    super.scope_ended();
                                    resolve();
                                }, () => {
                                    super.scope_ended();
                                    resolve();
                                });
                        } else {
                            super.scope_ended();
                            resolve();
                        }
                    }, () => {
                        super.scope_ended();
                        resolve();
                    });
            }
        });
    }
}
