<script lang="ts">
    import { goto } from "$app/navigation";
    import { supabase } from "../../hooks.client";

    import { getToastStore } from '@skeletonlabs/skeleton';
    import type { ToastSettings } from '@skeletonlabs/skeleton';

    const toastStore = getToastStore();

    // Error toast
    const e: ToastSettings = {
        message: 'Failed to update password, please try again',
        background: 'variant-filled-error'
    }

    let p: any;

    // Password update handler, trigger toast on error, on success go to '/' which will then direct to proper route based on role
    const updatePassword = async ( event: any ) => {
        event.preventDefault()
        const { data, error } = await supabase.auth.updateUser({ password: p })
        if (error) {
            toastStore.trigger(e)
        }
        else {
            goto("/")
        }
    }
</script>


<div class="flex min-h-full flex-col justify-center px-5 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="text-center text-2xl font-bold leading-9 tracking-tight">Choose a new password</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <form class="space-y-6" on:submit={updatePassword}>
      <div>
        <div class="mt-2">
          <label class="label font-medium">
              <span>New Password</span>
              <input class="input" name="password" title="Password" type="password" required minlength={0} bind:value={p}/>
          </label>
        </div>
      </div>

      <div>
          <button type="submit" class="flex w-full justify-center btn btn-md variant-filled-primary">Update Password</button>
      </div>
    </form>
  </div>
</div>