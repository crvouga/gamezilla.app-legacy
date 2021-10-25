<script lang="ts">
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/shared/PageHeader.svelte";
  import PageHeaderTitle from "$lib/shared/PageHeaderTitle.svelte";
  import AuthUserAvatar from "$lib/shared/AuthUserAvatar.svelte";
</script>

<PageHeader>
  <PageHeaderTitle>Home</PageHeaderTitle>
  <Link slot="suffix" to="/auth-user">
    <AuthUserAvatar />
  </Link>
</PageHeader>
