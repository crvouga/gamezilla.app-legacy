<script lang="ts">
  import Clickable from "$lib/components/Clickable.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/shared/PageHeader.svelte";

  let searchText = "";

  let searchInputElement: HTMLInputElement;
  const handleClear = () => {
    searchText = "";
    searchInputElement.focus();
  };
</script>

<PageHeader>
  <Link slot="prefix" to="/">
    <Icon iconName="chevron-left" />
  </Link>

  <input
    type="text"
    class="text-base flex-1 w-full focus:outline-none"
    placeholder="Search"
    bind:this={searchInputElement}
    bind:value={searchText} />

  <Clickable slot="suffix" class="ml-4" on:click={handleClear}>
    <Icon iconName="close" />
  </Clickable>
</PageHeader>
