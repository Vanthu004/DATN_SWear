// app/navigation/navigationRef.js
import { createRef } from 'react';

export const navigationRef = createRef();

export const resetNavigation = (screenName) => {
  if (navigationRef.current) {
    navigationRef.current.reset({
      index: 0,
      routes: [{ name: "Auth", params: { screen: screenName } }],
    });
  } else {
    console.warn("navigationRef is not initialized");
  }
};