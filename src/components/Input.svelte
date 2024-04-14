<script lang="ts">
    export let label: string;
    export let title: string;
    export let type: string;
    export let placeholder: string;
    export let name: string;
    export let maxlength: number;
    export let minlength: number;
</script>

<div>
    <label class="label font-medium">
        <span>{label}<span class="text-red-500">*</span></span>
        <input class="input" name={name} title={title} type={type} placeholder={placeholder} maxlength={maxlength} minlength={minlength} required/>
    </label>
</div>