import { Stack } from "expo-router";

export default function Page() {
    return (
        <Stack  screenOptions={{ headerShown: false }}>
            <Stack.Screen name="otp-verification" />
            <Stack.Screen name="otp-confirm" />
        </Stack>
    )
}

export const unstable_settings = {
  initialRouteName: 'otp-verification',
};