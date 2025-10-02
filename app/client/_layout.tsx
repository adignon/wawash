import { clx } from "@/helpler";
import { theme } from "@/tailwind.config";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

export default function Layout() {
    return (
        <Tabs
            tabBar={(props) => {
                return <CustomTabBar {...props} />
            }}
            screenOptions={{ headerShown: false }}
        >
            <Tabs.Screen name="dashboard" options={{
                animation:"shift",
                tabBarIcon: (props) => (
                    <Svg width="20" height="22" viewBox="0 0 20 22" fill="none">
                        <Path d="M1.5 10.73C1.5 9.03276 1.5 8.18416 1.84308 7.43823C2.18615 6.69231 2.83046 6.14005 4.11906 5.03553L5.36906 3.9641C7.69821 1.96769 8.86278 0.969482 10.25 0.969482C11.6372 0.969482 12.8018 1.96769 15.1309 3.9641L16.3809 5.03553C17.6695 6.14005 18.3138 6.69231 18.6569 7.43823C19 8.18416 19 9.03276 19 10.73V16.0304C19 18.3875 19 19.566 18.2678 20.2982C17.5355 21.0304 16.357 21.0304 14 21.0304H6.5C4.14298 21.0304 2.96447 21.0304 2.23223 20.2982C1.5 19.566 1.5 18.3875 1.5 16.0304V10.73Z" stroke={props.color} strokeWidth="1.5" />
                        <Path d="M14 21.0305V14.5305C14 13.9782 13.5523 13.5305 13 13.5305H8.75C8.19772 13.5305 7.75 13.9782 7.75 14.5305V21.0305" stroke={props.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                ),
            }}  />

            <Tabs.Screen name="packages" options={{
                animation:"shift",
                tabBarIcon: (props) => (
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Path d="M3.16992 7.43994L11.9999 12.5499L20.7699 7.46991" stroke={props.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M12 21.6099V12.5399" stroke={props.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M9.93012 2.48L4.59013 5.45003C3.38013 6.12003 2.39014 7.80001 2.39014 9.18001V14.83C2.39014 16.21 3.38013 17.89 4.59013 18.56L9.93012 21.53C11.0701 22.16 12.9401 22.16 14.0801 21.53L19.4201 18.56C20.6301 17.89 21.6201 16.21 21.6201 14.83V9.18001C21.6201 7.80001 20.6301 6.12003 19.4201 5.45003L14.0801 2.48C12.9301 1.84 11.0701 1.84 9.93012 2.48Z" stroke={props.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M16.9998 13.24V9.58002L7.50977 4.09998" stroke={props.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>

                )
            }} />
            <Tabs.Screen name="histories"
                options={{
                    animation:"shift",
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
                animation:"shift",
                tabBarIcon: (props) => (
                    <Svg width="25" height="24" viewBox="0 0 25 24" fill="none">
                        <Path d="M19.9774 20.4471C19.5216 19.1713 18.5172 18.0439 17.1201 17.2399C15.7229 16.4358 14.0111 16 12.25 16C10.4889 16 8.77706 16.4358 7.37991 17.2399C5.98276 18.0439 4.97839 19.1713 4.52259 20.4471" stroke={props.color} strokeWidth="2" strokeLinecap="round" />
                        <Circle cx="12.25" cy="8" r="4" stroke={props.color} strokeWidth="2" strokeLinecap="round" />
                    </Svg>

                )
            }} />
        </Tabs>
    )
}

export function CustomTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
    const bubbleX = useSharedValue(0);
    const TAB_WIDTH = 47.5
    const PADDING = [7, 21, 95, 95 + 15]
    const {colorScheme}=useColorScheme()
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
        <View  style={{ flexDirection: 'row', marginBottom: insets.bottom, justifyContent: "center", position:"absolute", bottom:0, width:"100%"}}>
            <View style={{ zIndex: 10 }} className="relative bg-primary-500 bg-primary-dark-500  flex-row gap-x-4 p-2 rounded-full">
                {Object.values(descriptors).map(({ route, options }, index) => {
                    const isFocused = state.index === index;
                    const icon = typeof options.tabBarIcon == "function" ? options.tabBarIcon({ focused: isFocused, color: isFocused ? (colorScheme=="light" ? theme.extend.colors.primary.DEFAULT:"#fff") : theme.extend.colors.gray[100], size: 20 }) : <></>


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
                <Pressable  className=" relative w-[60px] h-[60px] justify-center items-center bg-primary-200 dark:bg-primary-dark-200 rounded-full">
                    <Svg width="30" height="30" viewBox="0 0 30 30" fill="none" >
                        <Path d="M15 7.5L15 22.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        <Path d="M22.5 15L7.5 15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </Svg>

                </Pressable>
            </View>

        </View>

    );
}
