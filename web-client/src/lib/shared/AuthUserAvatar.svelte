<script>
  import Avatar from "$lib/components/Avatar.svelte";
  import { toAvatarUrl } from "$lib/core";
  import { authUserProfileStore } from "$lib/features";

  $: profile = $authUserProfileStore;
</script>

<Avatar src={profile ? toAvatarUrl(profile) : undefined} />
