<div class="loader" />

<style>
	.loader,
	.loader:after {
		border-radius: 50%;
		width: 10em;
		height: 10em;
	}

	.loader {
		font-size: 0.3em;
		border-top: 1.1em solid rgba(255, 255, 255, 0.2);
		border-right: 1.1em solid rgba(255, 255, 255, 0.2);
		border-bottom: 1.1em solid rgba(255, 255, 255, 0.2);
		border-left: 1.1em solid #ffffff;
		animation: load8 1.1s infinite linear;
	}

	@keyframes load8 {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
