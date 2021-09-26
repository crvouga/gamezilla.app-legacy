<script lang="ts">
	import type { IconName } from './icon-name';

	export const iconNameToFontAwesomeClass: { [iconName in IconName]: string } = {
		google: 'fab fa-google',
		phone: 'fas fa-phone',
		email: 'fas fa-envelope'
	};

	export let name: IconName;

	$: fontAwesomeClass = iconNameToFontAwesomeClass[name];
</script>

<i class={fontAwesomeClass} />
