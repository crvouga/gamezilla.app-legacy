<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";
  import TextField from "$lib/components/TextField.svelte";
  import { addToast, errorToToast, signIn } from "$lib/features";

  let emailAddress = "";

  const handleSubmit = async () => {
    const errors = await signIn({
      type: "email",
      emailAddress,
    });

    addToast(errors.map(errorToToast));
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
