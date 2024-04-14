<script lang="ts">
    // Flash message
    import { getFlash } from 'sveltekit-flash-message';
    import { page } from '$app/stores';
    const flash = getFlash(page);
</script>


<div class="flex min-h-full flex-col justify-center px-5 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="text-center text-2xl font-bold leading-9 tracking-tight">Enter your email below to reset your password</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <form class="space-y-6" action="/forgot-password" method="POST">
      <div>
        <div class="mt-2">
          <label class="label font-medium">
              <span>Email</span>
              <input class="input" name="email" title="Email" type="email" placeholder="example@domain.com" required/>
          </label>
        </div>
      </div>

      <div>
          <button type="submit" class="flex w-full justify-center btn btn-md variant-filled-primary">Send Link</button>
          {#if $flash}
            {@const text = $flash.type == 'success' ? '#3D9970' : '#FF4136'}
            <div style:color={text} class="flash pt-2 text-center">{$flash.message}</div>
          {/if}
      </div>
    </form>
  </div>
</div>