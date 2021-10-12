<!-- DOCS: https://fontawesome.com/v5.15/icons?d=gallery&p=2&m=free -->
<script lang="ts" context="module">
	export type IconName =
		| "google"
		| "phone"
		| "chevron-left"
		| "chevron-right"
		| "gamepad"
		| "sign-out"
		| "envelope"
		| "exclamation-circle"
		| "close"
		| "send"
		| "sms";
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";

	import Icon from "svelte-awesome";
	import { faSms } from "@fortawesome/free-solid-svg-icons";
	import {
		google,
		phone,
		chevronLeft,
		chevronRight,
		gamepad,
		signOut,
		envelope,
		exclamationCircle,
		close,
		send,
	} from "svelte-awesome/icons";

	const iconNameToData: {
		[iconName in IconName]: unknown;
	} = {
		google: google,
		phone: phone,
		"chevron-left": chevronLeft,
		"chevron-right": chevronRight,
		gamepad: gamepad,
		"sign-out": signOut,
		envelope: envelope,
		"exclamation-circle": exclamationCircle,
		close: close,
		send: send,
		sms: faSms,
	};

	export let iconName: IconName;
	let className = "";
	export { className as class };

	const eventDispatch = createEventDispatcher();
</script>

<span
	on:click={() => {
		eventDispatch('click', {});
	}}>
	<Icon class="{className} w-5 h-5" data={iconNameToData[iconName]} />
</span>
