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
		| "check-circle";
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
	};
</script>

<script lang="ts">
	export let iconName: IconName;
	let className = "";
	export { className as class };
</script>

<Icon class="w-5 h-5 {className}" data={iconNameToData[iconName]} />
