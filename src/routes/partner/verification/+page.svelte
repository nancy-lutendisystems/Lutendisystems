<script lang="ts">
    import { onMount } from 'svelte';
    import { supabase, userId, userEmail, partnerRouteGuard } from '../../../hooks.client';
    import { goto } from '$app/navigation';
    import { Stepper, Step, RadioGroup, RadioItem, getToastStore } from '@skeletonlabs/skeleton';
    import type { ToastSettings } from '@skeletonlabs/skeleton';
    import Spinner from '../../../components/Spinner.svelte';

    const toastStore = getToastStore();
    const error: ToastSettings = {
        message: "Error submitting form. Please contact support.",
        background: 'variant-filled-error'
    }

    const errorC: ToastSettings = {
        message: "Company Registration Code is not valid",
        background: 'variant-filled-error'
    }

    let email = ""
    let id = ""
    let bypass: number = 0

    let isLoading: boolean = false ;

    // On page render, check if user is allowed to view and get id + email for form
    // If user is verified then send to dashboard
    onMount(async () => {
        partnerRouteGuard()
        const uid = await userId()
        if (uid) {
            id = uid
        }
        const uEmail: any = await userEmail()
        if (uEmail)
            email = uEmail
        const { data, error } = await supabase.from("partner_verification_status").select().eq("id", id).single()
        if (data.verified == true) {
            goto("/partner/dashboard")
        }
    })

    // Form varibles
    let company: string;
    let company_code: string;
    let first_name: string;
    let middle_name: string;
    let last_name: string;
    let phone_number: string;
    let locked: boolean = true

    // Complete handler
    async function onCompleteHandler(e: Event) {
        locked = true

        if (bypass == 1) {
            const { data: check_company, error: company_error } = await supabase.from("companies")
                .select().eq("id", company_code).single();
            if (company_error) {
                toastStore.trigger(errorC)
                return
            }
            else {
                isLoading = true
            }

            const { data: second_insert, error: second_error } = await supabase
                .from("verified_partner_details").insert({id: id, company: check_company.name, company_id: company_code, first_name: first_name, middle_name: middle_name, last_name: last_name, phone_number: phone_number, email: email, lead_contact: false});
            if (second_error) {
                toastStore.trigger(error)
                return
            }
            else {
                const { data, error: status_error } = await supabase.from("partner_verification_status").update({verified: true, company_id: company_code}).eq("id", id)
                if (status_error) {
                    toastStore.trigger(error)
                    return
                }
                else {
                    goto('/partner/dashboard');
                }
            }
        }
        else {
            isLoading = true;
            const { data: first_insert, error: first_error } = await supabase.from("companies")
                .insert({name: company, lead_contact: id}).select().single();
            if (first_error) {
                toastStore.trigger(error)
                return
            }

            const { data: second_insert, error: second_error } = await supabase
                .from("verified_partner_details").insert({id: id, company: company, company_id: first_insert.id, first_name: first_name, middle_name: middle_name, last_name: last_name, phone_number: phone_number, email: email, lead_contact: true});
            if (second_error) {
                toastStore.trigger(error)
                return
            }
            else {
                const { data, error: status_error } = await supabase.from("partner_verification_status").update({verified: true, company_id: first_insert.id}).eq("id", id)
                if (status_error) {
                    toastStore.trigger(error)
                    return
                }
                else {
                    goto('/partner/dashboard');
                }
            }
        }
    }

    $: {
        if (bypass == 1) {
            if (company_code && first_name && last_name && phone_number) {
                if (company_code.length == 6) {
                    locked = false
                }
                else {
                    locked = true
                }
            }
            else {
                locked = true
            }
        }
        else {
            if (company && first_name && last_name && phone_number) {
                locked = false
            }
            else {
                locked = true
            }
        }
    }
</script>
{#if isLoading}
    <div class="w-full h-full flex items-center justify-center">
        <Spinner />
    </div>
{:else}
    <div class="h-full w-full pl-7 pr-7 p-5 flex items-center justify-center md:pl-20 md:pr-20">
        <Stepper class="variant-soft p-6 rounded-2xl max-w-3xl md:w-full" on:complete={onCompleteHandler}>
            <Step>
                <svelte:fragment slot="header">Welcome!</svelte:fragment>
                <div class="flex flex-col items-center justify-center gap-2">
                    <p class="font-bold">Do you have a company registration code?</p>
                    <RadioGroup>
                        <RadioItem bind:group={bypass} name="bypass" value={0}>No</RadioItem>
                        <RadioItem bind:group={bypass} name="bypass" value={1}>Yes</RadioItem>
                    </RadioGroup>
                </div>
                <svelte:fragment slot="navigation">
                    <button hidden></button>
                </svelte:fragment>
            </Step>
            <Step locked={locked}>
                <svelte:fragment slot="header">Contact Details</svelte:fragment>
                <div>
                <p class="lable font-medium pb-1">Full Name<span class="text-red-500">*</span></p>
                    <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div>
                            <input class="input" name="first_name" title="First Name" type="text" placeholder="First" required bind:value={first_name}>
                        </div>
                        <div>
                            <input class="input" name="middle_name" title="Middle Name" placeholder="Middle" type="text" bind:value={middle_name}>
                        </div>
                        <div>
                            <input class="input" name="last_name" title="Last Name" type="text" placeholder="Last" required bind:value={last_name}>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-5">
                    <div>
                        <label class="label font-medium">
                            <span>Phone Number<span class="text-red-500">*</span></span>
                            <input class="input" name="phone_number" title="Phone Number" type="text" placeholder="XXX XXX-XXXX" minlength={10} maxlength={10} required bind:value={phone_number} >
                        </label>
                    </div>
                    {#if bypass == 1}
                        <div>
                            <label class="label font-medium">
                                <span>Company Registration Code<span class="text-red-500">*</span></span>
                                <input class="input" name="company_code" title="Company Registration Code" type="text" placeholder="XXXXXX" maxlength={6} bind:value={company_code}>
                            </label>
                        </div>
                    {:else}
                        <div>
                            <label class="label font-medium">
                                <span>Company Name<span class="text-red-500">*</span></span>
                                <input class="input" name="company" title="Company Name" type="text" placeholder="Lutendi Systems" required bind:value={company}>
                            </label>
                        </div>
                    {/if}
                    
                </div>
                <input name="email" type="hidden" value={email}>
                <input name="id" type="hidden" value={id}>
            </Step>
        </Stepper>
    </div>
{/if}