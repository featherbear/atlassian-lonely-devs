<script lang="ts">
import { onMount } from "svelte";


  let isRunning: boolean = false;
  let interval: any;
  let remainingTime: number = 0;

  export let startOnLoad: number;

  export function start(seconds: number) {
    if (isRunning) stop();

    remainingTime = seconds;
    isRunning = true;
    interval = setInterval(function () {
      if (remainingTime) {
        remainingTime--;
      } else {
        stop();
      }
    }, 1000);
  }

  export function stop() {
    clearInterval(interval);
    interval = null;
    isRunning = false;
  }

  onMount(() => {
      if (startOnLoad) start(startOnLoad)
  })
</script>

{#if remainingTime}
  (refreshing in {remainingTime}s)
{:else}
  (refreshing...)
{/if}
