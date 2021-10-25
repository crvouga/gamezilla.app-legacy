<script>
  import Avatar from "$lib/components/Avatar.svelte";
  import { toAvatarUrl } from "$lib/features";
  import { authUserProfileStore } from "$lib/shared";

  let className = "";
  export { className as class };

  $: profile = $authUserProfileStore;
</script>

<Avatar src={profile ? toAvatarUrl(profile) : undefined} class={className} />
