import { clx } from "@/helpler";
import { theme } from "@/tailwind.config";
import { t } from "i18next";
import { useColorScheme } from "nativewind";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Button } from "./Button";
import { Text } from "./Themed";

export function ErrorRetry({ retry }: { retry: Function }) {
    return (
        <View className="gap-y-4 px-4 flex-1 justify-center items-center">
            <Text className="text-[50px] text-center font-jakarta-semibold text-dark">{t("Oups !")}</Text>
            <Text className="text-[14px] text-center text-dark jakarka">{t("Une erreur inatendue est survenue, toutes nos excuses, veuillez reprendre !")}</Text>
            <Button.Primary label={t("Rééssayer")} onPress={() => retry()} />
        </View>
    )
}



interface IStatusItem {
    title?: string,
    color: "warning" | "danger" | "info" | "canceled" | "success",
    contained?: boolean,
}
export function StatusLabel({ contained = false, color, title }: IStatusItem) {
    const { colorScheme } = useColorScheme()

    const THEMES = {
        "warning": {
            icon: (
                <Svg width="8" height="12" viewBox="0 0 8 12" fill="none" >
                    <Path d="M5.62002 1H2.38002C0.500019 1 0.355019 2.69 1.37002 3.61L6.63002 8.39C7.64502 9.31 7.50002 11 5.62002 11H2.38002C0.500019 11 0.355019 9.31 1.37002 8.39L6.63002 3.61C7.64502 2.69 7.50002 1 5.62002 1Z" stroke={!contained ? (colorScheme === "light" ? theme.extend.colors.yellow[500] : theme.extend.colors.yellow[500]) : (colorScheme == "light" ? "#fff" : theme.extend.colors.gray[200])} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
            ),
            containerClassName: !contained ? "bg-yellow-500/10 dark:bg-yellow-500/20" : "bg-yellow-500 dark:bg-yellow-dark-500",
            textClassName: !contained ? "text-yellow-500 dark:text-yellow-500" : "text-white dark:text-dark-400"
        },
        "success": {
            containerClassName: !contained ? "bg-green-500/10 dark:bg-green-500/10" : "bg-green-500 dark:bg-green-dark-500",
            icon: (
                <Svg width="8" height="7" viewBox="0 0 8 7" fill="none" >
                    <Path d="M7 1.5L4.65205 4.31754C3.99647 5.10423 3.66869 5.49758 3.22812 5.51756C2.78755 5.53755 2.42549 5.17549 1.70139 4.45139L1 3.75" stroke={!contained ? (colorScheme == "light" ? theme.extend.colors.green[500] : theme.extend.colors.green[500]) : (colorScheme == "light" ? "#fff" : theme.extend.colors.gray[200])} strokeWidth="1.5" strokeLinecap="round" />
                </Svg>
            ),
            textClassName: !contained ? "text-green-500 dark:text-green-500" : "text-white dark:text-gray-200"
        },
        "danger": {
            containerClassName: !contained ? "bg-red/10 dark:bg-red-500/10" : "bg-red dark:bg-red-500",
            icon: (
                <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <Path d="M10.5 3.5L3.5 10.5" stroke={colorScheme == "light" ? theme.extend.colors.red.DEFAULT : theme.extend.colors.red[500]} stroke-linecap="round" stroke-linejoin="round" />
                    <Path d="M3.5 3.5L10.5 10.5" stroke={colorScheme == "light" ? theme.extend.colors.red.DEFAULT : theme.extend.colors.red[500]} stroke-linecap="round" stroke-linejoin="round" />
                </Svg>
            ),
            textClassName: !contained ? "text-red dark:text-red-500" : "text-white dark:text-gray-200"
        },
        "info": {
            icon: undefined,
            containerClassName: !contained ? "bg-primary/10 dark:bg-primary-500/10" : "bg-primary dark:bg-primary-500",
            textClassName: !contained ? "text-dark-400 dark:text-gray-200" : "text-white dark:text-dark-300"
        },
        "canceled": {
            icon: undefined,
            containerClassName: !contained ? "bg-gray-100 dark:bg-dark-400" : "bg-dark-300 dark:bg-dark-border",
            textClassName: !contained ? "text-dark-400 dark:text-gray-200" : "text-white dark:text-dark-300"
        }
    }

    return (
        <View className={clx("flex-row items-center gap-x-2 px-1 py-1 rounded-full ", THEMES[color].containerClassName)}>
            <View>
                {
                    THEMES[color]?.icon && (
                        THEMES[color].icon
                    )
                }
            </View>
            {
                title && (
                    <View>
                        <Text className={clx("text-[12px] font-jakarta-medium ", THEMES[color].textClassName)}>{title}</Text>
                    </View>
                )
            }

        </View>
    )
}