<!-- DOCS: https://fontawesome.com/v5.15/icons?d=gallery&p=2&m=free -->
<script lang="ts" context="module">
	export type IconName =
		| "google"
		| "phone"
		| "chevron-left"
		| "chevron-right"
		| "gamepad"
		| "sign-out"
		| "sign-in"
		| "envelope"
		| "exclamation-circle"
		| "close"
		| "send"
		| "sms"
		| "user"
		| "user-edit"
		| "check-circle"
		| "search";
	import { faSms, faUserEdit } from "@fortawesome/free-solid-svg-icons";
	import Icon from "svelte-awesome";
	import {
		checkCircle,
		chevronLeft,
		chevronRight,
		close,
		envelope,
		exclamationCircle,
		gamepad,
		google,
		phone,
		send,
		signIn,
		signOut,
		user,
		search,
	} from "svelte-awesome/icons";

	export const iconNameToData: {
		[iconName in IconName]: unknown;
	} = {
		google: google,
		phone: phone,
		"chevron-left": chevronLeft,
		"chevron-right": chevronRight,
		gamepad: gamepad,
		"sign-out": signOut,
		"sign-in": signIn,
		envelope: envelope,
		"exclamation-circle": exclamationCircle,
		close: close,
		send: send,
		sms: faSms,
		user: user,
		"user-edit": faUserEdit,
		"check-circle": checkCircle,
		search: search,
	};
</script>

<script lang="ts">
	export let iconName: IconName;
	let className = "w-6 h-6";
	export { className as class };
</script>

<Icon class={className} data={iconNameToData[iconName]} />
