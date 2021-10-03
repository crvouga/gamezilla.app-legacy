<script lang="ts">
  export let src: string;
  export let alt: string;
</script>

<style>
  img {
    border-radius: 50%;
    width: 100%;
    height: 100%;
    /* max-width: 120px;
    max-height: 120px; */
    background-color: var(--surface-color);
  }
</style>

<img {src} {alt} />
