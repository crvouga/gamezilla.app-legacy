<script lang="ts">
  import Container from "../generic/Container.svelte";
  import PageBar from "../generic/PageBar.svelte";
  import Typography from "../generic/Typography.svelte";

  export let title: string;
</script>

<PageBar title="Not Found" />

<Container>
  <Typography variant="small-title" text={title} />
</Container>
