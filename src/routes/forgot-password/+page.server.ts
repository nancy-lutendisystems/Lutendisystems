import { redirect } from "sveltekit-flash-message/server"
import { supabase } from "../../hooks.client.js";
//import { redirect } from '@sveltejs/kit';

// Form handler, send update password link to email and provide flash messages based on success or error
export const actions = {
    default: async ( event: any ) => {
        const formData = Object.fromEntries(await event.request.formData());
        const email = formData['email'];

        if (email) {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'https://app.lutendi.com/update-password',
            })
            if (error) {
                throw redirect("/forgot-password", { type: "error", message: "Failed to send link, please try again in 60 seconds" + error.message.toString()}, event)
            }
            else {
                throw redirect("/forgot-password", { type: "success", message: "Please check your email!"}, event)
            }
        }
    },
};                 