<script lang="ts">
  import Clickable from "$lib/components/Clickable.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Item from "$lib/components/Item.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";
  import { dataAccess } from "$lib/data-access";
  import { toastStore } from "../__layout.svelte";

  const handleAuthSocial = (provider: "google") => async () => {
    const errors = await dataAccess.auth.authenticate({
      type: "social",
      provider,
    });

    toastStore.push(
      errors.map((error) => ({
        type: "error",
        id: error.message,
        message: error.message,
        onClose: () => {
          toastStore.remove(error.message);
        },
      }))
    );
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
