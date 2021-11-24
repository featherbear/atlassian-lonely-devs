<script lang="ts">
  export let segment: string;
</script>

<main>
  <slot />
</main>

<style global lang="scss">
  @import "bulma/bulma.sass";
  main {
    position: relative;
    max-width: 80vw;
    background-color: white;
    padding: 2em;
    margin: 0 auto;
    box-sizing: border-box;
  }
</style>
