<script>
    import { page } from '$app/stores';
</script>

<div class="h-full w-full pl-7 pr-7 p-5 md:pl-20 md:pr-20 flex flex-col items-center">
    <h2 class="h2 pb-5">Something went wrong :/</h2>
    {#if $page.status == 404}
        <p class="pb-5">This page does not exist</p>
    {:else if ($page.error)}
        <p class="pb-5">{$page.error.message}</p>
    {/if}
    <div class="flex">
        <button type="button" class="btn btn-lg variant-filled-primary"><a href="/">Back</a></button>
    </div>
</div>