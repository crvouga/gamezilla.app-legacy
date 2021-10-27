<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import FormTextInput from "$lib/components/FormTextInput.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import { errorToToast } from "$lib/components/toaster";
  import { signIn } from "$lib/features";
  import { enqueueToast } from "$lib/shared";
  import PageHeader from "$lib/shared/PageHeader.svelte";
  import { cleanPhoneNumber } from "$lib/utility";

  let phoneNumber = "";

  const handleSubmit = async () => {
    const errors = await signIn({
      type: "phone",
      phoneNumber: cleanPhoneNumber(phoneNumber),
    });

    enqueueToast(errors.map(errorToToast));
  };
</script>

<PageHeader title="Phone">
  <Link to="/auth" slot="prefix">
    <Icon iconName="chevron-left" />
  </Link>
</PageHeader>

<form class="p-4">
  <FormTextInput
    id="phone-number"
    inputMode="tel"
    placeholder="Mobile Phone Number"
    bind:value={phoneNumber}
    class="mb-4" />

  <Button on:click={handleSubmit}>
    <Icon iconName="sms" slot="prefix" />
    Send Link
  </Button>
</form>
