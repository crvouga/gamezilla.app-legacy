<script lang="ts">
  import Icon from "../../generic/Icon.svelte";
  import Item from "../../generic/Item.svelte";
  import Link from "../../generic/Link.svelte";
  import PageHeader from "../../generic/PageHeader.svelte";
  import PageHeaderTitle from "../../generic/PageHeaderTitle.svelte";
</script>

<PageHeader>
  <PageHeaderTitle>Sign In</PageHeaderTitle>
</PageHeader>

<Link to="/auth/email">
  <Item>
    <Icon iconName="google" slot="start" />
    <Icon iconName="chevron-right" slot="end" />
    Continue With Google
  </Item>
</Link>

<Link to="/auth/phone">
  <Item>
    <Icon iconName="phone" slot="start" />
    <Icon iconName="chevron-right" slot="end" />
    Continue With Phone
  </Item>
</Link>

<Link to="/auth/email">
  <Item>
    <Icon iconName="envelope" slot="start" />
    <Icon iconName="chevron-right" slot="end" />
    Continue With Email
  </Item>
</Link>
