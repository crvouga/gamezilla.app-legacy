<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import Item from "$lib/components/Item.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/shared/PageHeader.svelte";
  import PageHeaderTitle from "$lib/shared/PageHeaderTitle.svelte";
  import AuthUserAvatar from "$lib/shared/AuthUserAvatar.svelte";
</script>

<PageHeader>
  <Link slot="prefix" to="/">
    <Icon iconName="chevron-left" />
  </Link>
  <PageHeaderTitle>
    <AuthUserAvatar />
  </PageHeaderTitle>
</PageHeader>

<Link to="/profile/edit">
  <Item>
    <Icon slot="start" iconName="user-edit" />
    Edit Profile
    <Icon slot="end" iconName="chevron-right" />
  </Item>
</Link>

<Link to="/unauth">
  <Item class="text-blue-500">
    <Icon slot="start" iconName="sign-out" />
    Sign Out
  </Item>
</Link>
