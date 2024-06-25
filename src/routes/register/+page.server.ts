import { redirect } from "sveltekit-flash-message/server"
import { supabase } from "../../hooks.client.js";

// Catch query params
export async function load({ params, url }) {
    let buildingId = url.searchParams.get('building');
    return { buildingId };
}

// Handle registration form
export const actions = {
    default: async ( event: any ) => {
        const formData = Object.fromEntries(await event.request.formData());
        const email = formData['email'];
        const password = formData['password'];
        const role = formData['role'];
 
        if (email && password && role) {
            // If registering as partner
            if (role === "1") {
                const { data: uData, error: uError } = await supabase.auth.signUp({
                    email: email.toString(),
                    password: password.toString(),
                    options: {
                        data: {
                            role: "Partner"
                        }
                    }
                })
                if (uError) {
                    if(uError.status === 400) {
                        throw redirect("/", { type: "error", message: "Email already in use, please sign in"}, event)
                    }
                }
                else {
                    // Insert new registrant to master partner verification status table
                    const { data, error } = await supabase.from("partner_verification_status").insert({id: uData.user?.id})
                    if (!error) {
                        throw redirect("/", { type: "success", message: "Account created, ready to sign in"} , event)
                    }
                }
            }
            // If registering as resident
            else {
                // Check if building is legit
                const { data: rData, error: rError } = await supabase.auth.signUp({
                        email: email.toString(),
                        password: password.toString(),
                        options: {
                            data: {
                                role: "Resident"
                            }
                        }
                })
                if (rError) {
                    if(rError.status === 400) {
                        throw redirect("/", { type: "error", message: "Email already in use, please sign in"}, event)
                    }
                }
                else {
                    // Insert new registrant to master resident verification status table
                    const { data, error } = await supabase.from("resident_verification_status").insert({id: rData.user?.id})
                    if (!error) {
                        throw redirect("/", { type: "success", message: "Account created, ready to sign in"}, event)
                    }
                    else{
                        throw redirect("/", { type: "error", message: "error:" + error.message.toString()}, event)
                    }
                }
            }
        }
    }
};
