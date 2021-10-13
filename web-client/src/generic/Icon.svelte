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
	import { faSms } from "@fortawesome/free-solid-svg-icons";
	import Icon from "svelte-awesome";
	import {
		chevronLeft,
		chevronRight,
		close,
		envelope,
		exclamationCircle,
		gamepad,
		google,
		phone,
		send,
		signOut,
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
</script>

<Icon class="w-5 h-5" data={iconNameToData[iconName]} />
