<!-- DOCS: https://fontawesome.com/v5.15/icons?d=gallery&p=2&m=free -->
<script lang="ts" context="module">
	export type IconName =
		| "google"
		| "phone"
		| "chevron-left"
		| "chevron-right"
		| "gamepad"
		| "sign-out";
</script>

<script lang="ts">
	import Icon from "svelte-awesome";
	import {
		google,
		phone,
		chevronLeft,
		chevronRight,
		gamepad,
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
	};

	export let iconName: IconName;
	let className = "";
	export { className as class };
</script>

<Icon class="{className} w-6 h-6" data={iconNameToData[iconName]} />
