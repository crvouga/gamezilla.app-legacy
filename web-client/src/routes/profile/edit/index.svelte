<script lang="ts">
  import Select from "$lib/components/Select.svelte";
  import Avatar from "$lib/components/Avatar.svelte";
  import Button from "$lib/components/Button.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";
  import TextField from "$lib/components/TextField.svelte";
  import {
    toAvatarStyle,
    toAvatarSeed,
    toAvatarUrl,
    toUserId,
    IUserId,
    AvatarStyles,
    IAvatarSeed,
  } from "$lib/core";
  import {
    addToast,
    authStateStore,
    authUserProfileStore,
    changeAvatar,
  } from "$lib/features";
  import { generateUniqueId } from "$lib/utility";
  import SelectOption from "$lib/components/SelectOption.svelte";

  let userId: IUserId;

  authStateStore.subscribe((authState) => {
    if (authState.status === "authenticated") {
      userId = authState.authUser.userId;
    }
  });

  let avatarSeed: IAvatarSeed | null = null;
  let avatarStyle: AvatarStyles | null = null;

  authUserProfileStore.subscribe((profile) => {
    if (profile) {
      avatarSeed = profile.avatarSeed;
      avatarStyle = profile.avatarStyle;
    }
  });

  const handleSubmit = async () => {
    if (userId) {
      await changeAvatar({
        userId: toUserId(userId),
        avatarStyle: toAvatarStyle(avatarStyle),
        avatarSeed: toAvatarSeed(avatarSeed),
      });

      addToast([
        {
          id: generateUniqueId(),
          type: "success",
          message: "Changed avatar",
        },
      ]);
    }
  };

  $: avatarUrl = avatarStyle
    ? toAvatarUrl({
        avatarStyle: toAvatarStyle(avatarStyle),
        avatarSeed: toAvatarSeed(avatarSeed),
      })
    : undefined;
</script>

<PageHeader>
  <Link slot="prefix" to="/auth-user">
    <Icon iconName="chevron-left" />
  </Link>
  <PageHeaderTitle>Edit Profile</PageHeaderTitle>
</PageHeader>

<div class="flex flex-col items-center pt-4">
  <Avatar class="w-36 h-36" src={avatarUrl} />
</div>

<div class="p-4">
  <Select label="Avatar Style" class="mb-4" bind:value={avatarStyle}>
    {#each Object.keys(AvatarStyles) as avatarStyle}
      <SelectOption value={avatarStyle}>{avatarStyle}</SelectOption>
    {/each}
  </Select>
  <TextField class="mb-2" label="Avatar Seed" bind:inputValue={avatarSeed} />

  <Button
    on:click={() => {
      avatarSeed = toAvatarSeed(generateUniqueId());
    }}
    class="mb-4">
    Generate Random Seed
  </Button>
  <Button on:click={handleSubmit}>Update</Button>
</div>
