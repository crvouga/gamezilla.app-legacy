<script lang="ts">
  import Clickable from "$lib/components/Clickable.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Item from "$lib/components/Item.svelte";
  import { errorToToast } from "$lib/components/toaster";
  import { signIn } from "$lib/features";
  import { enqueueToast } from "$lib/shared";
  import PageHeader from "$lib/shared/PageHeader.svelte";

  const handleSocialAuth = (provider: "google") => async () => {
    const errors = await signIn({
      type: "social",
      provider,
    });

    enqueueToast(errors.map(errorToToast));
  };
</script>

<PageHeader title="Sign In" />

<Clickable on:click={handleSocialAuth('google')}>
  <Item>
    <Icon iconName="google" slot="start" />
    <Icon iconName="chevron-right" slot="end" />
    Continue With Google
  </Item>
</Clickable>
