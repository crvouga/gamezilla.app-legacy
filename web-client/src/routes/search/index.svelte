<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import TextField from "$lib/components/TextField.svelte";
  import PageHeader from "$lib/shared/PageHeader.svelte";
</script>

<PageHeader>
  <Link slot="prefix" to="/">
    <Icon iconName="chevron-left" />
  </Link>

  <TextField placeholder="Search Users" />
</PageHeader>
