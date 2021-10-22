<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import Item from "$lib/components/Item.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";
</script>

<PageHeader>
  <Link slot="prefix" to="/">
    <Icon iconName="chevron-left" />
  </Link>
  <PageHeaderTitle>Profile</PageHeaderTitle>
</PageHeader>

<Link to="/auth-user/unauth">
  <Item class="text-color-blue-500">
    <Icon slot="start" iconName="sign-out" />
    Sign Out
  </Item>
</Link>
