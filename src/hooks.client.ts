import { goto } from "$app/navigation";
import { createClient } from "@supabase/supabase-js";

//prod
const supabaseUrl = "https://zstmmqrjsivuarrurcnu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdG1tcXJqc2l2dWFycnVyY251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ3ODEwNzUsImV4cCI6MjAzMDM1NzA3NX0.h05VTzEE4IJqAxXmK0hVTgWo3ld7mnGSg80UoPNfMpo";

//dev
//const supabaseUrl = "https://jdfyrrdpbocafdnxvdnw.supabase.co";
//const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZnlycmRwYm9jYWZkbnh2ZG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTI2NjA2NjMsImV4cCI6MjAwODIzNjY2M30.7ci9gcGyqSKiODkNW6GlTfOwZjILsF-s01z0oogARAA";




export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get user session on the client side
export const userSession = async () => {
    const { data: {session}, error } = await supabase.auth.getSession()
        if(error){
            return undefined
        }
        else if (session) {
            return true
        }
}

// Get user role on the client side (Partner or Resident)
export const userRole = async () => {
    const { data: {session}, error } = await supabase.auth.getSession()
        if(error){
            return undefined
        }
        else if (session) {
            const role = session.user.user_metadata["role"]
            return role
        }
}

// Get user id on the client side
export const userId = async () => {
    const { data: {session}, error } = await supabase.auth.getSession()
        if(error){
            return undefined
        }
        else if (session) {
            const id = session.user.id
            return id
        }
}

// Get user email on the client side
export const userEmail = async () => {
    const { data: {session}, error } = await supabase.auth.getSession()
        if(error){
            return undefined
        }
        else if (session) {
            const email = session.user.email
            return email
        }
}

// Get user company on the client side
export const userCompany = async () => {
    const user = await userId()
    if (user) {
        const { data, error } = await supabase.from("partner_verification_status").select().eq("id", user).single()
        if (error) {
            return undefined
        }
        else if (data) {
            return data.company_id
        }
    }
}

// Get company name on the client side
export const companyName = async () => {
    const company_id = await userCompany()
    if (company_id) {
        const { data, error } = await supabase.from("companies").select().eq("id", company_id).single()
        if (error) {
            return undefined
        }
        else if (data) {
            return data.name
        }
    }
}

// Guard partner routes, if resident, send back to '/'
export const partnerRouteGuard = async () => {
    const role = await userRole()
    if (role == "Resident" || role == undefined) {
        goto('/')
    }
}

// Guard resident routes, if resident, send back to '/'
export const residentRouteGuard = async () => {
    const role = await userRole()
    if (role == "Partner" || role == undefined) {
        goto('/')
    }
}

// Get resident's first name
export const residentName = async () => {
    const user = await userId()
    if (user) {
        const { data, error } = await supabase.from("resident_names").select().eq("id", user).single()
        if (error) {
            return undefined
        }
        else if (data) {
            return data.first_name
        }
    }
}