<script lang="ts">
  export let placeholder: string | undefined;
  let className: string | undefined = undefined;
  export { className as class };
</script>

<input
  type="text"
  {placeholder}
  class="{className} px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-base border-0 shadow outline-none focus:outline-none focus:ring w-full" />
