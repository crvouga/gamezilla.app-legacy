<script lang="ts">
  import Clickable from "$lib/components/Clickable.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/shared/PageHeader.svelte";

  let searchInputValue = "";
  let searchText = "";
  let searchInputElement: HTMLInputElement;
  let timer: NodeJS.Timeout;
  const SEARCH_DELAY = 750;

  const handleClear = () => {
    searchText = "";
    searchInputValue = "";
    searchInputElement.focus();
  };

  const setSearchText = (newSearchText: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      searchText = newSearchText;
    }, SEARCH_DELAY);
  };

  $: {
    setSearchText(searchInputValue);
    console.log({ searchText, searchInputValue });
  }
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
    bind:value={searchInputValue} />

  <Clickable slot="suffix" class="ml-4" on:click={handleClear}>
    <Icon iconName="close" />
  </Clickable>
</PageHeader>
