<script lang="ts">
    import { supabase } from '../hooks.client';
    import { onMount } from 'svelte';
    import Input from './Input.svelte';
  
    let numofbuildings: number;
    let streets: string[] = [];
    let buildingidaddr: { id: number, street: string }[] = [];
  
    onMount(async () => {
        const { data, error } = await supabase.from("active_buildings").select('id, street');
        if (error) {
            console.error("Error fetching data:", error);
            return;
        }
        if (data) {
            numofbuildings = data.length;
            streets = data.map(item => item.street);
            buildingidaddr = data.map(item => ({ id: item.id, street: item.street }));
        }
    });
  
    let selected: { id: number, street: string } | undefined;
  
    function savelocalstoreage() {
        if (selected) {
            localStorage.setItem('selectedbuildingid', selected.id.toString());
        }
    }
  
  </script>
  
  <select name="myselected" class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm" style="background-color: #374151; border-radius: 25px;" on:change={savelocalstoreage} bind:value={selected}>
      {#each buildingidaddr as buildaddr}
          <option value={buildaddr}>
              {buildaddr.street}
          </option>
      {/each}
  </select>
 