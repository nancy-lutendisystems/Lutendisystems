<script lang="ts">
    import { supabase, userRole } from "../hooks.client";
    import { goto } from "$app/navigation";
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    // Flash message
    import { getFlash } from 'sveltekit-flash-message';
    import { page } from '$app/stores';
    const flash = getFlash(page);

    // When rendered check user role (if logged in) and direct to proper route
    onMount(async () => {
        const role = await userRole()
        if (role == "Partner") {
            goto('/partner/dashboard')
        }
        else if (role == "Resident") {
            goto('/resident/dashboard')
        }
    })

    let errorMsg = 0
    let e = ""
    let p = ""

    // Handle login and direct to proper route based user role
    const loginHandler = async (event: any) => {
        event.preventDefault()
        const { data, error } = await supabase.auth.signInWithPassword({
                email: e,
                password: p 
        })
        if (error) {
                if (error.status === 400) {
                    errorMsg = 1
                }
            }
            else {
                const role = await userRole()
                if (role == "Partner") {
                    goto('/partner/dashboard')
                }
                else if (role == "Resident") {
                    goto('/resident/dashboard')
                }
            }
    }
</script>

<div class="flex min-h-full flex-col justify-center px-5 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="text-center text-2xl font-bold leading-9 tracking-tight">Sign in to your account</h2>
    </div>
  
    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <form class="space-y-6" on:submit={loginHandler}>
      <div>
        <div class="mt-2">
          <label class="label font-medium">
              <span>Email<span class="text-red-500">*</span></span>
              <input class="input" name="email" title="Email" type="email" placeholder="example@domain.com" autocomplete="username" required bind:value={e}/>
          </label>
        </div>
      </div>
  
      <div>
        <div class="mt-2">
          <label class="label font-medium">
              <span>Password<span class="text-red-500">*</span></span>
              <input class="input" name="password" title="Password" type="password" autocomplete="current-password" required bind:value={p}/>
          </label>
          {#if errorMsg === 1}
              <p transition:fade class="text-red-500">Invalid credentials</p>
          {:else if $flash }
            {@const text = $flash.type == 'success' ? '#3D9970' : '#FF4136'}
            <div style:color={text} class="flash">{$flash.message}</div>
          {/if}
        </div>
      </div>

      <div class="flex gap-4">
          <a href="/forgot-password" class="flex w-full justify-center btn btn-md variant-outline-primary">Forgot Password</a>
          <button type="submit" class="flex w-full justify-center btn btn-md variant-filled-primary">Sign In</button>
      </div>
    </form>
  
      <p class="mt-10 text-center text-sm">
        Don't have an account?
        <a href="/register" class="font-semibold leading-6 text-secondary-600 hover:text-secondary-500">Click here register</a>
      </p>
    </div>
  </div>