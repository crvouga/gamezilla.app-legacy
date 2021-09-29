<script lang="ts">
  import { dataAccess } from "../data-access";
  import type { IAuthMethod } from "../data-access/auth-data-access.interface";
  import Button from "../generic/Button.svelte";
  import Container from "../generic/Container.svelte";
  import PageBar from "../generic/PageBar.svelte";

  const handleAuth = ({
    authMethod,
  }: {
    authMethod: IAuthMethod;
  }) => async () => {
    dataAccess.auth.authenticate({ authMethod });
  };
</script>

<PageBar title="Gamezilla" />

<Container>
  <Button
    fullWidth
    text="Continue With Google"
    onClick={handleAuth({ authMethod: 'google' })}
    class="margin-bottom-1"
    iconName="google" />
</Container>
