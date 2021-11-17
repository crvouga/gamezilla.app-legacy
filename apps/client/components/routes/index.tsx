import {
  IonAvatar,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { home, person } from "ionicons/icons";
import { useDispatch } from "react-redux";
import { Redirect, Route } from "react-router-dom";
import { actions } from "../../core";

const HomeTab = () => {
  const dispatch = useDispatch();

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonItem button onClick={() => {}}>
            <IonLabel>Create Game</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </>
  );
};

const ProfileTab = () => {
  const dispatch = useDispatch();

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonButton onClick={() => dispatch(actions.auth.signOut())}>
          Sign Out
        </IonButton>
      </IonContent>
    </>
  );
};

export const IndexPage = () => {
  return (
    <IonPage>
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/home" component={HomeTab} exact />
          <Route path="/profile" component={ProfileTab} exact />
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/home">
            <IonIcon icon={home} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>

          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={person} />
            <IonLabel>Profile</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonPage>
  );
};
