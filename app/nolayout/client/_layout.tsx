import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen name="how" />
            <Stack.Screen name="help" />
            <Stack.Screen name="configure-adress" options={{
                animation: "slide_from_bottom",
                presentation:"modal"
            }} />
        </Stack>
    )
}