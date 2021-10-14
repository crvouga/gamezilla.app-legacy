<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Item from "$lib/components/Item.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";
</script>

<PageHeader>
  <PageHeaderTitle>Home</PageHeaderTitle>
</PageHeader>

<div class="p-2">
  <Button>
    <Icon slot="prefix" iconName="gamepad" />
    Create Lobby
  </Button>
</div>

<Link to="/unauth">
  <Item>
    Sign Out
    <Icon slot="end" iconName="sign-out" />
  </Item>
</Link>

<Link to="/auth">
  <Item>
    Sign In
    <Icon slot="end" iconName="sign-out" />
  </Item>
</Link>
