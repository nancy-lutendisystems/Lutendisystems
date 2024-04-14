<script lang="ts">
    // Props
    /** Exposes parent props to this component. */
    export let parent: any;

    // Stores
    import { getModalStore } from '@skeletonlabs/skeleton';
    import { newBuilding } from '$lib';
    const modalStore = getModalStore();

    // Function to handle file input change
    function onFileInputChange(event: any) {
        const file = event.target.files[0];
        newBuilding.update((building) => {
            return { ...building, doc: file };
        });
    } 

    // Submit function
    let working = false
    async function onFormSubmit(event: any) {
        if ($newBuilding.alias.trim() !== '' 
            && $newBuilding.street.trim() !== '' 
            && $newBuilding.city.trim() !== '' 
            && $newBuilding.postal_code.trim() !== ''
            && $newBuilding.province.trim() !== ''
            && $newBuilding.doc !== null) {
                working = true
                event.preventDefault()
                newBuilding.update((building) => {
                    return { ...building, complete: true };
                    });
                modalStore.close();
        }
    }

    // Base Classes
    const cBase = 'card p-4 w-modal shadow-xl space-y-4';
    const cHeader = 'text-2xl font-bold';
    const cForm = 'p-4 space-y-4';
</script>

{#if $modalStore[0]}
    <div class="modal-example-form rounded-2xl {cBase}">
        <header class={cHeader}>Add Building</header>
        <article>Enter in the fields below to add a new building to your portfolio</article>
        <form class="modal-form {cForm}" enctype="multipart/form-data">
            <label class="label font-medium">
                <span>Alias<span class="text-red-500">*</span></span>
                <input class="input" type="text" bind:value={$newBuilding.alias} placeholder="Lutendi Condos" required/>
            </label>
            <div>
                <p class="lable font-medium pb-1">Address<span class="text-red-500">*</span></p>
                <div class="grid gap-5 grid-cols-2">
                    <div>
                        <input class="input" name="street" title="Street" type="text" placeholder="Street" required bind:value={$newBuilding.street}>
                    </div>
                    <div>
                        <input class="input" name="city" title="City" type="text" placeholder="City" required bind:value={$newBuilding.city}>
                    </div>
                    <div>
                        <input class="input" name="postal_code" title="Postal Code" type="text" placeholder="Postal Code" required bind:value={$newBuilding.postal_code}>
                    </div>
                    <div>
                        <select class="input" name="province" title="Province" required bind:value={$newBuilding.province}>
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
            <label class="label font-medium">
                <span>Building Verification Document<span class="text-red-500">*</span></span>
                <input name="doc" class="input" type="file" accept=".pdf" on:input={onFileInputChange} required/>
            </label>
            <p>Please provide a copy of one of the following. File must be a <span class="underline text-primary-300 font-bold">PDF</span> under <span class="underline text-primary-300 font-bold">2MB</span>:</p>
                <ul class="list">
                    <li>
                        <span>&rarr;</span>
                        <span class="flex-auto">Filed Property Title</span>
                    </li>
                    <li>
                        <span>&rarr;</span>
                        <span class="flex-auto">Most Recent Filed Property Tax Records</span>
                    </li>
                    <li>
                        <span>&rarr;</span>
                        <span class="flex-auto">Property Insurance Documents</span>
                    </li>
                </ul>
            <footer class="modal-footer {parent.regionFooter}">
                <button class="btn {parent.buttonNeutral}" on:click={() => modalStore.close()}>Cancel</button>
                <button class="btn variant-filled" on:click={onFormSubmit} disabled={working}>Add Building</button>
            </footer>
        </form>
    </div>
<slot></slot>
{/if}