<script lang="ts">
  import Avatar from "$lib/components/Avatar.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Item from "$lib/components/Item.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";
  import { toAvatarUrl } from "$lib/data-access/profile.interface";
  import { auth } from "$lib/stores";

  $: authState = $auth;
</script>

<PageHeader>
  <Link slot="prefix" to="/">
    <Icon iconName="chevron-left" />
  </Link>
  <PageHeaderTitle>
    <Avatar
      src={authState.status === 'authenticated' ? toAvatarUrl(authState.authUser) : undefined} />
  </PageHeaderTitle>
</PageHeader>

<Link to="/profile/edit">
  <Item class="text-color-blue-500">
    <Icon slot="start" iconName="user-edit" />
    Edit Profile
  </Item>
</Link>

<Link to="/unauth">
  <Item class="text-color-blue-500">
    <Icon slot="start" iconName="sign-out" />
    Sign Out
  </Item>
</Link>
