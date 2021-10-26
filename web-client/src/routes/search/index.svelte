<script lang="ts">
  import Avatar from "$lib/components/Avatar.svelte";
  import Clickable from "$lib/components/Clickable.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Item from "$lib/components/Item.svelte";
  import Link from "$lib/components/Link.svelte";
  import { toAvatarUrl } from "$lib/features";
  import type { ISearchResult } from "$lib/features/search";
  import { search } from "$lib/features/search";
  import PageHeader from "$lib/shared/PageHeader.svelte";
  import { onMount } from "svelte";

  let searchInputValue = "";
  let searchText = "";
  let searchInputElement: HTMLInputElement;
  let timer: NodeJS.Timeout;
  const SEARCH_DELAY = 750;
  let searchResults: ISearchResult[] = [];

  const handleClear = () => {
    searchText = "";
    searchInputValue = "";
    searchInputElement.focus();
  };

  onMount(() => {
    searchInputElement.focus();
  });

  const setSearchText = (newSearchText: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      searchText = newSearchText;
    }, SEARCH_DELAY);
  };

  const runSearch = async ({ searchText }: { searchText: string }) => {
    if (searchText.length === 0) {
      return;
    }

    const { results } = await search({
      searchText,
    });

    searchResults = results;
  };

  $: {
    setSearchText(searchInputValue);
  }

  $: {
    runSearch({ searchText });
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

<div class="flex flex-col">
  {#each searchResults as result}
    <Clickable>
      <Item>
        <Avatar slot="start" src={toAvatarUrl(result)} />
        <div>{result.Name}</div>
      </Item>
    </Clickable>
  {/each}
</div>
