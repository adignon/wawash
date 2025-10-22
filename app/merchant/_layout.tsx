import { clx } from "@/helpler";
import { theme } from "@/tailwind.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router, Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

export default function Layout() {
    return (
        <BottomSheetModalProvider>
            <Tabs
                tabBar={(props) => {
                    return <CustomTabBar {...props} />
                }}
                screenOptions={{ headerShown: false }}
            >
                <Tabs.Screen name="dashboard" options={{
                    animation: "shift",
                    tabBarIcon: (props) => (
                        <Svg width="20" height="22" viewBox="0 0 20 22" fill="none">
                            <Path d="M1.5 10.73C1.5 9.03276 1.5 8.18416 1.84308 7.43823C2.18615 6.69231 2.83046 6.14005 4.11906 5.03553L5.36906 3.9641C7.69821 1.96769 8.86278 0.969482 10.25 0.969482C11.6372 0.969482 12.8018 1.96769 15.1309 3.9641L16.3809 5.03553C17.6695 6.14005 18.3138 6.69231 18.6569 7.43823C19 8.18416 19 9.03276 19 10.73V16.0304C19 18.3875 19 19.566 18.2678 20.2982C17.5355 21.0304 16.357 21.0304 14 21.0304H6.5C4.14298 21.0304 2.96447 21.0304 2.23223 20.2982C1.5 19.566 1.5 18.3875 1.5 16.0304V10.73Z" stroke={props.color} strokeWidth="1.5" />
                            <Path d="M14 21.0305V14.5305C14 13.9782 13.5523 13.5305 13 13.5305H8.75C8.19772 13.5305 7.75 13.9782 7.75 14.5305V21.0305" stroke={props.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                    ),
                }} />

                <Tabs.Screen name="wallet" options={{
                    animation: "shift",
                    tabBarIcon: (props) => (
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" >
                            <Path d="M22 12V17C22 20 20 22 17 22H7C4 22 2 20 2 17V12C2 9.28 3.64 7.38 6.19 7.06C6.45 7.02 6.72 7 7 7H17C17.26 7 17.51 7.00999 17.75 7.04999C20.33 7.34999 22 9.26 22 12Z" stroke={props.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <Path d="M17.7514 7.05C17.5114 7.01 17.2614 7.00001 17.0014 7.00001H7.00141C6.72141 7.00001 6.45141 7.02001 6.19141 7.06001C6.33141 6.78001 6.53141 6.52001 6.77141 6.28001L10.0214 3.02C11.3914 1.66 13.6114 1.66 14.9814 3.02L16.7314 4.79002C17.3714 5.42002 17.7114 6.22 17.7514 7.05Z" stroke={props.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <Path d="M22 12.5H19C17.9 12.5 17 13.4 17 14.5C17 15.6 17.9 16.5 19 16.5H22" stroke={props.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>


                    )
                }} />
                <Tabs.Screen name="histories"
                    options={{
                        animation: "shift",
                        tabBarIcon: (props) => (
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <Path d="M8 2V5" stroke={props.color} strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                <Path d="M16 2V5" stroke={props.color} strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                <Path d="M7 11H15" stroke={props.color} strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                <Path d="M7 15H12" stroke={props.color} strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                <Path d="M15 22H9C4 22 3 19.94 3 15.82V9.65C3 4.95 4.67 3.69 8 3.5H16C19.33 3.68 21 4.95 21 9.65V16" stroke={props.color} strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                <Path d="M21 16L15 22V19C15 17 16 16 18 16H21Z" stroke={props.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>

                        )
                    }}
                />
                <Tabs.Screen name="profile" options={{
                    animation: "shift",
                    tabBarIcon: (props) => (
                        <Svg width="25" height="24" viewBox="0 0 25 24" fill="none">
                            <Path d="M19.9774 20.4471C19.5216 19.1713 18.5172 18.0439 17.1201 17.2399C15.7229 16.4358 14.0111 16 12.25 16C10.4889 16 8.77706 16.4358 7.37991 17.2399C5.98276 18.0439 4.97839 19.1713 4.52259 20.4471" stroke={props.color} strokeWidth="2" strokeLinecap="round" />
                            <Circle cx="12.25" cy="8" r="4" stroke={props.color} strokeWidth="2" strokeLinecap="round" />
                        </Svg>

                    )
                }} />
            </Tabs>

        </BottomSheetModalProvider>

    )
}

export function CustomTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
    const bubbleX = useSharedValue(0);
    const TAB_WIDTH = 47.5
    const PADDING = [7, 21, 95, 95 + 15]
    const { colorScheme } = useColorScheme()
    // animate bubble position when index changes
    useEffect(() => {
        bubbleX.value = withSpring(state.index * TAB_WIDTH + PADDING[state.index], {
            damping: 15,     // higher damping = less oscillation
            stiffness: 150,  // higher stiffness = faster snap
            mass: 1,         // keep default
            overshootClamping: false, // allow slight overshoot
        });
    }, [state.index]);

    const bubbleStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: bubbleX.value }, { translateY: "-35%" }],
    }));
    return (
        <View style={{ flexDirection: 'row', marginBottom: insets.bottom, justifyContent: "center", position: "absolute", bottom: 0, width: "100%" }}>
            <View style={{ zIndex: 10 }} className="relative bg-primary-500 dark:bg-primary-dark-500  flex-row gap-x-4 p-2 rounded-full">
                {Object.values(descriptors).map(({ route, options }, index) => {
                    const isFocused = state.index === index;
                    const icon = typeof options.tabBarIcon == "function" ? options.tabBarIcon({ focused: isFocused, color: isFocused ? (colorScheme == "light" ? theme.extend.colors.primary.DEFAULT : "#fff") : theme.extend.colors.gray[100], size: 20 }) : <></>
                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    return (
                        <Pressable onPress={onPress} onLongPress={onLongPress} key={index} className={clx("w-[47.5px] bg-primary-300 dark:bg-primary-dark-300 justify-center items-center h-[45px] rounded-full ", index == 1 && "mr-[60px]", isFocused && "bg-transparent dark:bg-transparent")} >
                            <View >
                                {icon}
                            </View>
                        </Pressable>
                    );
                })}
                <Animated.View
                    style={[{ zIndex: -1, position: "absolute", top: "50%", }, bubbleStyle]}
                    className={"w-[47.5px] h-[45px]   bg-white dark:bg-primary-dark-200 rounded-full absolute "}
                />
            </View>
            <View className="absolute left-1/2 -translate-x-1/2 -translate-y-1/4" style={{ zIndex: 15 }} >
                <Pressable onPress={() => {
                    router.push("/nolayout/merchant/search-order")
                }} className=" relative w-[60px] h-[60px] justify-center items-center bg-primary-200 dark:bg-primary-dark-200 rounded-full">
                    <Svg width="30" height="30" viewBox="0 0 30 30" fill="none" >
                        <Path d="M15 7.5L15 22.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        <Path d="M22.5 15L7.5 15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </Svg>

                </Pressable>
            </View>

        </View>

    );
}
