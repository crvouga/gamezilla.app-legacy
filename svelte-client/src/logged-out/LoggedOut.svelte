<script lang="ts">
  import { readable } from "svelte/store";
  import Login from "./Login.svelte";
  import LoginWithPhone from "./LoginWithPhone.svelte";

  type Route = "login" | "login/phone";

  const toRoute = (pathname: string): Route => {
    if (pathname === "/login/phone") {
      return "login/phone";
    }

    return "login";
  };

  const routeStore = readable<Route>(
    toRoute(window.location.pathname),
    (set) => {
      const onPopstate = () => {
        set(toRoute(window.location.pathname));
      };

      window.addEventListener("popstate", onPopstate);

      return () => {
        window.removeEventListener("popstate", onPopstate);
      };
    }
  );

  const push = (route: Route) => {
    window.history.pushState({}, "", route);

    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleContinueWith = (event: CustomEvent<"google" | "phone">) => {
    switch (event.detail) {
      case "google":
        return;
      case "phone":
        push("login/phone");
        return;
    }
  };

  const handleBack = () => {
    window.history.back();
  };
</script>

{#if $routeStore === 'login'}
  <Login on:continue-with={handleContinueWith} />
{/if}

{#if $routeStore === 'login/phone'}
  <LoginWithPhone on:back={handleBack} />
{/if}
