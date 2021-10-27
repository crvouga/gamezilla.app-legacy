<script lang="ts">
  import Avatar from "$lib/components/Avatar.svelte";
  import Button from "$lib/components/Button.svelte";
  import Select from "$lib/components/FormSelect.svelte";
  import SelectOption from "$lib/components/FormSelectOption.svelte";
  import TextField from "$lib/components/FormTextInput.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import {
    ALL_AVATAR_STYLES,
    formatAvatarStyle,
    generateAvatarSeed,
    IAvatarSeed,
    IAvatarStyle,
    IName,
    IProfile,
    setProfile,
    toAvatarUrl,
  } from "$lib/features";
  import { authUserProfileStore, enqueueToast } from "$lib/shared";
  import PageHeader from "$lib/shared/PageHeader.svelte";
  import PageHeaderTitle from "$lib/shared/PageHeaderTitle.svelte";

  let currentProfile: IProfile;
  let draftProfile: IProfile;

  let name: IName;
  let avatarStyle: IAvatarStyle;
  let avatarSeed: IAvatarSeed;

  $: {
    draftProfile = {
      ...currentProfile,
      avatarStyle,
      avatarSeed,
      name,
    };
  }

  authUserProfileStore.subscribe((profile) => {
    if (profile) {
      currentProfile = profile;
      name = profile.name;
      avatarStyle = profile.avatarStyle;
      avatarSeed = profile.avatarSeed;
      draftProfile = profile;
    }
  });

  const handleSubmit = async () => {
    await setProfile(draftProfile);

    enqueueToast([
      {
        type: "success",
        message: "Updated profile",
      },
    ]);
  };

  $: avatarUrl = avatarStyle
    ? toAvatarUrl({ avatarSeed, avatarStyle })
    : undefined;

  $: isTouched =
    currentProfile?.avatarSeed !== avatarSeed ||
    currentProfile?.avatarStyle !== avatarStyle ||
    currentProfile?.name !== name;

  $: {
    console.log({ currentProfile, avatarSeed, name });
  }
  import { slide } from "svelte/transition";
</script>

{#if isTouched}
  <div
    transition:slide
    class="w-full h-12 bg-yellow-200 flex items-center px-4">
    <PageHeaderTitle>Unsaved Changes</PageHeaderTitle>
    <Button>Cancel</Button>
    <Button on:click={handleSubmit}>Save</Button>
  </div>
{:else}
  <div transition:slide>
    <PageHeader>
      <Link slot="prefix" to="/auth-user">
        <Icon iconName="chevron-left" />
      </Link>
      <PageHeaderTitle>Edit Profile</PageHeaderTitle>
    </PageHeader>
  </div>
{/if}

<div class="overflow-y-scroll">
  <div class="p-4">
    <TextField label="Name" bind:value={name} />
  </div>
  <div class="flex flex-col items-center pt-4">
    <Avatar class="w-36 h-36" src={avatarUrl} />
  </div>

  <div class="p-4">
    <Select label="Avatar Style" class="mb-4" bind:value={avatarStyle}>
      {#each ALL_AVATAR_STYLES as avatarStyle}
        <SelectOption value={avatarStyle}>
          {formatAvatarStyle(avatarStyle)}
        </SelectOption>
      {/each}
    </Select>
    <TextField class="mb-2" label="Avatar Seed" bind:value={avatarSeed} />

    <Button on:click={() => (avatarSeed = generateAvatarSeed())} class="mb-4">
      Generate Random Seed
    </Button>
  </div>
</div>
