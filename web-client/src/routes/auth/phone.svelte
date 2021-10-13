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
  import { dataAccess } from "../../data-access";

  import Button from "../../generic/Button.svelte";
  import Icon from "../../generic/Icon.svelte";
  import Link from "../../generic/Link.svelte";
  import PageHeader from "../../generic/PageHeader.svelte";
  import PageHeaderTitle from "../../generic/PageHeaderTitle.svelte";
  import TextField from "../../generic/TextField.svelte";

  let phoneNumber = "";
  $: phoneNumber = formatPhoneNumber(phoneNumber);

  const handleSubmit = async () => {
    const errors = await dataAccess.auth.authenticate({
      type: "phone",
      phoneNumber: cleanPhoneNumber(phoneNumber),
    });

    console.log({ errors });
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
