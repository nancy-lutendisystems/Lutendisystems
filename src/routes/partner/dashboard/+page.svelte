<script lang="ts">
    import { onMount } from 'svelte';
    import { supabase, userId, partnerRouteGuard, userCompany, companyName} from '../../../hooks.client';
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';

    import { getModalStore, } from '@skeletonlabs/skeleton';
    import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import type { ToastSettings } from '@skeletonlabs/skeleton';
    import { popup } from '@skeletonlabs/skeleton';
    import type { PopupSettings } from '@skeletonlabs/skeleton';
    import { Paginator } from '@skeletonlabs/skeleton';
    import AddBuilding from '../../../components/AddBuilding.svelte';
    import Spinner from '../../../components/Spinner.svelte';
    import { newBuilding, buildings, loadBuildings } from '$lib';

    import { UserPlus } from 'lucide-svelte';

    const toastStore = getToastStore();
    const modalStore = getModalStore();

    let id: any;
    let company_id: any;
    let company_name: any;
    let isLoading: boolean = true;
    let selectedBuilding: string;
    let paginatedBuildings: any;
    let paginationSettings: any;
    let registrants: number = 0;
    let verified_registrants: number = 0;

    // On page render, check if user is allowed to view, get id
    // If user is not verified then send them to verification, else load buildings and setup paginator
    onMount(async () => {
        partnerRouteGuard()
        id = await userId()
        company_id = await userCompany()
        company_name = await companyName()
        const { data, error } = await supabase.from("partner_verification_status").select().eq("id", id).single()
        if (data.verified == false) {
            goto("/partner/verification")
        } else {
            await loadBuildings(company_id).then(() => {
                paginationSettings = {
                page: 0,
                limit: 10,
                size: $buildings.length,
                amounts: [],
                };
                paginatedBuildings = $buildings.slice(
                paginationSettings.page * paginationSettings.limit,
                paginationSettings.page * paginationSettings.limit + paginationSettings.limit
                );
                $buildings.forEach(building => {
                    registrants += building.registered
                    verified_registrants += building.verified
                });
            })
            isLoading = false
        }
    })

    // Toast messages for success and erorrs
    const s: ToastSettings = {
        message: 'New building added!',
        background: 'variant-filled-success'
    }

    const eP: ToastSettings = {
        message: 'Error adding new building. Ensure PDF is under 2MB.',
        background: 'variant-filled-error'
    }

    const eR: ToastSettings = {
        message: "Error adding new building, please try again.",
        background: 'variant-filled-error'
    }

    const sG: ToastSettings = {
        message: "Copied!",
        background: 'variant-filled-success'
    }

    const eG: ToastSettings = {
        message: "Error, please try again.",
        background: 'variant-filled-error'
    }

    // Listener for changes on the add buildings modal form store
    $: {
        (async () => {
            // If form is complete proceed to add new building
            if ($newBuilding.complete === true && $newBuilding.doc != null) {
                const { data: details, error: firstError } = await supabase.from("buildings").insert({ company_id: company_id, alias: $newBuilding.alias, street: $newBuilding.street, city: $newBuilding.city, postal_code: $newBuilding.postal_code, province: $newBuilding.province }).select().single();
                if (firstError) {
                    toastStore.trigger(eR)
                }
                else {
                    const { data: doc, error: secondError } = await supabase.storage.from("partner_building_doc").upload(`${company_id}/${details.id}.pdf`, $newBuilding.doc, {upsert: false, contentType: 'application/pdf'})
                    if (secondError) {
                        toastStore.trigger(eP)
                    }
                    else if (details && doc) {
                        const { data: update, error: thirdError } = await supabase.from("buildings").update({doc_added: true}).eq("id", details.id)
                        if(thirdError) {
                            toastStore.trigger(eR)
                        }
                        else {
                            // Send data to server for trello
                            const formData = new FormData();
                            formData.append('company_id', company_id);
                            formData.append('alias', $newBuilding.alias);
                            formData.append('building_id', details.id);
                            formData.append('street', $newBuilding.street);
                            formData.append('city', $newBuilding.city);
                            formData.append('postal_code', $newBuilding.postal_code);
                            formData.append('province', $newBuilding.province);
                            try {
                                const response = await fetch("/trello/building", {
                                    method: "POST",
                                    body: formData,
                                });
                                const result = await response.json();
                                const status = JSON.parse(result.data)[1];

                                if (status) {
                                    toastStore.trigger(s)
                                    loadBuildings(company_id).then(() => {
                                        paginationSettings.size = $buildings.length
                                        paginatedBuildings = $buildings.slice(
                                        paginationSettings.page * paginationSettings.limit,
                                        paginationSettings.page * paginationSettings.limit + paginationSettings.limit
                                        );
                                    })
                                }
                                else {
                                    toastStore.trigger(s)
                                    loadBuildings(company_id).then(() => {
                                        paginationSettings.size = $buildings.length
                                        paginatedBuildings = $buildings.slice(
                                        paginationSettings.page * paginationSettings.limit,
                                        paginationSettings.page * paginationSettings.limit + paginationSettings.limit
                                        );
                                    })
                                }
                            }
                            catch (error) {
                                toastStore.trigger(s)
                                loadBuildings(company_id).then(() => {
                                    paginationSettings.size = $buildings.length
                                    paginatedBuildings = $buildings.slice(
                                    paginationSettings.page * paginationSettings.limit,
                                    paginationSettings.page * paginationSettings.limit + paginationSettings.limit
                                    );
                                })
                            }
                        }
                    }
                }
                // Clear store
                newBuilding.set({
                                alias: '',
                                street: '',
                                city: '',
                                postal_code: '',
                                province: '',
                                doc: null,
                                complete: false
                })
            }
        })();
    }

    const modalComponent: ModalComponent = {
        // Pass a reference to your custom component
        ref: AddBuilding,
        // Provide a template literal for the default component slot
        slot: `<AddBuilding>`
    };

    const modal: ModalSettings = {
        type: 'component',
        // Pass the component directly:
        component: modalComponent,
    };

    // Function to Copy Registration link
    function copyRegistrationLink(buildingId: any) {
        navigator.clipboard.writeText("https://app.lutendi.com/register?building=" + buildingId)
        toastStore.trigger(sG)
    }

    // Get company registration code
    function getCompanyRegistrationCode() {
        navigator.clipboard.writeText(company_id)
        toastStore.trigger(sG)
    }

    // Popup on click for each building in table
    const popupClick: PopupSettings = {
        event: 'click',
        target: 'popupClick',
        placement: 'top'
    };

    // Pagination reactivity after initial load
    $: {
        if (isLoading == false) {
            paginatedBuildings = $buildings.slice(
            paginationSettings.page * paginationSettings.limit,
            paginationSettings.page * paginationSettings.limit + paginationSettings.limit
            );
        }
    }
</script>

{#if isLoading == false}
    <div transition:fade class="h-full w-full pl-7 pr-7 p-5 md:pl-20 md:pr-20">
        <div class="flex items-center justify-center w-full">
            <h3 class="h3 pb-1">{company_name} Dashboard</h3>
        </div>

       <hr>

        <div class="card rounded-3xl" data-popup="popupClick">
            <div class="btn-group variant-filled-primary">
                <div class="flex items-center justify-center">
                    <button on:click={() => copyRegistrationLink(selectedBuilding)}>
                        <UserPlus />
                    </button>
                </div>
            </div>
            <div class="arrow variant-filled-primary" />
        </div>

        <div class="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div>
                <Paginator
                    bind:settings={paginationSettings}
                    showFirstLastButtons="{true}"
                    showPreviousNextButtons="{true}"
                />
                <div class="table-container mt-2">
                    <table class="table table-compact table-hover variant-soft">
                        <thead>
                            <tr>
<!--                                <th>ID</th>
-->
                                <th>Alias</th>
                                <th>Address</th>
                                <th class="text-center">Registrants</th>
                                <th class="text-center">Verified</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each paginatedBuildings as building}
<!--                                <tr class="cursor-pointer" in:fade use:popup={popupClick} on:click={() => selectedBuilding = building.id}>
-->                             <tr>    

                                    <!--                                    <td>{building.id}</td>

  -->  
                                    <td>{building.alias}</td>
                                    <td>{building.street}, {building.city}</td>
                                    <td class="text-center text-warning-500">{building.registered}</td>
                                    <td class="text-center text-success-500">{building.verified}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="flex flex-col gap-4">
                <div class="grid grid-cols-2 gap-5 items-center justify-center">
                    <div class="card variant-ghost-surface p-4">
                        <div class="text-center flex flex-col items-center justify-center gap-1">
                            <p class="text-md md:text-lg">Total Registrants</p>
                            <p class="font-bold text-warning-500 text-2xl md:text-3xl">{registrants}</p>
                        </div>
                    </div>
                    <div class="card variant-ghost-surface p-4">
                        <div class="text-center flex flex-col items-center justify-center gap-1">
                            <p class="text-md md:text-lg">Total Verified</p>
                            <p class="font-bold text-success-500 text-2xl md:text-3xl">{verified_registrants}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 class="h4 pb-1">Company Tools</h4>
                    <hr>
                    <div class="flex gap-2 flex-wrap pt-2">
                        <button class="chip variant-ghost-secondary" on:click={() => modalStore.trigger(modal)}>Add Building</button>
                        <button class="chip variant-ghost-secondary" on:click={getCompanyRegistrationCode}>Company Registration Code</button>
                        <a class="chip variant-ghost-tertiary" href="/partner/verified-residents">Verified Residents</a>
                    </div>
                </div>
                <div>
                    <h4 class="h4 pb-1">Document Center</h4>
                    <hr>
                    <div class="flex gap-2 flex-wrap pt-2">
                        <a class="chip variant-ghost-primary" href="https://www.lutendi.com/legal" target="_blank">Legal</a>
                        <a class="chip variant-ghost-primary" href="https://www.lutendi.com/security" target="_blank">Security</a>
                        <a class="chip variant-ghost-secondary" href="https://drive.google.com/file/d/1tMSljAGu1jwL4rwRbyXpNfrhe1Ng2-aO/view?usp=sharing" target="_blank">Partner Onboarding</a>
                        <a class="chip variant-ghost-secondary" href="https://drive.google.com/file/d/1OJCMghy5dbLT_e30GLJVrqPzjSDkg1VD/view" target="_blank">Partner Portal Guide</a>
                        <a class="chip variant-ghost-tertiary" href="https://drive.google.com/file/d/1D0IZ33Fgpb-f3IdO9KeAAaGGD6w5iMli/view?usp=sharing" target="_blank">Resident Portal Guide</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
{:else} 
    <div class="w-full h-full flex items-center justify-center">
        <Spinner />
    </div>
{/if}
