<!-- DOCS: https://fontawesome.com/v5.15/icons?d=gallery&p=2&m=free -->
<script lang="ts" context="module">
	export type IconName = "google" | "phone" | "email" | "chevron-left";

	export const iconNameToFontAwesomeClass: {
		[iconName in IconName]: string;
	} = {
		google: "fab fa-google",
		phone: "fas fa-phone",

		email: "far fa-envelope",
		"chevron-left": "fa fa-chevron-left",
	};
</script>

<script lang="ts">
	export let name: IconName;

	let className = "";
	export { className as class };

	$: iconClass = `${className} ${iconNameToFontAwesomeClass[name]}`;
</script>

<i class={iconClass} />
