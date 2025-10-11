import { Button } from "@/components/Button";
import { Text } from "@/components/Themed";
import { SafeView } from "@/components/View";
import { useStore } from "@/store/store";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { t } from "i18next";
import { View } from "react-native";

export function Welcome() {
    const { firstname, isNewUser } = useLocalSearchParams<{ firstname: string, isNewUser: string }>()
    const user = useStore(s => s.user)
    return (
        <SafeView className="justify-center flex-1" style={{ marginTop: "-10%" }}>
            <View className="px-4 ">
                <View className=" justify-center items-center mb-10">
                    <Image
                        source={require("@/assets/images/logos/logo-with-bg.svg")}
                        style={{
                            width: 209,
                            height: 209
                        }}
                    />
                </View>
                {
                    isNewUser ? (
                        <>
                            <Text className=" text-center font-jakarta-bold text-[30px] ">{t("Bienvenue {{firstname}}", {
                                firstname
                            })}</Text>
                            <Text className="text-center mt-6 text-dark-400 text-[16px]">{t("Votre profile a été créé avec succès, vous pouvez à présent profiter de nos services de lavages.")}</Text>
                        </>
                    ) : (
                        <>
                            <Text className=" text-center font-jakarta-bold text-[30px] ">{t("Bon retour, {{firstname}}", {
                                firstname
                            })}</Text>
                            <Text className="text-center mt-6 text-dark-400 text-[16px]">{t("Nous sommes ravis de vous revoir à nouveau. Profitez de nos services de lavages.")}</Text>
                        </>
                    )
                }
            </View>
            <View className="mt-8 px-4">
                <Button.Primary onPress={() => {
                    if (user) {
                        if (user?.role == "CLEANER") {
                            router.dismissTo("/merchant/dashboard")
                        } else {
                            router.dismissTo("/client/dashboard")
                        }
                    }

                }
                } fullwidth={false} label={t("Continuer")} />
            </View>
        </SafeView>
    )
}