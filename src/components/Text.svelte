<script lang="ts">
    export let label: string;
    export let title: string;
    export let placeholder: string;
    export let name: string;
</script>

<label class="label font-medium">
    <span>{label}</span>
    <textarea name={name} title={title} class="textarea" rows=4 placeholder={placeholder} required/>
</label>