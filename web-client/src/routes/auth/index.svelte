<script lang="ts" context="module">
  export const prerender = true;
</script>

<script lang="ts">
  import { dataAccess } from "../../data-access";

  import type { IAuthMethod } from "../../data-access/auth-data-access.interface";
  import Clickable from "../../generic/Clickable.svelte";

  import Icon from "../../generic/Icon.svelte";
  import Item from "../../generic/Item.svelte";
  import Link from "../../generic/Link.svelte";
  import PageHeader from "../../generic/PageHeader.svelte";
  import PageHeaderTitle from "../../generic/PageHeaderTitle.svelte";
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
