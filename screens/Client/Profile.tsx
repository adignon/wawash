import { Button } from "@/components/Button";
import { ProfileImage } from "@/components/ProfileImage";
import { Text } from "@/components/Themed";
import { capitalize } from "@/helpler";
import { useStore } from "@/store/store";
import { t } from "i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

export function Profile() {
    const user = useStore(s => s.user)
    const {bottom}=useSafeAreaInsets()
    return (
        <View className="gap-y-2 items-center p-6 flex-1 bg-white dark:bg-dark-bg" style={{paddingBottom:bottom}}>
            <View className="flex-1 justify-center">
                <View className="items-center">
                    <ProfileImage
                        imageUrl={user?.imageFullUrl}
                        icon={false}
                    />
                    <Text className="mt-4 font-jakarta-semibold text-[25px] text-primary dark:text-primary-500">{capitalize(user?.firstname)} {capitalize(user?.lastname)}</Text>
                </View>
                <View className="my-8 gap-y-4 items-center">
                    <Text className="font-jakarta-semibold text-[18px] text-dark dark:text-gray-100">{t("De nouvelles fonctionnalités arrivent  !")}</Text>
                    <Text className="font-jakarta text-[14px] text-dark-300 text-center dark:text-gray-200">{t("Profitez d’une expérience fluide et innovante avec nous. Partagez votre avis pendant que nous préparons la suite pour vous.")}</Text>
                </View>
                <View>
                    <Button.Primary fullwidth={false}>
                        <View>
                            <View className="flex-row items-center gap-x-4">
                                <Svg width="21" height="20" viewBox="0 0 21 20" fill="none" >
                                    <Path d="M16.1417 14.025L16.4667 16.6583C16.55 17.35 15.8084 17.8333 15.2167 17.475L11.725 15.4C11.3417 15.4 10.9667 15.375 10.6 15.325C11.2167 14.6 11.5834 13.6833 11.5834 12.6917C11.5834 10.325 9.53337 8.40838 7.00004 8.40838C6.03337 8.40838 5.14171 8.68335 4.40004 9.16669C4.37504 8.95835 4.3667 8.75001 4.3667 8.53335C4.3667 4.74168 7.65837 1.66669 11.725 1.66669C15.7917 1.66669 19.0834 4.74168 19.0834 8.53335C19.0834 10.7833 17.925 12.775 16.1417 14.025Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <Path d="M11.5832 12.6916C11.5832 13.6833 11.2165 14.6 10.5998 15.325C9.77484 16.325 8.4665 16.9666 6.99984 16.9666L4.82484 18.2583C4.45817 18.4833 3.9915 18.175 4.0415 17.75L4.24983 16.1083C3.13317 15.3333 2.4165 14.0916 2.4165 12.6916C2.4165 11.225 3.19984 9.9333 4.39984 9.16664C5.14151 8.6833 6.03317 8.40833 6.99984 8.40833C9.53317 8.40833 11.5832 10.325 11.5832 12.6916Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                                <Text className="text-center font-jakarta-medium text-[14px] text-white dark:text-white">{t("Patager mon avis")}</Text>
                            </View>
                        </View>
                    </Button.Primary>
                </View>
            </View>
        </View>
    )
}