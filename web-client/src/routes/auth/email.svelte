<script lang="ts" context="module">
  export const prerender = true;
</script>

<script lang="ts">
  import { dataAccess } from "../../data-access";

  import Button from "../../generic/Button.svelte";
  import Icon from "../../generic/Icon.svelte";
  import Link from "../../generic/Link.svelte";
  import PageHeader from "../../generic/PageHeader.svelte";
  import PageHeaderTitle from "../../generic/PageHeaderTitle.svelte";
  import TextField from "../../generic/TextField.svelte";

  let emailAddress = "";

  const handleSubmit = async () => {
    dataAccess.auth.authenticate({ type: "email", emailAddress });
  };
</script>

<PageHeader>
  <Link to="/auth" slot="prefix">
    <Icon iconName="chevron-left" />
  </Link>
  <PageHeaderTitle>Email</PageHeaderTitle>
</PageHeader>

<form class="p-4">
  <TextField
    id="email"
    type="email"
    placeholder="Email Address"
    class="mb-4"
    bind:inputValue={emailAddress} />

  <Button on:click={handleSubmit}>
    <Icon iconName="send" slot="prefix" />
    Send Link
  </Button>
</form>
