<script lang="ts">
  import { getContext } from "svelte";

  import { dataAccess } from "../data-access";
  import {
    authUserKey,
    IAuthUser,
  } from "../data-access/auth-data-access.interface";
  import Badge from "../generic/Badge.svelte";
  import Button from "../generic/Button.svelte";
  import Icon from "../generic/Icon.svelte";
  import Item from "../generic/Item.svelte";
  import Link from "../generic/Link.svelte";
  import PageHeader from "../generic/PageHeader.svelte";
  import PageHeaderTitle from "../generic/PageHeaderTitle.svelte";
  import { lobbyStatesStore } from "../stores";

  const authUser: IAuthUser = getContext(authUserKey);

  let state: "idle" | "creating-lobby" = "idle";
</script>

<PageHeader>
  <PageHeaderTitle>Home</PageHeaderTitle>
</PageHeader>

<div class="p-2">
  <Button isLoading={state === 'creating-lobby'}>
    <Icon slot="prefix" iconName="gamepad" />
    Create Lobby
  </Button>
</div>

<Link to="/auth-user/lobby">
  <Item>
    Your Lobbies
    <Badge slot="end">{$lobbyStatesStore.length}</Badge>
  </Item>
</Link>

<Link to="/unauth">
  <Item>
    Sign Out
    <Icon slot="end" iconName="sign-out" />
  </Item>
</Link>

<Link to="/auth">
  <Item>
    Sign In
    <Icon slot="end" iconName="sign-out" />
  </Item>
</Link>
