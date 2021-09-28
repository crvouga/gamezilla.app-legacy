<script lang="ts">
  import Button from "../generic/Button.svelte";
  import Container from "../generic/Container.svelte";
  import PageBar from "../generic/PageBar.svelte";
  import { authDataAccess, IAuthMethod } from "./auth-data-access";

  let state: "idle" | "loading" = "idle";

  const handleAuth =
    ({ authMethod }: { authMethod: IAuthMethod }) =>
    async () => {
      state = "loading";
      authDataAccess.authenticate({ authMethod });
    };
</script>

<PageBar title="Gamezilla" />

<Container>
  <Button
    fullWidth
    text="Continue With Google"
    onClick={handleAuth({
      authMethod: "google",
    })}
    class="margin-bottom-1"
    iconName="google"
  />
</Container>
