import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Text } from "@/components/Themed";
import { clx } from "@/helpler";
import { theme } from "@/tailwind.config";
import { Image } from "expo-image";
import { router } from "expo-router";
import { t } from "i18next";
import { useColorScheme } from "nativewind";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Line, Path } from "react-native-svg";
'bg-[#7CCCD8]/25'
'bg-[#FFCEA6]/25'
'bg-[#56EF89]/20'
'bg-[#FFF0C3]'
'bg-[#481CDA]/15'
export function How() {
    const { colorScheme } = useColorScheme()
    const hows = [
        {
            title: t("1. Commande & Planification"),
            description: t("Abonnez-vous ou commandez à la volée, puis planifiez une heure de collecte qui vous convient."),
            icon: (
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <Path d="M9.62 16L11.12 17.5L14.37 14.5" stroke={colorScheme == "light" ? "white" : theme.extend.colors.gray[100]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M8.81 2L5.19 5.63" stroke={colorScheme == "light" ? "white" : theme.extend.colors.gray[100]} strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M15.19 2L18.81 5.63" stroke={colorScheme == "light" ? "white" : theme.extend.colors.gray[100]} strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M2 7.85001C2 6.00001 2.99 5.85001 4.22 5.85001H19.78C21.01 5.85001 22 6.00001 22 7.85001C22 10 21.01 9.85001 19.78 9.85001H4.22C2.99 9.85001 2 10 2 7.85001Z" stroke={colorScheme == "light" ? "white" : theme.extend.colors.gray[100]} strokeWidth="1.5" />
                    <Path d="M3.5 10L4.91 18.64C5.23 20.58 6 22 8.86 22H14.89C18 22 18.46 20.64 18.82 18.76L20.5 10" stroke={colorScheme == "light" ? "white" : theme.extend.colors.gray[100]} strokeWidth="1.5" strokeLinecap="round" />
                </Svg>

            ),
            image: <Image
                source={require("@/assets/images/how-1.png")}
                style={{
                    height: 170,
                    width: 112,
                    position: "absolute",
                    bottom: -7,
                    left: "50%",
                    transform: [{ translateX: "-50%" }]
                }}
            />,
            bgColorClassName: "bg-[#7CCCD8]/25"
        },
        {
            title: t("2. Préparation pour la Collecte"),
            description: t("Préparez vos linges. Un de nos blanchisseurs viendra les chercher à l'heure convenue."),
            icon: (
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" >
                    <Path d="M3.17004 7.44L12 12.55L20.77 7.46997" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M12 21.61V12.54" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M9.92999 2.48L4.59 5.45003C3.38 6.12003 2.39001 7.80001 2.39001 9.18001V14.83C2.39001 16.21 3.38 17.89 4.59 18.56L9.92999 21.53C11.07 22.16 12.94 22.16 14.08 21.53L19.42 18.56C20.63 17.89 21.62 16.21 21.62 14.83V9.18001C21.62 7.80001 20.63 6.12003 19.42 5.45003L14.08 2.48C12.93 1.84 11.07 1.84 9.92999 2.48Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M17 13.24V9.58002L7.51001 4.09998" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
            ),
            image: <Image
                source={require("@/assets/images/how-2.png")}
                style={{
                    height: 195,
                    width: 95,
                    position: "absolute",
                    bottom: -5,
                    left: "50%",
                    transform: [{ translateX: "-50%" }]
                }}
            />,
            bgColorClassName: "bg-[#FFCEA6]/25"
        },
        {
            title: t("3. Lavage Professionnel"),
            description: t("Nos experts blanchisseurs lavent vos vêtements avec soin, en utilisant des produits de qualité supérieure."),
            icon: (
                <Svg width="21" height="18" viewBox="0 0 21 18" fill="none" >
                    <Path fillRule="evenodd" clipRule="evenodd" d="M0 0.211678L2.77268 16.1073V18H18.2273V16.1073L21 0.211678L19.782 0L19.4046 2.16341C18.6244 2.69196 17.5716 2.94511 16.5464 2.66271C16.1653 2.55775 15.1177 2.09097 14.4947 1.78006L14.1739 1.61992L13.8754 1.81855C12.9458 2.43713 12.0769 2.99307 10.8183 2.99307C9.56193 2.99307 8.54704 2.35093 7.7654 1.8214L7.40679 1.57846L7.05573 1.83215C6.62063 2.14655 5.42497 2.77581 4.61608 3.01936C4.201 3.14434 3.53119 3.21835 2.87181 3.21736C2.54794 3.21687 2.24419 3.19824 1.99382 3.16368C1.90397 3.15128 1.82727 3.13763 1.76295 3.12389L1.21805 0L0 0.211678ZM1.98661 4.40614L4.00905 16.0006V16.7659H16.991V16.0006L19.1388 3.68716C18.2593 4.02906 17.2379 4.1334 16.2175 3.85232C15.7846 3.73308 14.8996 3.34389 14.265 3.04125C13.3916 3.61196 12.3137 4.22715 10.8183 4.22715C9.37236 4.22715 8.20731 3.5862 7.41444 3.07126C6.77144 3.46162 5.7481 3.96752 4.97314 4.20086C4.39454 4.37507 3.58926 4.45252 2.86995 4.45143C2.5652 4.45098 2.26323 4.43644 1.98661 4.40614ZM9.27279 11.1067C9.27279 11.7883 8.71925 12.3408 8.03642 12.3408C7.35359 12.3408 6.80005 11.7883 6.80005 11.1067C6.80005 10.4252 7.35359 9.87264 8.03642 9.87264C8.71925 9.87264 9.27279 10.4252 9.27279 11.1067ZM12.9819 12.3408C13.6647 12.3408 14.2183 11.7883 14.2183 11.1067C14.2183 10.4252 13.6647 9.87264 12.9819 9.87264C12.2991 9.87264 11.7455 10.4252 11.7455 11.1067C11.7455 11.7883 12.2991 12.3408 12.9819 12.3408Z" fill="white" />
                </Svg>

            ),
            image: <Image
                source={require("@/assets/images/how-3.png")}
                style={{
                    height: 197,
                    width: 197,
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: [{ translateX: "-50%" }]
                }}
            />,
            bgColorClassName: "bg-[#56EF89]/20"
        },
        {
            title: t("4. Séchage et Emballage"),
            description: t("Vos linges sont séchés, pliés (ou mis sur cintre) et emballés avec soin."),
            icon: (
                <Svg width="22" height="24" viewBox="0 0 22 24" fill="none" >
                    <Path d="M19.82 11.2545L12.1667 7.84785V6.16785C12.1667 5.52619 11.6417 5.00119 11 5.00119C10.3583 5.00119 9.83333 4.47619 9.83333 3.83452C9.83333 3.19285 10.3583 2.66785 11 2.66785C11.6417 2.66785 12.1667 3.19285 12.1667 3.83452H14.5C14.5 1.68785 12.5633 -0.0154809 10.3467 0.392852C8.97 0.649519 7.83833 1.75785 7.57 3.13452C7.22 4.95452 8.27 6.56452 9.83333 7.12452V7.85952L2.18 11.2662C1.15333 11.7095 0.5 12.7245 0.5 13.8329V13.8445C0.5 15.4079 1.76 16.6679 3.32333 16.6679H5.16667V23.6679H16.8333V16.6679H18.6767C20.24 16.6679 21.5 15.4079 21.5 13.8445V13.8329C21.5 12.7245 20.8467 11.7095 19.82 11.2545ZM14.5 21.3345H7.5V15.5012H14.5V21.3345ZM18.6767 14.3345H16.8333V13.1679H5.16667V14.3345H3.32333C2.78667 14.3345 2.64667 13.5762 3.125 13.3895L11 9.88952L18.875 13.3895C19.365 13.6112 19.2017 14.3345 18.6767 14.3345Z" fill="white" />
                </Svg>


            ),
            image: <Image
                source={require("@/assets/images/how-4.png")}
                style={{
                    height: 196,
                    width: 196,
                    position: "absolute",
                    bottom: -15,
                    left: "50%",
                    transform: [{ translateX: "-50%" }]
                }}
            />,
            bgColorClassName: "bg-[#FFF0C3]"
        },
        {
            title: t("5. Livraison à Domicile"),
            description: t("Recevez vos vêtements propres et frais à votre porte, prêts à être portés."),
            icon: (
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" >
                    <Path d="M12 14H13C14.1 14 15 13.1 15 12V2H6C4.5 2 3.19001 2.82999 2.51001 4.04999" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M2 17C2 18.66 3.34 20 5 20H6C6 18.9 6.9 18 8 18C9.1 18 10 18.9 10 20H14C14 18.9 14.9 18 16 18C17.1 18 18 18.9 18 20H19C20.66 20 22 18.66 22 17V14H19C18.45 14 18 13.55 18 13V10C18 9.45 18.45 9 19 9H20.29L18.58 6.01001C18.22 5.39001 17.56 5 16.84 5H15V12C15 13.1 14.1 14 13 14H12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M8 22C9.10457 22 10 21.1046 10 20C10 18.8954 9.10457 18 8 18C6.89543 18 6 18.8954 6 20C6 21.1046 6.89543 22 8 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M16 22C17.1046 22 18 21.1046 18 20C18 18.8954 17.1046 18 16 18C14.8954 18 14 18.8954 14 20C14 21.1046 14.8954 22 16 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M22 12V14H19C18.45 14 18 13.55 18 13V10C18 9.45 18.45 9 19 9H20.29L22 12Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M2 8H8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M2 11H6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M2 14H4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>



            ),
            image: <Image
                source={require("@/assets/images/how-5.png")}
                style={{
                    height: 158,
                    width: 191,
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: [{ translateX: "-50%" }]
                }}
            />,
            bgColorClassName: "bg-[#481CDA]/15"
        }
    ]
    const { bottom } = useSafeAreaInsets()
    return (
        <View className="bg-light dark:bg-dark-bg flex-1" >
            <Header title={t("Comment ça marche ?")} />
            <ScrollView className="flex-1">
                <View className="absolute left-11 top-[80px]">
                    <Svg width="2" height="1180" viewBox="0 0 2 1250" fill="none">
                        <Line x1="1.00806" y1="1250.01" x2="1.00806" y2="-0.0051539" stroke="#06ADC9" strokeDasharray="10 10" />
                    </Svg>

                </View>
                <View className="mt-4" style={{ marginBottom: bottom + 20 }}>
                    {
                        hows.map((h) =>
                            <View key={h.title} className="p-4">
                                <HowSection  {...h} />
                            </View>
                        )
                    }
                    <View className="mx-4 mt-6">
                        <Button.Primary onPress={()=>router.push("/client/packages")} className="bg-primary-dark" label={t("Commander maintenant")} />
                    </View>
                </View>

            </ScrollView>

        </View>
    )
}
interface IHowProps {
    icon: React.ReactNode,
    image: React.ReactNode,
    title: string,
    description: string,
    bgColorClassName: string
}
const HowSection = ({ icon, title, description, bgColorClassName, image }: IHowProps) => {
    return (
        <View>
            <View className="flex-row items-start gap-x-6 ">
                <View className="justify-center items-center w-[50px] rounded-full bg-primary dark:bg-primary-base-dark h-[50px]">
                    {icon}
                </View>
                <View className="flex-1 ">
                    <View className="gap-y-3">
                        <Text className="text-[18px] text-dark dark:text-white font-jakarta-semibold">{t(title)}</Text>
                        <Text className="text-[14px] font-jakarta text-dark dark">{description}</Text>
                    </View>
                    <View className={clx("mt-6 relative h-[175px] rounded-[30px]", bgColorClassName)}>
                        {image}
                    </View>
                </View>

            </View>
        </View>
    )

}
