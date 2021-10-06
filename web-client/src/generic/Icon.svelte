<script lang="ts" context="module">
	export type IconName = "google" | "phone" | "email" | "angle-left";

	export const iconNameToFontAwesomeClass: {
		[iconName in IconName]: string;
	} = {
		google: "fab fa-google",
		phone: "fas fa-phone",
		email: "fas fa-envelope",
		"angle-left": "fa-solid fa-angle-left",
	};
</script>

<script lang="ts">
	export let name: IconName;

	let className = "";
	export { className as class };

	$: iconClass = `${className} ${iconNameToFontAwesomeClass[name]}`;
</script>

<i class={iconClass} />
