<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { partnerRouteGuard, userCompany } from '../../../hooks.client';
    import { residents, loadResidents, createSearchStore, searchHandler } from '$lib';
    import Spinner from "../../../components/Spinner.svelte";
    import { fade } from "svelte/transition";
    import { Paginator } from '@skeletonlabs/skeleton';

    let isLoading: boolean = true;
    let company_id: any;
    let paginatedResidents: any;
    let paginationSettings: any;
    let searchStore: any;
    let unsubscribe: any;

    onMount(async () => {
        partnerRouteGuard()
        company_id = await userCompany()
        await loadResidents(company_id).then(() => {
            searchStore = createSearchStore($residents)
            unsubscribe = searchStore.subscribe((model: any) => searchHandler(model))
            paginationSettings = {
                page: 0,
                limit: 50,
                size: $searchStore.filtered.length,
                amounts: [],
            };
            paginatedResidents = $searchStore.filtered.slice(
            paginationSettings.page * paginationSettings.limit,
            paginationSettings.page * paginationSettings.limit + paginationSettings.limit
            );
            isLoading = false
        })
    })

    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });

    $: {
        if (isLoading == false) {
            paginatedResidents = $searchStore.filtered.slice(
            paginationSettings.page * paginationSettings.limit,
            paginationSettings.page * paginationSettings.limit + paginationSettings.limit
            );
            paginationSettings.size = $searchStore.filtered.length
        }
    }
</script>


{#if isLoading}
    <div class="w-full h-full flex items-center justify-center">
        <Spinner />
   </div>

{:else}
    <div transition:fade class="h-full w-full pl-7 pr-7 p-5 md:pl-20 md:pr-20">
        <div class="flex flex-col gap-2 items-center justify-between md:flex-row">
            <input class="input w-full md:w-4/12" type="search" placeholder="Search" bind:value={$searchStore.search}>
            <Paginator
                bind:settings={paginationSettings}
                showFirstLastButtons="{true}"
                showPreviousNextButtons="{true}"
            />
        </div>
        
        <div class="table-container mt-2">
            <table class="table table-compact table-hover variant-soft">
                <thead>
                    <tr>
                        <th>Building</th>
                        <th class="text-center">Unit</th>
                        <th class="text-center">Resident Name</th>
                        <th class="text-center">Account Status</th>
                    </tr>
                </thead>
                <tbody>
                    {#each paginatedResidents as resident}
                        <tr in:fade>
                            <td>{resident.alias}</td>
                            <td class="text-center">{resident.unit}</td>
                            <td class="text-center">{resident.full_name}</td>
                            <td class="text-center" class:text-success-500={resident.account_status == "Active"} class:text-error-500={resident.account_status == "Closed"}>{resident.account_status}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
{/if}
