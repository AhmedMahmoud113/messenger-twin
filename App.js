import React, { useRef, useState, useCallback } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  View,
  BackHandler,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";

const MESSENGER_URL = "https://www.messenger.com/";

// User agent to get the mobile-optimized version
const MOBILE_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

// Injected JS to:
// 1. Remove "Open in app" banners
// 2. Add viewport meta for proper scaling
// 3. Request notification permission
const INJECTED_JS = `
(function() {
  // Remove "open in app" banners
  function removeBanners() {
    const selectors = [
      '[data-testid="open-in-app-banner"]',
      '[role="banner"]',
      '.uiLayer',
      '#mobile-install-banner',
    ];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (el.textContent && (
          el.textContent.includes('app') || 
          el.textContent.includes('تطبيق') ||
          el.textContent.includes('Open') ||
          el.textContent.includes('Install') ||
          el.textContent.includes('تثبيت')
        )) {
          el.style.display = 'none';
        }
      });
    });
  }

  // Run on load and observe DOM changes
  removeBanners();
  const observer = new MutationObserver(removeBanners);
  observer.observe(document.body, { childList: true, subtree: true });

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  true;
})();
`;

export default function App() {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  // Handle Android back button
  const handleBackPress = useCallback(() => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  }, [canGoBack]);

  React.useEffect(() => {
    if (Platform.OS === "android") {
      BackHandler.addEventListener("hardwareBackPress", handleBackPress);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
    }
  }, [handleBackPress]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0084FF" />
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: MESSENGER_URL }}
        style={styles.webview}
        userAgent={MOBILE_USER_AGENT}
        injectedJavaScript={INJECTED_JS}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={false}
        allowsBackForwardNavigationGestures={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mediaCapturePermissionGrantType="grant"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        // Grant camera/mic permissions for calls
        onPermissionRequest={(event) => event.grant()}
        startInLoadingState={false}
        pullToRefreshEnabled={true}
        allowsFullscreenVideo={true}
        decelerationRate="normal"
        contentMode="mobile"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
    zIndex: 10,
  },
});
