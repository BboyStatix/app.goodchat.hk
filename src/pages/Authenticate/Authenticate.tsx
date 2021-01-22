import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import useAuth from "hooks/useAuth/useAuth";
import React from "react";
import { useHistory, useLocation } from "react-router";

interface LocationState {
  from: string;
}

const Authenticate: React.FC = () => {
  const { login } = useAuth();
  const history = useHistory();
  const location = useLocation<LocationState | undefined>();

  const handleClick = () => {
    login();
    if (location.state) {
      history.replace(location.state.from);
    } else {
      history.replace("/home");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Authenticate</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonButton onClick={handleClick}>Login</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Authenticate;