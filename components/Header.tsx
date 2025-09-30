import { clx } from "@/helpler";
import { theme } from "@/tailwind.config";
import { Href, router } from "expo-router";
import { useColorScheme } from "nativewind";
import { Text, TextProps, TouchableOpacity, TouchableOpacityProps, View, ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";
import { SafeView } from "./View";

interface IHeader extends ViewProps {
    textProps?: TextProps,
    title?:React.ReactNode|string
}
export function Header({ textProps: { className: textClass, ...tP } = {},title, className, ...props }: IHeader) {
    return (
        <SafeView safeZone="top" className="">
            <View className={clx("px-4 py-2 flex-row items-center gap-x-4", className)}{...props}>
                <BackButton />
                <Text className={clx("font-jakarta-bold text-dark text-[20px] dark:text-white", textClass)} {...tP}>{title}</Text>
            </View>
        </SafeView>
    )
}

interface IBackButton extends TouchableOpacityProps {
    bgColor?: string,
    iconColor?: string,
    to?: Href|boolean,
    onBack?: Function
}
export const BackButton = ({ className, onBack, to, bgColor, style, iconColor, ...props }: IBackButton) => {
    const {colorScheme}=useColorScheme()
    const handleBack = () => {
        if (to) {
            if(typeof to =="string"){
                router.dismissTo(to)
            }else{
                router.back()
            }
        }else{

        }
        onBack?.()
    } 
    bgColor=bgColor ?? (colorScheme=="light" ? "#fff":theme.extend.colors.dark.lighter)
    iconColor=iconColor ?? (colorScheme=="light" ? theme.extend.colors.dark.DEFAULT:theme.extend.colors.gray.DEFAULT)
    return (
        <TouchableOpacity onPress={handleBack} className={clx("p-3 bg-white  justify-center items-center rounded-full ", className)} style={{
            backgroundColor: bgColor ,
            ...(style as any)
        }} {...props}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M14.9998 19.92L8.47984 13.4C7.70984 12.63 7.70984 11.37 8.47984 10.6L14.9998 4.08" stroke={iconColor} strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>

        </TouchableOpacity>
    )
}