import { otpVerify } from "@/api/auth";
import { Button } from "@/components/Button";
import { InputPhoneNumber } from "@/components/Input";
import { Text } from "@/components/Themed";
import { country } from "@/storage/config";
import { useMutation } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useColorScheme } from "nativewind";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, KeyboardAvoidingView, Platform, View } from "react-native";
import Toast from "react-native-toast-message";


export function OtpVerification() {
    const { t } = useTranslation()
    const {colorScheme}=useColorScheme()
    const [phone, setPhone] = React.useState("")
    const mutation = useMutation({
        mutationFn: otpVerify,
        mutationKey: ["verifyotp"]
    })
    const formatedPhone = React.useRef("")
    const handleChangeText = (text: string) => {
        if (/[0-9\s]/.test(text)) {
            setPhone(text)
            formatedPhone.current = parsePhoneNumberFromString(text, country.code as any)?.formatNational()!
        }
    }
    const changeDevice = React.useRef(false)
    const handleSubmit = async () => {
        try {
            if (!/^01[0-9\s]{8}/.test(phone)) {
                Alert.alert(t("Vous devez renseigner votre numéro valide pour continuer"))
                return
            }
            const data = await mutation.mutateAsync({
                phone: country.prefix + phone,
                changeDevice: changeDevice.current
            })
            Toast.show({
                text1: data.message ??"Code enovoyé",
                type: "success"
            })
            router.push({
                pathname: "/auth/otp-confirm",
                params: {
                    retryAt: data.retryAt,
                    phone: country.prefix + phone,
                    token: data.otpToken
                }
            })
        } catch (e: any) {

            if (typeof e === "string") {
                if (e == "NEW_PHONE_ERROR") {
                    Alert.alert(t("Nouvel appareil"), t("Nous avons remarqué que vous étiez déjà conneté sur d'autre appareil. En continuant ici vous serez déconnecté de vos autres appareils."), [
                        {
                            text: t("Annuler"),
                            isPreferred: true,
                            style: "cancel"
                        },
                        {
                            text: t("Continuer"),
                            isPreferred: true,
                            onPress: () => {
                                changeDevice.current = true
                                handleSubmit()
                            }
                        }
                    ])
                } else {
                    Toast.show({
                        text2: e,
                        type: "error"
                    })
                }
            } else {
                Toast.show({
                    text2: t("Une erreur innatendue est survenue"),
                    type: "error"
                })
            }


        }
    }

    return (
        <KeyboardAvoidingView className="flex-1 bg-white dark:bg-dark-bg" behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View className="flex-1">
                <View className="flex-1 justify-center items-center">
                    <Image
                        source={require("@/assets/images/logos/logo-with-bg.svg")}
                        style={{
                            width: 209,
                            height: 170
                        }}
                    />
                </View>
                <View className="h-[350px] p-4 justify-end">
                    <View>  
                        <Text className="text-center font-jakarta-bold text-[20px] text-dark-text dark:text-white">{t("Entrez  votre numéro de téléphone")}</Text>
                        <Text className="mt-2 text-center text-[16px] font-jakarta-medium text-dark-400  ">{t("Nous vous enverrons un code via whatsapp pour vérifier votre numéro.")}</Text>
                    </View>
                    <View className="mt-6">
                        <InputPhoneNumber
                            className="font-jakarta-semibold"
                            value={formatedPhone.current}
                            onChangeText={handleChangeText}
                            placeholder="01 91 91 91 91"
                        />
                    </View>
                    <View className="mt-6">
                        <Button.Primary
                            loading={mutation.isPending}
                            onPress={handleSubmit}
                            label="Continuer"
                        />
                    </View>
                    <View className="mt-4">
                        <Text className="text-center font-jakarta-medium text-[12px] text-dark-300 ">{t("En continuant vous accepter les ")}<Text className="font-jakarta-bold ">{t("Termes & Conditions d’utilisation.")}</Text></Text>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

