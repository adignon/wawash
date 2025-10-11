import { clx } from "@/helpler";
import { theme } from "@/tailwind.config";
import LottieView from 'lottie-react-native';
import { useColorScheme } from "nativewind";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, TouchableNativeFeedback, TouchableNativeFeedbackProps, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Text } from "./Themed";
interface IButton extends TouchableNativeFeedbackProps {
    label?: string|React.ReactNode,
    loading?: boolean,
    disabled?: boolean,
    fullwidth?: boolean,
    children?:React.ReactNode
}
export function Button({ disabled, fullwidth = true, loading, children, className, label, ...props }: IButton) {
    const { t } = useTranslation()
    const isDisabled = disabled || !!loading
    return (
        <TouchableNativeFeedback className="" disabled={isDisabled} {...props}>
            <View className={clx(!fullwidth && "flex-row", "justify-center")}>
                <View className={clx("relative p-4 rounded-[15px] overflow-hidden ", className)} {...props}>
                    {
                        children
                    }
                    {label && (
                        <Text className={clx("text-center text-[16px] font-jakarta-medium text-white ", isDisabled ? "text-gray-400 dark:text-dark-300" : "")}>{label}</Text>
                    )}
                    {
                        loading ? (
                            <View className={clx("absolute justify-center items-center top-0 bottom-0 left-0 right-0 ", className)}>
                                <View className="  w-[40px] h-[40px] ">
                                    <LottieView style={{ width: "100%", height: "100%" }} source={require("@/assets/lotties/loading-1.json")} loop autoPlay />
                                </View>
                            </View>
                        ) : <></>
                    }

                </View>
            </View>
        </TouchableNativeFeedback>

    )
}

Button.Primary = ({ className,...props }: IButton) => {
    return <Button className={clx(props.disabled ? 'bg-gray-300 dark:bg-dark-lighter' : "bg-primary dark:bg-primary-500", className)} {...props} />
}


export function SwitcherButton({ label, onShow, show }: { show: boolean, label?: string | React.ReactNode, onShow: (state: boolean) => void }) {
    const progress = useSharedValue(0)
    const {colorScheme}=useColorScheme()
    const containerStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            progress.value,
            [0, 1],
            [colorScheme==="light"? theme.extend.colors.gray[100]:theme.extend.colors.dark.lighter, theme.extend.colors.primary.DEFAULT]
        )
    }))
    const style = useAnimatedStyle(() => ({
        left: withTiming(!show ? 3 : 17, { duration: 200 })
    }))

    const handlePress = () => {
        onShow(!show);
        progress.value = withTiming(show ? 0 : 1, { duration: 200 });
    }

    React.useEffect(() => {
        if (show) {
            progress.value = 1
        } else {
            progress.value = 0
        }
    }, [show])
    return (
        <Pressable onPress={handlePress} className="flex-row items-center gap-x-4">
            <Animated.View style={[{ height: 30, width: 45 }, containerStyle]} className="relative  rounded-full ">
                <Animated.View style={[{
                    height: 25,
                    width: 25,
                    position: "absolute",
                    top: "50%",
                    transform: [{ translateY: '-50%' }]
                }, style]} className={clx("bg-white  rounded-full shadow left-[3px]", show ?"dark:bg-gray-200": "dark:bg-dark-300" )}></Animated.View>
            </Animated.View>
            {
                label ? (typeof label == "string" ? (
                    <View>
                        <Text className="font-jakarta-medium text-[14px] text-dark">{label}</Text>
                    </View>
                ) : label) : <></>
            }
        </Pressable>
    )
}