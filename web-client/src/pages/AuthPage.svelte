<script lang="ts">
  import { dataAccess } from "../data-access";
  import type { IAuthMethod } from "../data-access/auth-data-access.interface";
  import Button from "../generic/Button.svelte";

  const handleAuth = ({
    authMethod,
  }: {
    authMethod: IAuthMethod;
  }) => async () => {
    dataAccess.auth.authenticate({ authMethod });
  };
</script>

<div class="p-2 h-screen grid place-items-center">
  <div class="w-full">
    <h1 class="text-3xl font-bold text-center mb-2">Gamezilla</h1>
    <Button on:click={handleAuth({ authMethod: 'google' })} class="w-full mb-1">
      Continue With Google
    </Button>
  </div>
</div>
