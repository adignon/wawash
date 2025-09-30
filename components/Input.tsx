import { clx } from "@/helpler";
import { Image } from "expo-image";
import { t } from "i18next";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { TextProps } from "react-native-svg";
interface IInput extends TextInputProps {
    left?: React.ReactNode,
    right?: React.ReactNode,
    label?: React.ReactNode,
    isValid?: boolean,
    error?: string
}
export function Input({
    error,
    isValid,
    left,
    right,
    label,
    ...rest
}: IInput) {
    const { className: inputClassName, ...props } = rest ?? {}
    const Input = (
        <>
            <View className={clx("flex-row items-center rounded-[15px] border border-dark-300", error && typeof isValid == "boolean" ? {
                "border-red-400 border-2": !isValid,
                "border-green border-2": isValid
            } : "")}>
                {left ?? <></>}
                <TextInput className={clx("flex-1 p-4 p-4 text-[16px] font-jakarta-medium text-dark-text  placeholder:text-dark-300 dark:text-white ", error && typeof isValid == "boolean" ? {
                    "text-red-400": !isValid,
                    "text-green": isValid
                } : "", inputClassName)}  {...props} />
                {right ?? <></>}
            </View>
            {
                error && typeof isValid == "boolean" && !isValid && error && (
                    <View>
                        <Text className={clx("text-[12px] font-jakarta ", 'text-red-400')}>{t(error)}</Text>
                    </View>
                )
            }

        </>
    )
    if (label) {
        return <View className="gap-y-2">
            <View className="px-2">
                {label}
            </View>
            {Input}
        </View>
    }
    return (
        Input
    )
}
interface IInputPhoneNumber extends IInput {

}
export function InputPhoneNumber({ ...props }: IInputPhoneNumber) {
    return (
        <Input
            left={
                <View className="pl-4 justify-center">
                    <View className="w-[30px]  h-[20px] rounded-[5px] overflow-hidden ">
                        <Image
                            source={require("@/storage/countries/4x3/bj.svg")}
                            style={{
                                width: 35,
                                marginLeft: -5,
                                height: 19,
                                objectFit: "cover",
                            }}
                        />
                    </View>
                </View>
            }
            keyboardType="phone-pad"
            {...props} />
    )
}
interface IInputLabel extends TextProps {
    title: string
}
export function InputLabel({ title }: IInputLabel) {
    return (
        <Text className="dark:text-gray-400 text-dark-400 text-[12px] font-jakarta-semibold">{title}</Text>
    )
}
