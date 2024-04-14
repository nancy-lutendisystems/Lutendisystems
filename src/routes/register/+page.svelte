<script lang="ts">
    import Input from "../../components/Input.svelte";
    import { fade } from 'svelte/transition';

    

    import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
    let role: number = 0;

    // Flash message
    import { getFlash } from 'sveltekit-flash-message';
    import { page } from '$app/stores';
    const flash = getFlash(page);

    let submit: boolean = false;
    function submitTimeout() {
        submit = true;
        setTimeout(() => {
            submit = false;
        }, 5000);
    }
</script>

<div class="flex min-h-full flex-col justify-center px-5 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="text-center text-2xl font-bold leading-9 tracking-tight">Create an account</h2>
    </div>
  
    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" action="/register" method="POST" on:submit={submitTimeout}>
        <div>
          <div class="mt-2">
            <Input name="email" label="Email" title="Email" type="email" placeholder="example@domain.com" maxlength={255} minlength={0}></Input>
          </div>
        
        </div>
  
        <div>
          <div class="mt-2">
            <Input name="password" label="Password" title="Password" type="password" placeholder="" maxlength={72} minlength={8}></Input>
          </div>
        </div>

        <div>
            <div class="mt-2">
                <p class="font-medium">I am registering as a...</p>
                <RadioGroup>
                    <RadioItem bind:group={role} name="role" value={0}>Resident</RadioItem>
                    <RadioItem bind:group={role} name="role" value={1}>Partner</RadioItem>
                </RadioGroup>
            </div>
        </div>

        {#if role == 0}
            <div in:fade>
                <div class="mt-2">
                    <label class="label font-medium">
                        <span>Building ID<span class="text-red-500">*</span></span>
                        <input class="input" name="building-id" title="Building ID" type="text" placeholder="XXXXXXXX" minlength={8} maxlength={8} required bind:value={$page.data.buildingId}/>
                    </label>
                    {#if $flash}
                        {@const text = $flash.type == 'success' ? '#3D9970' : '#FF4136'}
                        <div style:color={text} class="flash">{$flash.message}</div>
                    {/if}
                </div>
            </div>
        {/if}
  
        <div>
            <button type="submit" class="flex w-full justify-center btn btn-md variant-filled-primary" disabled={submit}>Register</button>
        </div>
      </form>
  
      <p class="mt-10 text-center text-sm">
        Already have an account?
        <a href="/" class="font-semibold leading-6 text-secondary-600 hover:text-secondary-500">Click here sign in</a>
      </p>
    </div>
</div>