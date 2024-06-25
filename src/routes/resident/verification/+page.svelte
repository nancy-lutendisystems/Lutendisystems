<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { supabase, userEmail, userId, residentRouteGuard } from "../../../hooks.client";
    import { RadioGroup, RadioItem, Stepper, Step, FileButton, getToastStore } from '@skeletonlabs/skeleton';
    import Spinner from "../../../components/Spinner.svelte";
    import type { ToastSettings } from '@skeletonlabs/skeleton';
    import { getModalStore } from '@skeletonlabs/skeleton';
    import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';
    import ResidentSupport from "../../../components/ResidentSupport.svelte";
    import { fade } from "svelte/transition";
    import { getFileInfo, checkFile } from "$lib";
//added by yanping
    import Selectbuilding from '../../../components/Selectbuilding.svelte';
    import { initFlash } from "sveltekit-flash-message";
 

//end  

    // Stores
    const modalStore = getModalStore();
    const toastStore = getToastStore();

    // Support Modal
    const modalComponent: ModalComponent = {
        // Pass a reference to your custom component
        ref: ResidentSupport,
        // Provide a template literal for the default component slot
        slot: `<ResidentSupport>`
    };

    const modal: ModalSettings = {
        type: 'component',
        // Pass the component directly:
        component: modalComponent,
    };

    // Toasts
    const errorW: ToastSettings = {
        message: "Error submitting form. Please try again.",
        background: 'variant-filled-error'
    }

    const errorB: ToastSettings = {
        message: "Verification code is invalid or has already been used.",
        background: 'variant-filled-error'
    }

    const errorC: ToastSettings = {
        message: 'Error. Please contact support.',
        background: 'variant-filled-error',
        autohide: false,
        action: {
            label: 'Support',
            response: () => modalStore.trigger(modal)
        }
    };

    let isLoading: boolean = false;

    let roommate: number = 0;
    let cosign: number = 0;
    let id: any;
    let email: any;
    let buildingId: any;


//added by yanping
    let numofbuildings: number;
    let buildingidaddr: { id: number, street: string, city: string }[] = [];
    let selected: { id: number, street: string } | undefined;
    
    onMount(async () => {
        const { data, error } = await supabase.from("active_buildings").select('id, street,city');
        if (error) {
            console.error("Error fetching data:", error);
            return;
        }
        if (data) {
            numofbuildings = data.length;
            buildingidaddr =  data.map(item => ({ id: item.id, street: item.street,city: item.city })).sort((a, b) => a.street > b.street ? 1 : -1);;
        }
    });
  
    $: selected , assignbuildingid();
    

    function assignbuildingid() {
        buildingId = selected?.id;
        return buildingId;
    }

//end


    // On page render, check if user is allowed to view, get id and email to populate verification form
    // If verified then send back to dashboard
    onMount(async () => {
        residentRouteGuard()
        const uid = await userId()
        if (uid) {
            id = uid
        }
        const uEmail: any = await userEmail()
        if (uEmail)
            email = uEmail
        const { data, error } = await supabase.from("resident_verification_status").select().eq("id", id).single()
        if (data.verified == true) {
            goto("/resident/dashboard")
        }
    })

    // Form state variables
    let stepTwo: boolean = true;
    let first_name: string;
    let middle_name: string;
    let last_name: string;
    let dob: Date;
    let phone_number: string;

    let stepThree: boolean = true;
    let c_first_name: string;
    let c_middle_name: string;
    let c_last_name: string;
    let c_dob: string;
    let c_phone_number: string;
    let c_unit: string;
    let c_street: string;
    let c_city: string;
    let c_postal_code: string;
    let c_province: string;
    let unit: string;
    let move_in: string;
    let move_out: string;

    let stepFour: boolean = true;
    let govDoc: any;
    let govDocName: string = "No file selected";
    let nonGovDoc: any;
    let nonGovDocName: string = "No file selected";
    let consent: number = 0;

    function handleConsent(checkbox: number) {
        if (checkbox == 0) {
            checkbox = 1;
        }
        else {
            checkbox = 0
        }
        return checkbox;
    }

    $: {
        // Step 2 validation
        if (first_name && last_name && dob && phone_number && phone_number.length >= 10) {
            stepTwo = false;
        }
        else {
            stepTwo = true;
        }

        // Step 3 validation
        if (cosign == 0 && unit && move_in && selected) {
            stepThree = false;
        }
        else {
            if (c_first_name && c_last_name && c_dob && c_phone_number && c_street && c_city && c_postal_code && c_province) {
                stepThree = false;
            }
            else {
                stepThree = true;
            }
        }

        // Step 4 validation
        if (consent == 1 && govDocName != "No file selected" && govDocName != "File is too big" && nonGovDocName != "No file selected" && nonGovDocName != "File is too big") {
            stepFour = false;
        }
        else {
            stepFour = true;
        }
    }

    // Stepper handler on complete
    async function onCompleteHandler(e: Event) {
        stepFour = true
        isLoading = true;

        let govDocData: any = getFileInfo(govDocName);
        let nonGovDocData: any = getFileInfo(nonGovDocName);
        
            const { data: first_insert, error: first_error } = await supabase.from("verified_resident_details")
                .insert({id: id, building_id: buildingId, first_name: first_name, middle_name: middle_name, last_name: last_name, date_of_birth: dob, phone: phone_number, email: email, consent: true, roommate: roommate, cosigner: cosign, unit: unit, move_in_date: move_in, move_out_date: move_out});
                    if (first_error) {
                        toastStore.trigger(errorW)
                        isLoading = false
                        return
                    }


            const { data: third_insert, error: third_error} = await supabase.storage.from("resident_gov_photo_id")
                .upload(`${buildingId}/${id}${govDocData.extension}`, govDoc[0], {upsert: false, contentType: govDocData.contentType})
                    if (third_error) {
                        toastStore.trigger(errorC)
                        isLoading = false
                        consent = 0
                        return
                    }

            const { data: fourth_insert, error: fourth_error} = await supabase.storage.from("resident_non_gov_photo_id")
                .upload(`${buildingId}/${id}${nonGovDocData.extension}`, nonGovDoc[0], {upsert: false, contentType: nonGovDocData.contentType})
                    if (fourth_error) {
                        toastStore.trigger(errorC)
                        isLoading = false
                        consent = 0
                        return
                    }
            
            if (cosign == 1) {
                const { data: fifth_insert, error: fifth_error } = await supabase.from("resident_cosigner")
                    .insert({resident_id: id, first_name: c_first_name, middle_name: c_middle_name, last_name: c_last_name, date_of_birth: c_dob, phone: c_phone_number, unit: c_unit, street: c_street, city: c_city, postal_code: c_postal_code.toUpperCase(), province: c_province});
                        if (fifth_error) {
                            toastStore.trigger(errorC)
                            isLoading = false
                            consent = 0
                            return
                        }
            }

            const { data, error: status_error } = await supabase.from("resident_verification_status")
                .update({verified: true,building_id: buildingId}).eq("id", id)
                    if (status_error) {
                        toastStore.trigger(errorC)
                        isLoading = false
                        consent = 0
                        return
                    }
                    else {
                        // Send data to server for trello
                        const formData = new FormData();
                            formData.append('building_id', buildingId);
                            formData.append('id', id);
                            formData.append('first_name', first_name);
                            formData.append('last_name', last_name);
                            formData.append('dob', dob);
                            formData.append('phone_number', phone_number);
                            formData.append('email', email);
                            try {
                                const response = await fetch("/trello/resident", {
                                    method: "POST",
                                    body: formData,
                                });
                                const result = await response.json();
                                const status = JSON.parse(result.data)[1];

                                if (status) {
                                    goto('/resident/dashboard');
                                }
                                else {
                                    goto('/resident/dashboard');
                                }
                            }
                            catch (error) {
                                goto('/resident/dashboard');
                            }
                    }
            

    }
</script>
{#if isLoading}
    <div class="w-full h-full flex items-center justify-center">
        <Spinner />
    </div>
{:else}
    <div class="h-full w-full pl-7 pr-7 p-5 md:pl-20 md:pr-20 flex flex-col items-center justify-center">
        <Stepper class="variant-soft p-6 rounded-2xl max-w-3xl md:w-full" on:complete={onCompleteHandler}>
            <Step>
                <svelte:fragment slot="header">Welcome!</svelte:fragment>
                <p>You're taking a step in the right direction for a better financial future!</p>
                <p>In under 5 minutes, your rent will start to go towards building your credit!</p>
                <p>To complete verification, click <span class="font-bold text-primary-300">Next</span>.</p>
                <svelte:fragment slot="navigation">
                    <a class="btn variant-ghost-primary" href="https://drive.google.com/file/d/1D0IZ33Fgpb-f3IdO9KeAAaGGD6w5iMli/view?usp=sharing" target="_blank">Guide</a>
                </svelte:fragment>
            </Step>
                <Step locked={stepTwo}>
                    <svelte:fragment slot="header">Contact Details</svelte:fragment>
                    <div class="grid grid-cols-1 gap-5">
                        <div>
                            <p class="lable font-medium pb-1">Full Legal Name<span class="text-red-500">*</span></p>
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
                                    <span>Date of Birth<span class="text-red-500">*</span></span>
 <!--                                   <input class="input" name="dob" title="Date of Birth" type="date" placeholder="Input (Date)" required bind:value={dob}>  -->
                                    <input class="input" name="dob" title="Date of Birth" type="date" max="3024-12-31" required bind:value={dob}>

                                </label>
                            </div>
                            <div>
                                <label class="label font-medium">
                                    <span>Phone Number(only numbers)<span class="text-red-500">*</span></span>
                                    <input class="input" name="phone_number" title="Phone Number" type="text" placeholder="XXX XXX-XXXX" minlength={10} maxlength={10} required bind:value={phone_number}>
                                </label>
                            </div>
                        </div>

                        <input name="email" type="hidden" value={email}>
                        <input name="id" type="hidden" value={id}>
                        <input name="building-id" type="hidden" value={buildingId}> 
                    </div>
                    <svelte:fragment slot="navigation">
                        <button hidden></button>
                    </svelte:fragment>
                </Step>
                <Step locked={stepThree}>
                    <svelte:fragment slot="header">Lease Details</svelte:fragment>
                    <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div>
                            <label class="label font-medium">
                                <span>Unit Number<span class="text-red-500">*</span></span>
                                <input class="input" name="unit" title="Unit" type="text" placeholder="XXXXXX" required bind:value={unit}>
                            </label>
                        </div>
                        <div>
                            <label class="label font-medium">
                                <span>Move In Date<span class="text-red-500">*</span></span>
                                <input class="input" name="move_in" title="Move In Date" type="date" max="3024-12-31" required bind:value={move_in}>
                            </label>
                        </div>
                        <div>
                            <label class="label font-medium">
                                <span>Expected Move Out Date</span>
                                <input class="input" name="move_out" title="Move Out Date" type="date" max="3024-12-31" bind:value={move_out}>
                            </label>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-5">
                        <label class="label font-medium">
                            <span>Please select address *</span>
                            <select name="myselected" class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm" style="background-color: #374151; border-radius: 25px;" on:selectionchange={assignbuildingid()} required bind:value={selected}>
                                <option value="" disabled selected>Select your building</option>
                                {#each buildingidaddr as buildaddr}
                                    <option value={buildaddr}>
                                        {buildaddr.street} ,  {buildaddr.city}
                                    </option>
                                {/each}
                            </select>
                        </label>
                    </div>
                    <div class="grid gap-5 md:flex">
                        <div class="mt-1">
                            <p class="font-bold">I live with others who split/share rent with me on a monthly basis</p>
                            <RadioGroup>
                                <RadioItem bind:group={roommate} name="roommate" value={0}>No</RadioItem>
                                <RadioItem bind:group={roommate} name="roommate" value={1}>Yes</RadioItem>
                            </RadioGroup>
                        </div>
                    </div>
                    <div class="grid gap-5 mt-5 md:flex">
                        <div>
                            <p class="font-bold pb-1">Do you have a co-signer on your lease?</p>
                            <p class="pb-1 text-xs">Co-signers <span class="underline">do not</span> make regular monthly rent payments. Co-signers are only responsible for making the payment if you miss it. <span class="underline font-bold">If you do not have a co-signer explicitly stated on your original lease, leave this field as "No".</span></p>
                            <RadioGroup>
                                <RadioItem bind:group={cosign} name="cosign" value={0}>No</RadioItem>
                                <RadioItem bind:group={cosign} name="cosign" value={1}>Yes</RadioItem>
                            </RadioGroup>
                        </div>
                    </div>
                    {#if cosign == 1}
                        <hr>
                        <h3 class="h3 font-bold">Co-Signer Details</h3>
                        <div class="grid grid-cols-1 gap-5">
                            <div>
                                <p class="lable font-medium pb-1">Full Legal Name<span class="text-red-500">*</span></p>
                                <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
                                    <div>
                                        <input class="input" name="c_first_name" title="Co-Signer First Name" type="text" placeholder="First" required bind:value={c_first_name}>
                                    </div>
                                    <div>
                                        <input class="input" name="c_middle_name" title="Co-Signer Middle Name" placeholder="Middle" type="text" bind:value={c_middle_name}>
                                    </div>
                                    <div>
                                        <input class="input" name="c_last_name" title="Co-Signer Last Name" type="text" placeholder="Last" required bind:value={c_last_name}>
                                    </div>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-5">
                                <div>
                                    <label class="label font-medium">
                                        <span>Date of Birth<span class="text-red-500">*</span></span>
                                        <input class="input" name="c_dob" title="Co-Signer Date of Birth" type="date" max="3024-12-31" required bind:value={c_dob}>
                                    </label>
                                </div>
                                <div>
                                    <label class="label font-medium">
                                        <span>Phone Number(only numbers)<span class="text-red-500">*</span></span>
                                        <input class="input" name="c_phone_number" title="Co-Signer Phone Number" type="text" placeholder="XXX XXX-XXXX" minlength={10} maxlength={10} required bind:value={c_phone_number}>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p class="lable font-medium pb-1">Address<span class="text-red-500">*</span></p>
                            <div class="grid grid-cols-2 gap-5 md:grid-cols-5">
                                <div>
                                    <input class="input" name="c_unit" title="Unit" type="text" placeholder="Unit" bind:value={c_unit}>
                                </div>
                                <div>
                                    <input class="input" name="c_street" title="Street" type="text" placeholder="Street" required bind:value={c_street}>
                                </div>
                                <div>
                                    <input class="input" name="c_city" title="City" type="text" placeholder="City" required bind:value={c_city}>
                                </div>
                                <div>
                                    <input class="input" name="c_postal_code" title="Postal Code" type="text" placeholder="XXX XXX" minlength={7} maxlength={7} required bind:value={c_postal_code}>
                                </div>
                                <div>
                                    <select class="input" name="c_province" title="Province" required bind:value={c_province}>
                                        <option value="" disabled selected>Province</option>
                                        <option value="AB">Alberta</option>
                                        <option value="BC">British Columbia</option>
                                        <option value="MB">Manitoba</option>
                                        <option value="NB">New Brunswick</option>
                                        <option value="NL">Newfoundland and Labrador</option>
                                        <option value="NT">Northwest Territories</option>
                                        <option value="NS">Nova Scotia</option>
                                        <option value="NU">Nunavut</option>
                                        <option value="ON">Ontario</option>
                                        <option value="PE">Prince Edward Island</option>
                                        <option value="QC">Quebec</option>
                                        <option value="SK">Saskatchewan</option>
                                        <option value="YT">Yukon</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    {/if}
                    <svelte:fragment slot="navigation">
                        <button hidden></button>
                    </svelte:fragment>
                </Step>
                <Step locked={stepFour}>
                    <svelte:fragment slot="header">Identification</svelte:fragment>
                    <p>We need your ID so that we can reward the right person! Your files will be safe and secure!</p>
                    <p>Accepted Files: <span class="text-primary-300">PDF, PNG, JPG, JPEG, or HEIC</span> under <span class="text-primary-300">5MB</span></p>
                    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <p class="pb-2 font-bold">Government Issued Photo ID<span class="text-red-500">*</span></p>
                            <div class="grid grid-cols-1 gap-2 md:flex md:items-center ">
                                <FileButton name="uploadGovernementID" accept=".pdf, .jpg, .png, .jpeg, .heic" required capture bind:files={govDoc} on:change={() => govDocName = checkFile(govDoc)}>Upload</FileButton>
                                <p class="md:ml-2 text-primary-300">{govDocName}</p>
                            </div>
                        </div>
                        <div>
                            <p class="pb-2 font-bold">Additional Photo ID<span class="text-red-500">*</span></p>
                            <div class="grid grid-cols-1 gap-2 md:flex md:items-center ">
                                <FileButton name="uploadPhotoID" accept=".pdf, .jpg, .png, .jpeg, .heic" required capture bind:files={nonGovDoc} on:change={() => nonGovDocName = checkFile(nonGovDoc)}>Upload</FileButton>
                                <p class="md:ml-2 text-primary-300">{nonGovDocName}</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <input bind:value={consent} on:change={() => consent = handleConsent(consent)} required id="default-checkbox" type="checkbox" class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <label for="default-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">By checking this box, I confirm that the information I have provided is accurate and I have read and agree to the <a class="font-semibold underline text-secondary-600 hover:text-secondary-500" href="/resident/privacy-policy" target="_blank">privacy policy</a><span class="text-red-500">*</span></label>
                    </div>
                    <svelte:fragment slot="navigation">
                        <button hidden></button>
                    </svelte:fragment>
                </Step>
        </Stepper>
    </div>
{/if}