import { getAdress } from '@/api/subscription';
import { NotificationButton } from '@/components/Header';
import { Logo } from '@/components/Logo';
import { ProfileImage } from '@/components/ProfileImage';
import { Text } from '@/components/Themed';
import { capitalize, clx } from '@/helpler';
import { country } from '@/storage/config';
import { useStore } from '@/store/store';
import { IAddress } from '@/store/type';
import { theme } from '@/tailwind.config';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from 'expo-router';
import { t } from 'i18next';
import { useColorScheme } from 'nativewind';
import { useMemo } from 'react';
import { Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from 'react-native-svg';
const fomatAdressForLocalStorage = (data:any) => ({
    ...data,
    department: data.departement,
    location: data.coord,
    addLocation: Boolean(data.coord ?? null),
    contactPhone:data.contactPhone.replace(country.prefix,'')
})
export function Dashboard() {
    const { top } = useSafeAreaInsets()
    const { colorScheme } = useColorScheme()
    const user = useStore(s => s.user)
    const storedAdress = useStore(s => s.address)
    console.log(storedAdress)
    const query = useQuery({
        queryKey: ["adress"],
        queryFn: getAdress
    })
    const adress = useMemo(() => {
        if (query.data) {
            return fomatAdressForLocalStorage(query.data)
        } else {
            return storedAdress
        }
    }, [query.data, storedAdress])
    const services = [
        {
            title: (
                <View className='w-[100px]'>
                    <Text className=' font-jakarta-semibold text-[18px] text-dark-text dark:text-white'>{t("Lessive unique")}</Text>
                </View>
            ),
            image: (
                <Image
                    className=''
                    source={require("@/assets/images/service-1.png")}
                    style={{
                        width: 93,
                        height: 110,
                        position: "absolute",
                        left: 10,
                        bottom: 0
                    }}
                />
            ),
            href: '/nolayout/client/package-details?code=lessive_unique&title=Lessive unique&unique=true' as Href,
            color: theme.extend.colors.yellow[400],
            bgColor: colorScheme == "light" ? theme.extend.colors.yellow[300] : theme.extend.colors.yellow['dark-300']
        },
        {
            title: t("Lessive par abonnement"),
            href: "/client/packages" as Href,
            image: (
                <Image
                    className='absolute -bottom-2 left-2'
                    source={require("@/assets/images/service-2.png")}
                    style={{
                        width: 141,
                        height: 112,
                        position: "absolute",
                        left: 0,
                        bottom: 0
                    }}
                />
            ),
            color: theme.extend.colors.primary[150],
            bgColor: colorScheme == "light" ? theme.extend.colors.primary[100] : theme.extend.colors.primary['dark-100']
        }
    ]
    const OptionMenus = [
        {
            title: t("Comment ça marche ?"),
            description: t("comment nous prenons en charge vos linges"),
            icon: (
                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none" >
                    <Path d="M8 15.5C12.1421 15.5 15.5 12.1421 15.5 8C15.5 3.85786 12.1421 0.5 8 0.5C3.85786 0.5 0.5 3.85786 0.5 8C0.5 12.1421 3.85786 15.5 8 15.5Z" stroke={theme.extend.colors.primary.DEFAULT} />
                    <Path d="M8 13.4166C8.23012 13.4166 8.41667 13.2301 8.41667 13C8.41667 12.7699 8.23012 12.5833 8 12.5833C7.76988 12.5833 7.58333 12.7699 7.58333 13C7.58333 13.2301 7.76988 13.4166 8 13.4166Z" fill={theme.extend.colors.primary.DEFAULT} stroke={theme.extend.colors.primary.DEFAULT} />
                    <Path d="M8 11.3333V10.1509C8 9.36406 8.5035 8.66548 9.25 8.41665C9.9965 8.16781 10.5 7.46923 10.5 6.6824V6.25472C10.5 4.91741 9.41592 3.83331 8.07858 3.83331H8C6.61925 3.83331 5.5 4.9526 5.5 6.33331" stroke={theme.extend.colors.primary.DEFAULT} />
                </Svg>

            ),
            href: "/nolayout/client/how" as Href
        },
        {
            title: t("Obtenir de l'aide"),
            description: t("Vous avez une réclamation ou avez besoin d'aide ? Notre service clientèle vous reçoit 7/7 24h/24"),
            icon: (
                <Svg width="16" height="16" viewBox="0 0 18 18" fill="none" >
                    <Path d="M4.095 13.8675V11.6775C4.095 10.95 4.665 10.2975 5.475 10.2975C6.2025 10.2975 6.855 10.8675 6.855 11.6775V13.785C6.855 15.2475 5.64 16.4625 4.1775 16.4625C2.715 16.4625 1.5 15.24 1.5 13.785V9.16498C1.4175 4.94998 4.7475 1.53748 8.9625 1.53748C13.1775 1.53748 16.5 4.94998 16.5 9.08248V13.7025C16.5 15.165 15.285 16.38 13.8225 16.38C12.36 16.38 11.145 15.165 11.145 13.7025V11.595C11.145 10.8675 11.715 10.215 12.525 10.215C13.2525 10.215 13.905 10.785 13.905 11.595V13.8675" stroke={theme.extend.colors.primary.DEFAULT} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
            ),
            href: "/nolayout/client/help" as Href
        }
    ]
    const { bottom } = useSafeAreaInsets()

    return (
        <View className='bg-primary flex-1'>
            <View className="bg-white flex-1 dark:bg-dark-bg" style={{}}>
                <View className='flex-1'>
                    <View style={{
                        borderBottomStartRadius: 30,
                        borderBottomRightRadius: 30,
                        overflow: "hidden"
                    }}>
                        <LinearGradient
                            colors={
                                colorScheme == "light" ?
                                    [
                                        '#035E6E',
                                        '#04788C',
                                        '#0589A0',
                                        '#06B6D4',
                                        '#06B6D4']
                                    :

                                    [
                                        '#012B36', // deep teal
                                        '#024450', // dark cyan
                                        '#036370', // medium teal
                                        '#048094', // brighter accent (keeps identity)
                                    ]
                            }
                            locations={[0, 0.33, 0.33, 0.57, 1]}
                            start={{ x: 0, y: 0.3 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                                paddingTop: top,

                            }}
                        >
                            <View className='px-5'>
                                <View>
                                    <View className='flex-row items-center justify-between  py-2'>
                                        <Logo />
                                        <NotificationButton count={1} />
                                    </View>
                                </View>
                                <View className=' mt-4 mb-6'>
                                    <ProfileImage
                                        imageUrl={user?.imageFullUrl}
                                        height={70}
                                        width={70}
                                        icon={false}
                                    />
                                    <View className='mt-4'>
                                        <Text className='text-[18px] font-jakarta text-white dark:text-gray-100'>{t("Bienvenue,")}</Text>
                                        <Text className='text-[25px] font-jakarta-semibold text-white'>{capitalize(user?.firstname)} {capitalize(user?.lastname)}</Text>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                    <ScrollView className='flex-1'>
                        <View style={{ marginBottom: bottom + 120 }}>
                            <View>
                                <View className='w-[250px] mx-4 mt-5'>
                                    <Text className='font-jakarta-medium text-[20px] font-dark-text dark:text-white'>
                                        {t("Que souhaitez vous faire aujourd'hui ?")}
                                    </Text>
                                </View>
                            </View>
                            <View className='flex-row items-center gap-x-6 m-4'>
                                {
                                    services.map((s, i) => (
                                        <View className='flex-1' key={i}>
                                            <ServiceCard
                                                key={i}
                                                bgColor={s.bgColor}
                                                color={s.color}
                                                title={s.title}
                                                image={s.image}
                                                href={s.href}
                                            />
                                        </View>
                                    ))
                                }
                            </View>
                            <View className='m-4'>
                                <EmplacementConfiguration adress={adress} />
                            </View>
                            <View className='gap-y-10 px-4 mt-4'>
                                <View key={"line"} className='border-t border-gray-200 dark:border-dark-lighter'></View>
                                {
                                    OptionMenus.map((o) => <View key={o.title}><OptionItem title={o.title} description={o.description} href={o.href as any} icon={o.icon} /></View>)
                                }
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    )
}
interface IServiceCard {
    image: React.ReactNode,
    title: React.ReactNode,
    containerClass?: string,
    color: string;
    bgColor: string;
    href: Href
}
const ServiceCard = ({
    containerClass,
    image,
    title,
    color,
    bgColor,
    href
}: IServiceCard) => {
    return (
        <Pressable onPress={() => router.push(href)} className={clx('p-4 overflow-hidden relative h-[170px] rounded-[20px]', containerClass)} style={{ backgroundColor: bgColor }}>
            <Text className='font-jakarta-semibold text-[18px] text-dark-text dark:text-white'>{title}</Text>
            {image}
            <View style={{ backgroundColor: color }} className='absolute bottom-5 right-5 h-[40px] w-[40px] justify-center items-center rounded-full'>
                <Svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                    <Path d="M1.68253 12.9401L6.5725 8.05007C7.15 7.47257 7.15 6.52757 6.5725 5.95007L1.68253 1.06006" stroke="#333333" strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
            </View>
        </Pressable>
    )
}

const EmplacementConfiguration = ({ adress }: { adress: IAddress }) => {
    const setAdress = useStore(s => s.setAddress)
    return (
        <TouchableOpacity onPress={() => {
            setAdress(fomatAdressForLocalStorage(adress))
            router.push("/modal/configure-adress")
        }} className='flex-row items-center bg-primary-dark dark:bg-primary-dark-dark rounded-[20px] p-4 px-5 gap-x-4'>
            <View className='w-[40px] h-[40px] bg-primary dark:bg-primary-base-dark rounded-full justify-center items-center'>
                <Svg width="20" height="21" viewBox="0 0 20 21" fill="none" >
                    <Path d="M10 11.6916C11.4359 11.6916 12.6 10.5276 12.6 9.09164C12.6 7.6557 11.4359 6.49164 10 6.49164C8.56406 6.49164 7.4 7.6557 7.4 9.09164C7.4 10.5276 8.56406 11.6916 10 11.6916Z" stroke="white" />
                    <Path d="M3.01667 7.57502C4.65833 0.358356 15.35 0.366689 16.9833 7.58336C17.9417 11.8167 15.3083 15.4 13 17.6167C11.325 19.2334 8.675 19.2334 6.99167 17.6167C4.69167 15.4 2.05833 11.8084 3.01667 7.57502Z" stroke="white" />
                </Svg>

            </View>
            <View className='gap-y-1 flex-1'>
                <Text className='font-jakarta-semibold text-[16px] text-white'>{adress ? t("Votre emplacement actuel") : t("Configurer votre emplacement ")}</Text>
                <Text className='text-[14px] text-white font-jakarta' numberOfLines={1} ellipsizeMode="tail" >{adress ? `${capitalize(adress.quartier)}, ${capitalize(adress.arrondissement)}, ${capitalize(adress.commune)}, ${capitalize(adress.departement)}` : t("Enrégistrez le lieu de récupération de vos linges")}</Text>
            </View>
            <View>
                <Svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                    <Path d="M1.00001 0.83844L5.07501 5.72842C5.55626 6.30592 6.34376 6.30592 6.82501 5.72842L10.9 0.83844" stroke={theme.extend.colors.gray[400]} stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>

            </View>
        </TouchableOpacity>
    )
}
interface IOptionItem {
    icon: React.ReactNode
    title: string,
    description: string,
    href: Href
}

export const OptionItem = ({ icon, title, description, href }: IOptionItem) => {
    return (
        <TouchableOpacity
            style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.1,
                shadowRadius: 13.6,
                elevation: 5
            }}
            className=' flex-row items-center gap-x-4 rounded-[15px] bg-white dark:bg-dark-dark-bg p-4 px-5' onPress={() => router.push(href)}>
            <View className='h-[40px] w-[40px] bg-primary/20 rounded-[10px] justify-center items-center'>{icon}</View>
            <View className='gap-y-1 flex-1'>
                <Text className='font-jakarta-semibold text-[16px] text-dark dark:text-white'>{t(title)}</Text>
                <Text className='text-[14px] text-dark-350 font-jakarta'>{t(description)}</Text>
            </View>
            <View className='h-[30px] w-[30px] justify-center items-center rounded-full bg-primary/20'>
                <Svg width="7" height="12" viewBox="0 0 7 12" fill="none" >
                    <Path d="M1 10.9L5.88998 6.82501C6.46748 6.34376 6.46748 5.55626 5.88998 5.07501L1 1" stroke={theme.extend.colors.primary.DEFAULT} stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>

            </View>
        </TouchableOpacity>
    )
}