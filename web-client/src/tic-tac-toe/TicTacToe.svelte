<script lang="ts">
  import Line from "./Line.svelte";
  let className: string;
  export { className as class };
</script>

<svg
  width="100%"
  viewBox="0 0 3 3"
  xmlns="http://www.w3.org/2000/svg"
  class={className}>
  <Line start={[1, 0]} end={[1, 3]} />

  <Line start={[2, 0]} end={[2, 3]} />

  <Line start={[0, 1]} end={[3, 1]} />

  <Line start={[0, 2]} end={[3, 2]} />
</svg>
