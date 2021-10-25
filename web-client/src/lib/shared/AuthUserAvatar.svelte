<script>
  import Avatar from "$lib/components/Avatar.svelte";
  import { toAvatarUrl } from "$lib/features";
  import { authUserProfileStore } from "$lib/shared";

  $: profile = $authUserProfileStore;
</script>

<Avatar src={profile ? toAvatarUrl(profile) : undefined} />
