<script lang="ts">
    import { onMount } from 'svelte';
    import { userEmail } from '../hooks.client';
    import { fade } from "svelte/transition";
    // Props
    /** Exposes parent props to this component. */
    export let parent: any;

    // Stores
    import { getModalStore } from '@skeletonlabs/skeleton';
    const modalStore = getModalStore();
    import { getToastStore } from '@skeletonlabs/skeleton';
    import type { ToastSettings } from '@skeletonlabs/skeleton';
    const toastStore = getToastStore();

    //Get email of user
    let email: any;
    onMount(async () => {
        email = await userEmail()
    })

    // Toast messages for success and erorrs
    const s: ToastSettings = {
        message: "Submitted. We'll reach out shortly.",
        background: 'variant-filled-success'
    }

    const e: ToastSettings = {
        message: 'Submission failed, please try again',
        background: 'variant-filled-error'
    }

    // Variables
    let support_type: string;
    let support_text: string;

    // Submit function
    let working = false
    async function onFormSubmit(event: any) {
        if (email && support_type && support_text) {
            working = true
            const formData = new FormData();
            formData.append("email", email);
            formData.append("type", support_type);
            formData.append("text", support_text);
            try {
                const response = await fetch("/trello/support", {
                    method: "POST",
                    body: formData,
                })
                const result = await response.json();
                const status = JSON.parse(result.data)[1];
                if (status == 200) {
                    toastStore.trigger(s);
                }
                else {
                    toastStore.trigger(e);
                }
            }
            catch (error) {
                toastStore.trigger(e);
            }
        }
        modalStore.close();
    }

    $: {
        if (email && support_type && support_text) {
            working = false
        }
        else {
            working = true
        }
    }

    // Base Classes
    const cBase = 'card p-4 w-modal shadow-xl space-y-4';
    const cHeader = 'text-2xl font-bold';
    const cForm = 'p-4 space-y-4';
</script>

{#if $modalStore[0]}
    <div class="modal-example-form rounded-2xl {cBase}">
        <header class={cHeader}>Support Ticket</header>
        <article>Please enter in the details below to open up a support ticket</article>
        <form class="modal-form {cForm}">
            <div>
                <select class="input" name="support-type" title="Support Type" required bind:value={support_type}>
                    <option value="" disabled selected>Support Type</option>
                    <option value="General">General</option>
                    <option value="Dispute">Dispute</option>
                    <option value="Change Building">Change Building</option>
                    <option value="Move Out">Move Out</option>
                    <option value="Close Account">Close Account</option>
                    <option value="Registration">Verification</option>
                </select>
            </div>
            {#if support_type == "General"}
                <p in:fade>What can we help you with?</p>
            {:else if support_type == "Dispute"}
                <p in:fade>Please provide the date of the payment you would like to dispute.</p>
            {:else if support_type == "Change Building"}
                <p in:fade>Please provide your new Building ID.</p>
            {:else if support_type == "Move Out"}
                <p in:fade>Please provide your move out date.</p>
            {:else if support_type == "Close Account"}
                <p in:fade><span class="underline">Closing your account will stop positive rental reporting</span>. If you wish to continue enter the date you wish to close your account by.</p>
            {:else if support_type == "Registration"}
                <p in:fade>What can we help you with?</p>
            {:else}
                <p in:fade>Please choose a support type.</p>
            {/if}

            <label class="label font-medium">
                <span>Details<span class="text-red-500">*</span></span>
                <textarea class="textarea" rows={4} bind:value={support_text} placeholder="Details regarding your support ticket" required/>
            </label>

            <footer class="modal-footer {parent.regionFooter}">
                <button class="btn {parent.buttonNeutral}" on:click={() => modalStore.close()}>Cancel</button>
                <button class="btn variant-filled" on:click={onFormSubmit} disabled={working}>Submit</button>
            </footer>
        </form>
    </div>
<slot></slot>
{/if}