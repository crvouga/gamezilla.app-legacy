<script lang="ts">
  import { dataAccess } from "../data-access";
  import type { IAuthMethod } from "../data-access/auth-data-access.interface";
  import Alert from "../generic/Alert.svelte";
  import Button from "../generic/Button.svelte";
  import Icon from "../generic/Icon.svelte";
  import PageHeader from "../generic/PageHeader.svelte";
  import PageHeaderTitle from "../generic/PageHeaderTitle.svelte";

  let errors: Error[] = [];

  const handleAuth = ({
    authMethod,
  }: {
    authMethod: IAuthMethod;
  }) => async () => {
    errors = await dataAccess.auth.authenticate({ authMethod });
  };
</script>

<PageHeader>
  <PageHeaderTitle>Gamezilla</PageHeaderTitle>
</PageHeader>

<div class="p-2 grid grid-cols-1 gap-2">
  {#each errors as error}
    <Alert>
      <Icon iconName="exclamation-circle" slot="prefix" />
      {error.message}
      <Icon iconName="close" slot="suffix" />
    </Alert>
  {/each}

  <Button on:click={handleAuth({ authMethod: 'email' })} class="w-full">
    <Icon iconName="envelope" slot="prefix" />
    Continue With Email
  </Button>

  <Button on:click={handleAuth({ authMethod: 'google' })} class="w-full">
    <Icon iconName="google" slot="prefix" />
    Continue With Google
  </Button>
</div>
