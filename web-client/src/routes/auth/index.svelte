<script lang="ts">
  import Clickable from "$lib/components/Clickable.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Item from "$lib/components/Item.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";
  import { dataAccess } from "$lib/data-access";
  import { stores } from "$lib/stores";
  import { errorToToast } from "$lib/stores/toast";

  const handleAuthSocial = (provider: "google") => async () => {
    const errors = await dataAccess.auth.authenticate({
      type: "social",
      provider,
    });

    stores.toast.enqueue(errors.map(errorToToast));
  };
</script>

<PageHeader>
  <PageHeaderTitle>Sign In</PageHeaderTitle>
</PageHeader>

<Clickable on:click={handleAuthSocial('google')}>
  <Item>
    <Icon iconName="google" slot="start" />
    <Icon iconName="chevron-right" slot="end" />
    Continue With Google
  </Item>
</Clickable>

<!-- <Link to="/auth/phone">
  <Item>
    <Icon iconName="phone" slot="start" />
    <Icon iconName="chevron-right" slot="end" />
    Continue With Phone
  </Item>
</Link>

<Link to="/auth/email">
  <Item>
    <Icon iconName="envelope" slot="start" />
    <Icon iconName="chevron-right" slot="end" />
    Continue With Email
  </Item>
</Link> -->
