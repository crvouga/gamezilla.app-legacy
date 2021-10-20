<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";
  import TextField from "$lib/components/TextField.svelte";
  import { dataAccess, stores } from "$lib/data-access";
  import { errorToToast } from "$lib/data-access/stores/toast";

  let emailAddress = "";

  const handleSubmit = async () => {
    const errors = await dataAccess.auth.authenticate({
      type: "email",
      emailAddress,
    });

    stores.toast.enqueue(errors.map(errorToToast));
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
