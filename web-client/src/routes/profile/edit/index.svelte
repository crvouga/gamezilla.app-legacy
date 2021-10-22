<script lang="ts">
  import Avatar from "$lib/components/Avatar.svelte";
  import Button from "$lib/components/Button.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";
  import TextField from "$lib/components/TextField.svelte";
  import {
    dataAccess,
    toAvatarSeed,
    toAvatarStyle,
    toAvatarUrl,
  } from "$lib/data-access";
  import { profile, toast } from "$lib/stores";

  let avatarSeed: string = "";
  let avatarStyle: string | null = null;

  $: profileState = $profile;

  profile.subscribe((profile) => {
    if (profile) {
      avatarSeed = profile.avatarSeed;
      avatarStyle = profile.avatarStyle;
    }
  });

  $: avatarUrl = avatarStyle
    ? toAvatarUrl({
        avatarStyle: toAvatarStyle(avatarStyle),
        avatarSeed: toAvatarSeed(avatarSeed),
      })
    : undefined;

  const handleSubmit = async () => {
    const { errors } = await dataAccess.profiile.update({
      userId: profileState.userId,
      avatarSeed: toAvatarSeed(avatarSeed),
      avatarStyle: toAvatarStyle(avatarStyle),
    });

    toast.enqueue([
      {
        id: "updated-avatar",
        type: "success",
        message: "Updated avatar",
      },
    ]);
  };
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
  <TextField
    label="Avatar Seed"
    bind:inputValue={avatarSeed}
    on:clear={() => {
      avatarSeed = '';
    }} />

  <Button on:click={handleSubmit}>Update</Button>
</div>
