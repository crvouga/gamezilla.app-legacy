<script lang="ts">
  import Button from "../../generic/Button.svelte";
  import Icon from "../../generic/Icon.svelte";
  import Link from "../../generic/Link.svelte";
  import PageHeader from "../../generic/PageHeader.svelte";
  import PageHeaderTitle from "../../generic/PageHeaderTitle.svelte";
  import TextInput from "../../generic/TextInput.svelte";
</script>

<PageHeader>
  <Link to="auth" slot="prefix">
    <Icon iconName="chevron-left" />
  </Link>
  <PageHeaderTitle>Email</PageHeaderTitle>
</PageHeader>

<div class="p-4">
  <TextInput placeholder="example@email.com" class="mb-4" />
  <Button>
    <Icon iconName="send" slot="prefix" />
    Send Link
  </Button>
</div>
