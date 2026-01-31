import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

const index: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/medical-bg.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Welcome to QureVault</Text>

          <Text style={styles.subtitle}>
            Your Digital Health Twin for Modern Healthcare
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/(auth)/signup")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default index;

/* ------------------ Styles ------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  box: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 24,
    borderRadius: 16,
    width: "85%",
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },

  primaryButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    width: "100%",
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 12,
  },

  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#4CAF50",
    paddingVertical: 12,
    width: "100%",
    borderRadius: 25,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
});


// import React from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
// } from "react-native";
// import { useRouter } from "expo-router";

// export default function index() {
//   const router = useRouter();

//   return (
//     <View style={styles.container}>
//       <Image
//         source={require("../../assets/medical-bg.jpg")}
//         style={styles.backgroundImage}
//         resizeMode="cover"
//       />

//       <View style={styles.overlay}>
//         <View style={styles.box}>
//           <Text style={styles.title}>Welcome to QureVault</Text>

//           <Text style={styles.subtitle}>
//             Your Digital Health Twin for Modern Healthcare
//           </Text>

//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => router.push("/(tabs)/profile")}
//             activeOpacity={0.85}
//           >
//             <Text style={styles.buttonText}>Get Started</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },

//   backgroundImage: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     width: "100%",
//     height: "100%",
//   },

//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.35)",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   box: {
//     backgroundColor: "rgba(255,255,255,0.9)",
//     padding: 24,
//     borderRadius: 16,
//     width: "85%",
//     alignItems: "center",
//   },

//   title: {
//     fontSize: 26,
//     fontWeight: "700",
//     marginBottom: 10,
//     textAlign: "center",
//   },

//   subtitle: {
//     fontSize: 14,
//     color: "#555",
//     textAlign: "center",
//     marginBottom: 24,
//   },

//   button: {
//     backgroundColor: "#4CAF50",
//     paddingVertical: 12,
//     paddingHorizontal: 32,
//     borderRadius: 25,
//   },

//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });



// // // import { Image } from 'expo-image';
// // // import { Platform, StyleSheet } from 'react-native';

// // // import { HelloWave } from '@/components/hello-wave';
// // // import ParallaxScrollView from '@/components/parallax-scroll-view';
// // // import { ThemedText } from '@/components/themed-text';
// // // import { ThemedView } from '@/components/themed-view';
// // // import { Link } from 'expo-router';

// // // export default function HomeScreen() {
// // //   return (
// // //     <ParallaxScrollView
// // //       headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
// // //       headerImage={
// // //         <Image
// // //           source={require('@/assets/images/partial-react-logo.png')}
// // //           style={styles.reactLogo}
// // //         />
// // //       }>
// // //       <ThemedView style={styles.titleContainer}>
// // //         <ThemedText type="title">Welcome!</ThemedText>
// // //         <HelloWave />
// // //       </ThemedView>
// // //       <ThemedView style={styles.stepContainer}>
// // //         <ThemedText type="subtitle">Step 1: Try it</ThemedText>
// // //         <ThemedText>
// // //           Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
// // //           Press{' '}
// // //           <ThemedText type="defaultSemiBold">
// // //             {Platform.select({
// // //               ios: 'cmd + d',
// // //               android: 'cmd + m',
// // //               web: 'F12',
// // //             })}
// // //           </ThemedText>{' '}
// // //           to open developer tools.
// // //         </ThemedText>
// // //       </ThemedView>
// // //       <ThemedView style={styles.stepContainer}>
// // //         <Link href="/modal">
// // //           <Link.Trigger>
// // //             <ThemedText type="subtitle">Step 2: Explore</ThemedText>
// // //           </Link.Trigger>
// // //           <Link.Preview />
// // //           <Link.Menu>
// // //             <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
// // //             <Link.MenuAction
// // //               title="Share"
// // //               icon="square.and.arrow.up"
// // //               onPress={() => alert('Share pressed')}
// // //             />
// // //             <Link.Menu title="More" icon="ellipsis">
// // //               <Link.MenuAction
// // //                 title="Delete"
// // //                 icon="trash"
// // //                 destructive
// // //                 onPress={() => alert('Delete pressed')}
// // //               />
// // //             </Link.Menu>
// // //           </Link.Menu>
// // //         </Link>

// // //         <ThemedText>
// // //           {`Tap the Explore tab to learn more about what's included in this starter app.`}
// // //         </ThemedText>
// // //       </ThemedView>
// // //       <ThemedView style={styles.stepContainer}>
// // //         <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
// // //         <ThemedText>
// // //           {`When you're ready, run `}
// // //           <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
// // //           <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
// // //           <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
// // //           <ThemedText type="defaultSemiBold">app-example</ThemedText>.
// // //         </ThemedText>
// // //       </ThemedView>
// // //     </ParallaxScrollView>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   titleContainer: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 8,
// // //   },
// // //   stepContainer: {
// // //     gap: 8,
// // //     marginBottom: 8,
// // //   },
// // //   reactLogo: {
// // //     height: 178,
// // //     width: 290,
// // //     bottom: 0,
// // //     left: 0,
// // //     position: 'absolute',
// // //   },
// // // });
