<script lang="ts">
    import '../app.postcss';
    import { AppShell, AppBar, Modal, Toast } from '@skeletonlabs/skeleton';
    import { initializeStores } from '@skeletonlabs/skeleton';

    // Floating UI for Popups
    import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
    import { storePopup } from '@skeletonlabs/skeleton';
    storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

    import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
    import { createUserTokenStore, getUserTokenStore } from '$lib';
    import { supabase } from '../hooks.client';
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';

    createUserTokenStore();
    const userTokenStore = getUserTokenStore();

    // Stores
    initializeStores();

    // When auth state changes, update the user session token
    supabase.auth.onAuthStateChange( (event: AuthChangeEvent, session: Session | null) => {
        $userTokenStore = session?.access_token
    })

    // Handle logout an send back to '/'
    const logoutHandler = async () => {
        const { error } = await supabase.auth.signOut()
        if (!error) {
            goto("/")
        }
    }
</script>

<Toast />
<Modal />

<!-- App Shell -->
<AppShell>
    <svelte:fragment slot="header">
        <!-- App Bar -->
        <AppBar class="pl-7 pr-7 p-5 md:pl-20 md:pr-20">
            <svelte:fragment slot="lead">
                <a href="/"><strong class="text-2xl"><span class="bg-gradient-to-br from-primary-500 to-secondary-300 bg-clip-text text-transparent box-decoration-clone">Lutendi</span></strong></a>
            </svelte:fragment>
            <svelte:fragment slot="trail">
                {#if $userTokenStore}
                    <button in:fade on:click={logoutHandler} class="btn btn-sm variant-ghost-surface">
                        Sign Out
                    </button>
                {:else}
                    <a in:fade class="btn btn-sm variant-ghost-surface" href="mailto:support@lutedisystems.com">
                        Support
                    </a>
                {/if}
            </svelte:fragment>
        </AppBar>
    </svelte:fragment>
    <!-- Page Route Content -->
    <slot />
</AppShell>
