import { clx } from "@/helpler";
import LottieView from 'lottie-react-native';
import { useTranslation } from "react-i18next";
import { Text, TouchableNativeFeedback, TouchableNativeFeedbackProps, View } from "react-native";
interface IButton extends TouchableNativeFeedbackProps {
    label?: string,
    loading?: boolean,
    disabled?: boolean,
    fullwidth?:boolean
}
export function Button({ disabled,fullwidth=true, loading, children, className, label, ...props }: IButton) {
    const { t } = useTranslation()
    const isDisabled = disabled || !!loading
    return (
        <TouchableNativeFeedback className="" disabled={isDisabled} {...props}>
            <View className={clx(!fullwidth &&"flex-row", "justify-center")}>
                <View className={clx("relative p-4 rounded-[15px] overflow-hidden ", className)} {...props}>
                    {label && (
                        <Text className={clx("text-center text-[16px] font-jakarta-medium text-white ", isDisabled ? "text-gray-400" : "")}>{t(label)}</Text>
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

Button.Primary = ({ ...props }: IButton) => {
    return <Button className={clx(props.disabled ? 'bg-gray-300 dark:bg-dark-lighter' : "bg-primary", props.className)} {...props} />
}