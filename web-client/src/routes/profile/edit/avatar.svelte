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
    IProfile,
    setProfile,
    createAvatarUrl,
    parseAvatarUrl,
  } from "$lib/features";
  import { authUserProfileStore, enqueueToast } from "$lib/shared";
  import PageHeader from "$lib/shared/PageHeader.svelte";
  import PageHeaderUnsavedChanges from "$lib/shared/PageHeaderUnsavedChanges.svelte";

  let profile: IProfile;
  $: profile = $authUserProfileStore;

  let avatarStyle: IAvatarStyle;
  let avatarSeed: IAvatarSeed;

  let parsedAvatarUrl: ReturnType<typeof parseAvatarUrl>;

  authUserProfileStore.subscribe((profile) => {
    if (profile) {
      parsedAvatarUrl = parseAvatarUrl(profile.avatarUrl);
    }
  });

  $: {
    console.log({
      parsedAvatarUrl,
    });
  }

  $: avatarUrl = createAvatarUrl({ avatarSeed, avatarStyle });

  $: isTouched = false;

  const handleSubmit = async () => {
    await setProfile({
      ...profile,
      avatarUrl: createAvatarUrl({
        avatarSeed,
        avatarStyle,
      }),
    });

    enqueueToast([
      {
        type: "success",
        message: "Updated avatar",
      },
    ]);
  };

  const handleCancel = () => {};
</script>

{#if isTouched}
  <PageHeaderUnsavedChanges on:cancel={handleCancel} on:save={handleSubmit} />
{:else}
  <PageHeader title="Edit Avatar">
    <Link slot="prefix" to="/profile/edit">
      <Icon iconName="chevron-left" />
    </Link>
  </PageHeader>
{/if}

<div class="overflow-y-scroll">
  <div class="flex flex-col items-center pt-4">
    <Avatar class="w-52 h-52" src={avatarUrl} />
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
