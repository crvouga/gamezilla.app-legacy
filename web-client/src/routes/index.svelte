<script lang="ts">
  import Avatar from "$lib/components/Avatar.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";
  import { toAvatarUrl } from "$lib/data-access";
  import { profile } from "$lib/stores";

  $: profileState = $profile;
</script>

<PageHeader>
  <PageHeaderTitle>Home</PageHeaderTitle>
  <Link slot="suffix" to="/auth-user">
    <Avatar src={profileState ? toAvatarUrl(profileState) : undefined} />
  </Link>
</PageHeader>
