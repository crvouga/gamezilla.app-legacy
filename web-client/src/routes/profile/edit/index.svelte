<script lang="ts">
  import Avatar from "$lib/components/Avatar.svelte";
  import Button from "$lib/components/Button.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";
  import Select from "$lib/components/Select.svelte";
  import TextField from "$lib/components/TextField.svelte";
  import { dataAccess } from "$lib/data-access";
  import {
    toAvatarSeed,
    toAvatarStyle,
    toAvatarUrl,
  } from "$lib/data-access/profile.interface.ts";
  import { auth } from "$lib/stores";

  let avatarSeed: string = "";
  let avatarStyle: string | null = null;

  auth.subscribe((authState) => {
    if (authState.status === "authenticated") {
      avatarSeed = authState.authUser.avatarSeed;
      avatarStyle = authState.authUser.avatarStyle;
    }
  });

  $: avatarUrl = avatarStyle
    ? toAvatarUrl({
        avatarSeed: toAvatarSeed(avatarSeed),
        avatarStyle: toAvatarStyle(avatarStyle),
      })
    : undefined;

  const handleSubmit = async () => {
    // const {errors } = await dataAccess.profile.update({
    //   avatarSeed: toAvatarSeed(avatarSeed),
    //   avatarStyle: toAvatarStyle(avatarStyle),
    // })
  };
</script>

<PageHeader>
  <Link slot="prefix" to="/auth-user">
    <Icon iconName="chevron-left" />
  </Link>
  <PageHeaderTitle>Edit Profile</PageHeaderTitle>
</PageHeader>

<div class="flex flex-col items-center">
  <Avatar class="w-36 h-36" src={avatarUrl} />
</div>

<div class="p-4">
  <TextField
    class="mb-4"
    label="Avatar Seed"
    bind:inputValue={avatarSeed}
    on:clear={() => {
      avatarSeed = '';
    }} />

  <Button on:click={handleSubmit}>Update</Button>
</div>
