<script lang="ts" context="module">
  export const prerender = true;

  const cleanPhoneNumber = (input: string) => {
    return input.replace(/\D/g, "").substring(0, 10);
  };

  const formatPhoneNumber = (dirtyInput: string) => {
    let input = cleanPhoneNumber(dirtyInput);

    if (input.length > 0) {
      input = "(" + input;
    }

    if (input.length > 3) {
      input = input.slice(0, 4) + ") " + input.slice(4);
    }

    if (input.length > 6) {
      input = input.slice(0, 9) + " " + input.slice(9);
    }

    return input;
  };
</script>

<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";
  import TextField from "$lib/components/TextField.svelte";
  import { dataAccess, stores } from "$lib/data-access";
  import { errorToToast } from "$lib/data-access/stores/toast";

  let phoneNumber = "";
  $: phoneNumber = formatPhoneNumber(phoneNumber);

  const handleSubmit = async () => {
    const errors = await dataAccess.auth.authenticate({
      type: "phone",
      phoneNumber: cleanPhoneNumber(phoneNumber),
    });

    stores.toast.enqueue(errors.map(errorToToast));
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
