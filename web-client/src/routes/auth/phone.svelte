<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";
  import TextField from "$lib/components/TextField.svelte";
  import { addToast, errorToToast, signIn } from "$lib/features";
  import { cleanPhoneNumber } from "$lib/utility";

  let phoneNumber = "";

  const handleSubmit = async () => {
    const errors = await signIn({
      type: "phone",
      phoneNumber: cleanPhoneNumber(phoneNumber),
    });

    addToast(errors.map(errorToToast));
  };
</script>

<PageHeader>
  <Link to="/auth" slot="prefix">
    <Icon iconName="chevron-left" />
  </Link>
  <PageHeaderTitle>Phone</PageHeaderTitle>
</PageHeader>

<form class="p-4">
  <TextField
    id="phone-number"
    type="tel"
    inputMode="tel"
    placeholder="Mobile Phone Number"
    bind:inputValue={phoneNumber}
    on:clear={() => {
      phoneNumber = '';
    }}
    class="mb-4" />

  <Button on:click={handleSubmit}>
    <Icon iconName="sms" slot="prefix" />
    Send Link
  </Button>
</form>
