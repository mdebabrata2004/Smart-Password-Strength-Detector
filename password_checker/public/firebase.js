import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "Enter_Your_Firebase_apiKey",
  authDomain: "Enter_Your_authDomain",
  projectId: "Enter_Your_ProjectID",
  storageBucket: "----",
  messagingSenderId: "----",
  appId: "----",
  measurementId: "----"
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
