<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { userId, supabase, residentRouteGuard, userEmail, residentName } from "../../../hooks.client";
    import { fade } from "svelte/transition";
    import Spinner from "../../../components/Spinner.svelte";
    import ResidentSupport from "../../../components/ResidentSupport.svelte";
    import { getModalStore } from '@skeletonlabs/skeleton';
    import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';

    // Stores
    const modalStore = getModalStore();

    let id: any;
    let email: any;
    let name: any;
    let street: string = "";
    let city: string = "";
    let isLoading: boolean = true;
    let buildingId: any;
    let internal_verification: boolean;

    // On page render, check if user is allowed to view, get user id and check verification status
    // If verified, load dashboard data, else go to verification page
    onMount(async () => {
        residentRouteGuard()
        id = await userId()
        email = await userEmail()
        name = await residentName()
        const { data, error } = await supabase.from("resident_verification_status").select().eq("id", id).single()
        if (data.verified == false) {
            goto("/resident/verification")
        }
        else {
            const { data: buildingData, error: buildingError } = await supabase.from("active_buildings").select().eq("id", data.building_id).single()
            if (data != null && buildingData != null) {
                street = buildingData.street
                city = buildingData.city
                buildingId = buildingData.id
                isLoading = false
                internal_verification = data.internal_verification
            }
        }
    })

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

</script>

{#if isLoading == false}
    <div transition:fade class="w-full pl-7 pr-7 p-5 md:pl-20 md:pr-20 md:flex md:justify-center">
        <div class="card p-4 rounded-2xl variant-ghost max-w-xl md:w-full">
            <div class="card-header text-xl flex flex-col gap-1 items-center align-middle justify-center">
                <h4 class="h4">Hi {name}!</h4>
                <p class="font-light text-sm">{street + ", " + city}</p>
            </div>
            <div class="flex items-center justify-center p-4">
                <div class="flex items-center justify-center">
                    <button class="btn btn-sm variant-filled-primary" on:click={() => modalStore.trigger(modal)}>Support</button>
                </div>
            </div>
            <div class="card-footer flex align-middle justify-center">
                {#if internal_verification == true}
                    <div class="font-medium text-success-500">ID Verified</div>
                {:else}
                    <div class="font-medium text-warning-500">ID Verification Pending</div>
                {/if}
            </div>
        </div>
    </div>
{:else}
    <div class="w-full h-full flex items-center justify-center">
        <Spinner />
    </div>
{/if}