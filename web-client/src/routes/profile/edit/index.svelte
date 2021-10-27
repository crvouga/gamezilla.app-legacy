<script lang="ts">
  import Avatar from "$lib/components/Avatar.svelte";
  import Button from "$lib/components/Button.svelte";
  import TextField from "$lib/components/FormTextInput.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import type { IName, IProfile } from "$lib/features";
  import { setProfile, toAvatarUrl } from "$lib/features";
  import { authUserProfileStore, enqueueToast } from "$lib/shared";
  import PageHeader from "$lib/shared/PageHeader.svelte";

  let profile: IProfile;
  $: profile = $authUserProfileStore;

  let name: IName;

  authUserProfileStore.subscribe((profile) => {
    if (profile) {
      name = profile.name;
    }
  });

  $: avatarUrl = profile ? toAvatarUrl(profile) : undefined;
  $: isTouched = profile?.name !== name;

  const handleCancel = () => {
    name = profile.name;
  };

  const handleSubmit = async () => {
    await setProfile({
      ...profile,
      name,
    });

    enqueueToast([
      {
        type: "success",
        message: "Updated profile",
      },
    ]);
  };
</script>

<PageHeader title="Edit Profile">
  <Link slot="prefix" to="/auth-user">
    <Icon iconName="chevron-left" />
  </Link>
</PageHeader>

<div class="flex flex-col items-center pt-4">
  <Link to="/profile/edit/avatar" class="flex flex-col items-center">
    <Avatar class="w-24 h-24" src={avatarUrl} />

    <div class="font-bold mt-2 text-blue-600">Edit Avatar</div>
  </Link>
</div>

<div class="p-4">
  <TextField class="mb-4" label="Name" bind:value={name} />
  <div class="flex">
    <Button class="mr-2" on:click={handleCancel}>Cancel</Button>
    <Button on:click={handleSubmit}>Save Changes</Button>
  </div>
</div>
