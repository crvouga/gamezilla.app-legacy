<ion-tabs>
	<ion-tab tab="tab-schedule">
		<ion-nav>
			<slot name="home" />
		</ion-nav>
	</ion-tab>

	<ion-tab tab="tab-speaker">
		<ion-nav>
			<slot name="profile" />
		</ion-nav>
	</ion-tab>

	<ion-tab-bar slot="bottom">
		<ion-tab-button tab="tab-schedule">
			<ion-icon name="home" />
			<ion-label>home</ion-label>
		</ion-tab-button>

		<ion-tab-button tab="tab-speaker">
			<ion-icon name="person-circle" />
			<ion-label>Profile</ion-label>
		</ion-tab-button>
	</ion-tab-bar>
</ion-tabs>
