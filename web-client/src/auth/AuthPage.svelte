<script lang="ts">
  import { getContext } from "svelte";
  import Button from "../generic/Button.svelte";
  import Container from "../generic/Container.svelte";
  import PageBar from "../generic/PageBar.svelte";
  import type { IAuthMethod } from "./auth-data-access";

  const { authDataAccess } = getContext("auth");

  const handleAuth = ({
    authMethod,
  }: {
    authMethod: IAuthMethod;
  }) => async () => {
    authDataAccess.authenticate({ authMethod });
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
