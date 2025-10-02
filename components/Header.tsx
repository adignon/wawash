import { clx } from "@/helpler";
import { theme } from "@/tailwind.config";
import { Href, router } from "expo-router";
import { useColorScheme } from "nativewind";
import { Text, TextProps, TouchableOpacity, TouchableOpacityProps, View, ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";
import { SafeView } from "./View";

interface IHeader extends ViewProps {
    transparent?:boolean,
    textProps?: TextProps,
    title?: React.ReactNode | string,
    backButton?: React.ReactNode
}
export function Header({ backButton, transparent,textProps: { className: textClass, ...tP } = {}, title, className, ...props }: IHeader) {
    return (
        <SafeView  transparent safeZone="top" className="">
            <View className={clx("px-4 py-2 flex-row items-center gap-x-4", className)}{...props}>
                {backButton ?? <BackButton />}
                <Text className={clx("font-jakarta-bold text-dark text-[20px] dark:text-white", textClass)} {...tP}>{title}</Text>
            </View>
        </SafeView>
    )
}

interface IBackButton extends TouchableOpacityProps {
    bgColor?: string,
    iconColor?: string,
    renderIcon?: ({ color }: { color: string }) => React.ReactNode,
    to?: Href | boolean,
    onBack?: Function
}
export const BackButton = ({ className, renderIcon, onBack, to, bgColor, style, iconColor, ...props }: IBackButton) => {
    const { colorScheme } = useColorScheme()
    const handleBack = () => {
        if (to) {
            if (typeof to == "string") {
                router.dismissTo(to)
            } else {
                router.back()
            }
        } else {
            if (onBack) {
                onBack?.()
            } else {
                router.back()
            }

        }

    }
    bgColor = bgColor ?? (colorScheme == "light" ? "#fff" : theme.extend.colors.dark.lighter)
    iconColor = iconColor ?? (colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray.DEFAULT)
    return (
        <TouchableOpacity onPress={handleBack} className={clx("p-3 bg-white  justify-center items-center rounded-full ", className)} style={{
            backgroundColor: bgColor,
            ...(style as any)
        }} {...props}>
            {
                renderIcon ? renderIcon({ color: iconColor }) : (
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Path d="M14.9998 19.92L8.47984 13.4C7.70984 12.63 7.70984 11.37 8.47984 10.6L14.9998 4.08" stroke={iconColor} strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                )
            }


        </TouchableOpacity>
    )
}

export function NotificationButton({ count }: { count: number }) {
    const { colorScheme } = useColorScheme()
    return (
        <TouchableOpacity className="p-2 rounded-full relative">
            <Svg width="19" height="21" viewBox="0 0 19 21" fill="none" >
                <Path d="M3.71653 6.30148C4.04398 3.3545 6.53492 1.125 9.50003 1.125C12.4651 1.125 14.9561 3.3545 15.2836 6.30148L15.5459 8.66208C15.5492 8.69219 15.5509 8.70729 15.5525 8.72219C15.6869 9.8926 16.0678 11.0214 16.6704 12.0339C16.6781 12.0468 16.6859 12.0597 16.7014 12.0856L17.3036 13.0892C17.8499 13.9999 18.1232 14.4552 18.0642 14.8291C18.0249 15.0777 17.8969 15.3039 17.7039 15.4654C17.4137 15.7083 16.8826 15.7083 15.8207 15.7083H3.17944C2.11741 15.7083 1.58639 15.7083 1.29622 15.4654C1.10312 15.3039 0.975124 15.0777 0.935874 14.8291C0.876895 14.4552 1.1501 13.9999 1.69651 13.0892L2.29862 12.0856C2.31421 12.0597 2.322 12.0468 2.32966 12.0339C2.9322 11.0214 3.3132 9.8926 3.44752 8.72219C3.44923 8.70729 3.45089 8.69219 3.45424 8.66208L3.71653 6.30148Z" stroke={colorScheme == "light" ? "#33363F" : theme.extend.colors.gray[200]} strokeWidth="1.5" />
                <Path d="M5.33331 15.7083C5.33331 16.2555 5.44108 16.7973 5.65048 17.3028C5.85988 17.8083 6.16679 18.2677 6.5537 18.6546C6.94061 19.0416 7.39994 19.3484 7.9055 19.5578C8.41102 19.7672 8.95279 19.875 9.49998 19.875C10.0472 19.875 10.5889 19.7672 11.0945 19.5578C11.6 19.3484 12.0594 19.0416 12.4462 18.6546C12.8332 18.2677 13.1401 17.8083 13.3495 17.3028C13.5588 16.7973 13.6666 16.2555 13.6666 15.7083" stroke={colorScheme == "light" ? "#33363F" : theme.extend.colors.gray[200]} strokeWidth="1.5" strokeLinecap="round" />
            </Svg>
            {
                count && (
                    <View className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 items-center justify-center">
                        <Text className="font-jakarta-medium text-[8px] text-white">1</Text>
                    </View>
                )
            }
        </TouchableOpacity>
    )
}