<script lang="ts" context="module">
  export const prerender = true;
</script>

<script lang="ts">
  import Button from "../../generic/Button.svelte";
  import Icon from "../../generic/Icon.svelte";
  import Link from "../../generic/Link.svelte";
  import PageHeader from "../../generic/PageHeader.svelte";
  import PageHeaderTitle from "../../generic/PageHeaderTitle.svelte";
  import TextField from "../../generic/TextField.svelte";
</script>

<PageHeader>
  <Link to="/auth" slot="prefix">
    <Icon iconName="chevron-left" />
  </Link>
  <PageHeaderTitle>Phone</PageHeaderTitle>
</PageHeader>

<form class="p-4">
  <TextField id="phone-number" placeholder="Mobile Phone Number" class="mb-4" />
  <Button>
    <Icon iconName="sms" slot="prefix" />
    Send Link
  </Button>
</form>
