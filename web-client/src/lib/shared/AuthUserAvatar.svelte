<script>
  import Avatar from "$lib/components/Avatar.svelte";
  import { authUserProfileStore } from "$lib/shared";

  let className = "";
  export { className as class };

  $: profile = $authUserProfileStore;
</script>

<Avatar src={profile?.avatarUrl} class={className} />
