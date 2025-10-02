import { Header } from "@/components/Header";
import { Text } from "@/components/Themed";
import { theme } from "@/tailwind.config";
import { t } from "i18next";
import { useColorScheme } from "nativewind";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

export function Help() {
    const contactInfos = [
        {
            icon: (
                <Svg style={{
                    marginTop: 9
                }} width="40" height="32" viewBox="0 0 40 32" fill="none" >
                    <Path d="M25.7071 13.7071L28.3552 16.3552C28.7113 16.7113 28.7113 17.2887 28.3552 17.6448C26.43 19.57 23.3821 19.7866 21.204 18.153L19.6286 16.9714C17.885 15.6638 16.3362 14.115 15.0286 12.3714L13.847 10.796C12.2134 8.61788 12.43 5.56999 14.3552 3.64477C14.7113 3.28867 15.2887 3.28867 15.6448 3.64477L18.2929 6.29289C18.6834 6.68342 18.6834 7.31658 18.2929 7.70711L17.2717 8.72825C17.1095 8.89054 17.0692 9.13846 17.1719 9.34373C18.3585 11.7171 20.2829 13.6415 22.6563 14.8281C22.8615 14.9308 23.1095 14.8905 23.2717 14.7283L24.2929 13.7071C24.6834 13.3166 25.3166 13.3166 25.7071 13.7071Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.5" />
                </Svg>
            ),
            title: t("Appelez-nous"),
            description: "+229 01 44 78 06 17",
            onPress: () => {

            }
        },
        {
            icon: (
                <Svg width="22" height="20" viewBox="0 0 22 20" fill="none" >
                    <Path d="M16 18.5H6C3 18.5 1 17 1 13.5V6.5C1 3 3 1.5 6 1.5H16C19 1.5 21 3 21 6.5V13.5C21 17 19 18.5 16 18.5Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M16 7L12.87 9.5C11.84 10.32 10.15 10.32 9.12 9.5L6 7" stroke="#06A8C4" strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>

            ),
            title: t("Email"),
            description: "support@wawash.com",
            onPress: () => {

            }
        },
        {
            icon: (
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <Path d="M18.47 16.83L18.86 19.99C18.96 20.82 18.07 21.4 17.36 20.97L13.17 18.48C12.71 18.48 12.26 18.45 11.82 18.39C12.56 17.52 13 16.42 13 15.23C13 12.39 10.54 10.09 7.49997 10.09C6.33997 10.09 5.26997 10.42 4.37997 11C4.34997 10.75 4.33997 10.5 4.33997 10.24C4.33997 5.68999 8.28997 2 13.17 2C18.05 2 22 5.68999 22 10.24C22 12.94 20.61 15.33 18.47 16.83Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M13 15.23C13 16.42 12.56 17.52 11.82 18.39C10.83 19.59 9.26 20.36 7.5 20.36L4.89 21.91C4.45 22.18 3.89 21.81 3.95 21.3L4.2 19.33C2.86 18.4 2 16.91 2 15.23C2 13.47 2.94 11.92 4.38 11C5.27 10.42 6.34 10.09 7.5 10.09C10.54 10.09 13 12.39 13 15.23Z" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>


            ),
            title: t("Chat en direct"),
            description: "Disponible 24/7",
            onPress: () => {

            }
        }
    ]
    const faqs = [
        {
            title: t("Comment passer une commande ?"),
            description: t("Comment passer une commande Comment passer une commande ")
        },
        {
            title: t("Quels sont les délais de livraison ?"),
            description: t("Comment passer une commande Comment passer une commande ")
        },
        {
            title: t("Que faire si un article est endommagé ?"),
            description: t("Comment passer une commande Comment passer une commande ")
        },
        {
            title: t("Que faire si un article est manquant ?"),
            description: t("Comment passer une commande Comment passer une commande ")
        }
    ]
    const { colorScheme } = useColorScheme()
    const { bottom } = useSafeAreaInsets()
    return (
        <View className="bg-light dark:bg-dark-bg flex-1">
            <Header title={t("Obtenir de l’aide")} />
            <ScrollView>
                <View className="mx-4" style={{ marginBottom: bottom + 20 }}>
                    <View className="mt-8">
                        <Text className="text-[18px] font-jakarta-semibold text-dark dark:text-gray-100">{t("Besoin d'aide ? ")}</Text>
                        <Text className="mt-4 text-dark-400 text-[14px] font-jakarta dark:text-gray-200">{t("Nous sommes là pour vous aider. Trouvez des réponses rapides dans notre FAQ ou contactez-nous directement.")}</Text>
                    </View>

                    <View className="mt-12">
                        <Text className="text-[18px] font-jakarta-semibold text-dark dark:text-gray-100">{t("Contactez-nous ")}</Text>
                        <View className="mt-8 gap-y-6">
                            {
                                contactInfos.map((c) => (
                                    <View key={c.title}><ContactItem {...c} /></View>
                                ))
                            }
                        </View>
                    </View>
                    <View className="mt-12">
                        <Text className="text-[18px] font-jakarta-semibold text-dark dark:text-gray-100">{t("Questions fréquentes (FAQ)")}</Text>
                        <View className="mt-8 gap-y-6">
                            {
                                faqs.map(f => (
                                    <View key={f.title}>
                                        <Faq  {...f} />
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}
interface IContactItem {
    icon: React.ReactNode,
    title: string,
    description: string,
    onPress: () => void
}
const ContactItem = ({ icon, title, description, onPress }: IContactItem) => {
    return (
        <View>
            <TouchableOpacity
                onPress={onPress}
                style={{
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 1
                }}
                className="flex-row bg-white dark:bg-dark-lighter  gap-x-4 p-4 rounded-[15px]">
                <View className="flex-row w-[40px] h-[40px] rounded-full bg-primary/20 items-center justify-center">{icon}</View>
                <View className="flex-1">
                    <View>
                        <Text className="font-jakarta-semibold text-[14px] text-dark dark:text-gray-100">{t(title)}</Text>
                    </View>
                    <View>
                        <Text className="mt-1 font-jakarta text-[14px] text-dark-350 dark:text-gray-400">{t(description)}</Text>
                    </View>
                </View>
            </TouchableOpacity>

        </View>
    )
}
interface ICollapsiveItem {
    title: string,
    description: string,
}
const Faq = ({ title, description }: ICollapsiveItem) => {
    const [show, setShow] = React.useState(false)
    const { colorScheme } = useColorScheme()
    return (
        <TouchableOpacity onPress={() => setShow(prev => !prev)} className="bg-white dark:bg-dark-dark-bg  rounded-[15px] " style={{
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1
        }}>
            <View className="flex-row items-center p-4 ">
                <View className="flex-1 ">
                    <Text className="text-[14px] font-jakarta-semibold text-dark dark:text-gray-100">{t(title)}</Text>
                </View>
                <View>
                    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none" >
                        <Path d="M16.6 7.45831L11.1667 12.8916C10.525 13.5333 9.47502 13.5333 8.83336 12.8916L3.40002 7.45831" stroke={colorScheme == "light" ? theme.extend.colors.dark.DEFAULT : theme.extend.colors.gray[200]} strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>

                </View>
            </View>
            {
                show && (
                    <Animated.View entering={FadeInUp.duration(200)} exiting={FadeOutUp.duration(200)} className={"p-4 border-t border-gray-200 dark:border-dark-lighter"}>
                        <Text className="mt-1 font-jakarta text-[14px] text-dark-350 dark:text-gray-400">{t(description)}</Text>
                    </Animated.View>
                )
            }
        </TouchableOpacity>
    )
}