<script lang="ts">
  import Avatar from "$lib/components/Avatar.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";
</script>

<PageHeader>
  <PageHeaderTitle>Home</PageHeaderTitle>
  <Link slot="suffix" to="/auth-user">
    <Avatar />
  </Link>
</PageHeader>
