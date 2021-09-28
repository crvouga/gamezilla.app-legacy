<script lang="ts" context="module">
	export type IconName = "google" | "phone" | "email";
</script>

<script lang="ts">
	export const iconNameToFontAwesomeClass: {
		[iconName in IconName]: string;
	} = {
		google: "fab fa-google",
		phone: "fas fa-phone",
		email: "fas fa-envelope",
	};

	export let name: IconName;

	let className = "";
	export { className as class };

	$: iconClass = `${className} ${iconNameToFontAwesomeClass[name]}`;
</script>

<i class={iconClass} />
