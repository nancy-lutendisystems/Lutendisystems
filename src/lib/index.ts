import { writable, type Writable } from "svelte/store";
import { supabase } from "../hooks.client";
import { setContext, getContext } from "svelte";

// Store for user session
export function createUserTokenStore() {
    const userTokenStore = writable<string | undefined>();
    setContext("userTokenStore", userTokenStore);
}

export function getUserTokenStore() {
    return getContext<Writable<string | undefined>>("userTokenStore");
}

// Store for AddBuilding.svelte modal form
export const newBuilding = writable({
    alias: '',
    street: '',
    city: '',
    postal_code: '',
    province: '',
    doc: null,
    complete: false
})

// Store for partner's buldings
export const buildings = writable<{ company_id: number, id: number, alias: string, street: string, city: string, registered: number, verified: number }[]>([]);

// Function to get a partner's buildings
export const loadBuildings = async (company_id: any) => {
    const { data, error} = await supabase.from("buildings_table").select().match({"company_id": company_id})
    if (!error) {
        buildings.set(data)
    }
}

// Store for partner's verified residents
export const residents = writable<{ company_id: number, building_id: number, alias: string, unit: string, full_name: string, account_status: boolean, search_terms: string }[]>([]);

// Searchable store
export const createSearchStore = (data: any) => {
    const { subscribe, set, update } = writable({
        data: data,
        filtered: data,
        search: "",
    })

    return { subscribe, set, update }
}

// Function to get verified residents
export const loadResidents = async (company_id: any) => {
    const { data, error} = await supabase.from("verified_residents_list").select().match({"company_id": company_id})
    if (!error) {
        const searchableData: any = data.map((resident: any) => ({
            ...resident, 
            search_terms: `${resident.alias} ${resident.unit} ${resident.full_name} ${resident.account_status}`
        }))
        residents.set(searchableData)
    }
}

// HELPER FUNCTIONS

// Mapping of file extensions to content types
const contentTypes = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.heic': 'image/heic',
};

export function getFileInfo(filename: any) {
    let extension: any = filename.split('.').pop().toLowerCase();
   
    // Check if the extension is supported
    if (!contentTypes.hasOwnProperty('.' + extension)) {
       return null; // Unsupported file type
    }
   
    // Return the extension and content type
    return {
       extension: '.' + extension,
       contentType: contentTypes['.' + extension as keyof typeof contentTypes],
    };
}

// File validation helper functions
export function checkFile(files: FileList | null): string {
    if (files && files.length > 0) {
        const file = files[0];
        if (file.size <= 5 * 1024 * 1024) {
        return file.name;
        } else {
        return "File is too big";
        }
    } else {
        return "No file selected";
    }
}

// Search Handler
export const searchHandler = (store: any) => {
    const searchTerms = store.search.toLowerCase() || ""
    store.filtered = store.data.filter((item: any) => {
        return item.search_terms.toLowerCase().includes(searchTerms)
    })
}