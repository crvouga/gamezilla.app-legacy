<script lang="ts">
  import { toastStore } from "../App.svelte";
  import { dataAccess } from "../data-access";
  import type { IAuthMethod } from "../data-access/auth-data-access.interface";
  import Button from "../generic/Button.svelte";
  import Icon from "../generic/Icon.svelte";
  import PageHeader from "../generic/PageHeader.svelte";
  import PageHeaderTitle from "../generic/PageHeaderTitle.svelte";

  const handleAuth = ({
    authMethod,
  }: {
    authMethod: IAuthMethod;
  }) => async () => {
    const errors = await dataAccess.auth.authenticate({ authMethod });

    toastStore.push(
      errors.map((error, index) => {
        const id = Date.now();
        return {
          type: "error",
          id: id,
          message: error.message,

          onClose: () => {
            toastStore.remove(id);
          },
        };
      })
    );
  };
</script>

<PageHeader>
  <PageHeaderTitle>Gamezilla</PageHeaderTitle>
</PageHeader>

<div class="p-2 grid grid-cols-1 gap-2">
  <Button on:click={handleAuth({ authMethod: 'email' })} class="w-full">
    <Icon iconName="envelope" slot="prefix" />
    Continue With Email
  </Button>
</div>
