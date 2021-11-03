<script lang="ts">
  import TextField from "$lib/components/FormTextInput.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import type { IName, IProfile } from "$lib/features";
  import { setProfile } from "$lib/features";
  import { authUserProfileStore, enqueueToast } from "$lib/shared";
  import AuthUserAvatar from "$lib/shared/AuthUserAvatar.svelte";
  import PageHeader from "$lib/shared/PageHeader.svelte";
  import PageHeaderUnsavedChanges from "$lib/shared/PageHeaderUnsavedChanges.svelte";

  let profile: IProfile;
  $: profile = $authUserProfileStore;

  let name: IName;

  authUserProfileStore.subscribe((profile) => {
    if (profile) {
      name = profile.name;
    }
  });

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

{#if isTouched}
  <PageHeaderUnsavedChanges on:cancel={handleCancel} on:save={handleSubmit} />
{:else}
  <PageHeader title="Edit Profile">
    <Link slot="prefix" to="/auth-user">
      <Icon iconName="chevron-left" />
    </Link>
  </PageHeader>
{/if}

<div class="flex flex-col items-center pt-4">
  <Link to="/profile/edit/avatar" class="flex flex-col items-center">
    <AuthUserAvatar class="w-24 h-24" />

    <div class="font-bold mt-2 text-blue-600">Edit Avatar</div>
  </Link>
</div>

<div class="p-4">
  <TextField class="mb-4" label="Name" bind:value={name} />
</div>
